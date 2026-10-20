import axios from 'axios'
import { OpenAI } from 'openai'

// Image generation is provider-based: every provider has its own quota, and
// they can run out independently. This module tries the configured providers in
// order and returns the first successful image.
//
//   IMAGE_PROVIDER=auto        (default) try imagekit -> gemini -> openai
//   IMAGE_PROVIDER=imagekit    only ImageKit AI generation
//   IMAGE_PROVIDER=gemini      only Google Gemini image models
//   IMAGE_PROVIDER=openai      only OpenAI images API

const PROVIDER_ORDER = {
    auto: ['imagekit', 'gemini', 'openai'],
    imagekit: ['imagekit'],
    gemini: ['gemini'],
    openai: ['openai'],
}

const GEMINI_IMAGE_MODELS = (process.env.GEMINI_IMAGE_MODELS || 'gemini-3.1-flash-image,gemini-2.5-flash-image')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)

const GEMINI_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta/models'

export class ImageProviderError extends Error {
    constructor(message, { provider, quota = false, status = null } = {}) {
        super(message)
        this.provider = provider
        this.quota = quota
        this.status = status
    }
}

const isQuotaResponse = (status, body) =>
    status === 429 || (status === 403 && /limit exceeded|quota|billing|upgrade|not enough/i.test(body || ''))

const readBody = (data) => {
    if (typeof data === 'string') return data
    if (Buffer.isBuffer(data)) return data.toString('utf8')
    if (data) {
        try { return JSON.stringify(data) } catch { return '' }
    }
    return ''
}

// --- ImageKit ---------------------------------------------------------------
// ImageKit renders asynchronously: the first request may hold the connection
// while the image is generated, later polls return "still preparing".
const generateViaImageKit = async (prompt) => {
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT
    if (!endpoint) throw new ImageProviderError('ImageKit is not configured', { provider: 'imagekit' })

    const url = `${endpoint}/ik-genimg-prompt-${encodeURIComponent(prompt)}/Chaty/${Date.now()}.png?tr=w-800,h-800`
    const deadline = Date.now() + 90_000

    for (let attempt = 0; attempt < 12 && Date.now() < deadline; attempt++) {
        try {
            const timeout = attempt === 0 ? 45_000 : 12_000
            const response = await axios.get(url, { responseType: 'arraybuffer', timeout })
            const contentType = response.headers['content-type'] || ''
            if (contentType.startsWith('image/')) {
                return { buffer: Buffer.from(response.data), mimeType: contentType }
            }
        } catch (error) {
            const status = error.response?.status ?? null
            const body = readBody(error.response?.data)
            if (status && status >= 400 && status < 500) {
                throw new ImageProviderError(
                    `ImageKit rejected the request (${status}): ${body.replace(/\s+/g, ' ').trim().slice(0, 200)}`,
                    { provider: 'imagekit', quota: isQuotaResponse(status, body), status },
                )
            }
            console.error(`[image:imagekit] attempt ${attempt + 1} failed:`, error.code || error.message)
        }
        await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    throw new ImageProviderError('ImageKit did not return an image in time', { provider: 'imagekit' })
}

// --- Google Gemini ----------------------------------------------------------
const generateViaGemini = async (prompt) => {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new ImageProviderError('Gemini is not configured', { provider: 'gemini' })

    let lastError = null
    for (const model of GEMINI_IMAGE_MODELS) {
        try {
            const response = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
                }),
                signal: AbortSignal.timeout(120_000),
            })

            if (!response.ok) {
                const body = readBody(await response.text())
                lastError = new ImageProviderError(
                    `Gemini ${model} failed (${response.status}): ${body.replace(/\s+/g, ' ').trim().slice(0, 200)}`,
                    { provider: 'gemini', quota: isQuotaResponse(response.status, body), status: response.status },
                )
                // A quota error applies to every model on the key - stop early.
                if (lastError.quota) throw lastError
                continue
            }

            const data = await response.json()
            const parts = data.candidates?.[0]?.content?.parts || []
            const imagePart = parts.find((part) => part.inlineData?.data)
            if (imagePart) {
                return {
                    buffer: Buffer.from(imagePart.inlineData.data, 'base64'),
                    mimeType: imagePart.inlineData.mimeType || 'image/png',
                    model,
                }
            }
            lastError = new ImageProviderError(`Gemini ${model} returned no image`, { provider: 'gemini' })
        } catch (error) {
            if (error instanceof ImageProviderError) throw error
            lastError = new ImageProviderError(`Gemini ${model} failed: ${error.message}`, { provider: 'gemini' })
        }
    }
    throw lastError || new ImageProviderError('Gemini is not configured', { provider: 'gemini' })
}

// --- OpenAI -----------------------------------------------------------------
const generateViaOpenAI = async (prompt) => {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new ImageProviderError('OpenAI is not configured', { provider: 'openai' })

    const client = new OpenAI({ apiKey, timeout: 120_000, maxRetries: 1 })
    try {
        const result = await client.images.generate({
            model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
            prompt,
            size: '1024x1024',
        })
        const b64 = result?.data?.[0]?.b64_json
        if (!b64) throw new ImageProviderError('OpenAI returned no image', { provider: 'openai' })
        return { buffer: Buffer.from(b64, 'base64'), mimeType: 'image/png' }
    } catch (error) {
        const status = error?.status ?? null
        const body = readBody(error?.response?.data) || error?.message || ''
        throw new ImageProviderError(`OpenAI failed: ${body.slice(0, 200)}`, {
            provider: 'openai',
            quota: isQuotaResponse(status, body),
            status,
        })
    }
}

const PROVIDERS = {
    imagekit: generateViaImageKit,
    gemini: generateViaGemini,
    openai: generateViaOpenAI,
}

// A provider without credentials is skipped, not treated as a failure.
const isConfigured = {
    imagekit: () => Boolean(process.env.IMAGEKIT_URL_ENDPOINT),
    gemini: () => Boolean(process.env.GEMINI_API_KEY),
    openai: () => Boolean(process.env.OPENAI_API_KEY),
}

// Try every configured provider until one returns an image.
export const generateImage = async (prompt) => {
    const order = PROVIDER_ORDER[process.env.IMAGE_PROVIDER || 'auto'] || PROVIDER_ORDER.auto
    const failures = []

    for (const name of order) {
        const provider = PROVIDERS[name]
        if (!provider) continue
        if (!isConfigured[name]()) {
            console.log(`[image] provider ${name} is not configured, skipping`)
            continue
        }
        try {
            const result = await provider(prompt)
            console.log(`[image] generated via ${name}`)
            return { ...result, provider: name }
        } catch (error) {
            failures.push(error)
            console.error(`[image] provider ${name} failed:`, error.message)
            // A quota/permission problem will not fix itself for the next
            // provider either, but the others may still have quota left.
        }
    }

    if (failures.length === 0) {
        throw new ImageProviderError('No image provider is configured', { provider: 'all' })
    }

    const quotaBlocked = failures.every((f) => f.quota)
    const summary = failures.map((f) => `${f.provider}: ${f.message}`).join(' | ')
    throw new ImageProviderError(
        quotaBlocked
            ? 'All configured image providers are out of quota'
            : 'No image provider could generate an image',
        { provider: 'all', quota: quotaBlocked, status: failures[0]?.status ?? null, details: summary },
    )
}
