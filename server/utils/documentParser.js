import mammoth from 'mammoth'
import XLSX from 'xlsx'

const MAX_CHARS = 120000

const truncate = (text) => {
    const clean = String(text || '').replace(/\u0000/g, '').trim()
    if (clean.length <= MAX_CHARS) return clean
    return `${clean.slice(0, MAX_CHARS)}\n\n[Document truncated after ${MAX_CHARS} characters]`
}

const stripHtml = (html) => String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const parsePdf = async (buffer) => {
    // Loaded lazily so the (heavy) pdf.js bundle only loads when used.
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const pdf = await getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        isEvalSupported: false,
    }).promise

    let text = ''
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber)
        const content = await page.getTextContent()
        text += content.items.map(item => item.str).join(' ') + '\n'
    }
    return text
}

const parseSpreadsheet = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    return workbook.SheetNames
        .map(name => `# Sheet: ${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name], { blankrows: false })}`)
        .join('\n\n')
}

const isTextFile = (mimetype, name) =>
    ['text/plain', 'text/csv', 'application/json', 'text/html', 'application/xml', 'text/xml', 'text/markdown']
        .includes(mimetype) || /\.(txt|csv|json|html?|xml|md|log)$/i.test(name)

const isHtml = (mimetype, name) => mimetype === 'text/html' || /\.html?$/i.test(name)

export const parseDocument = async ({ buffer, mimetype, originalname = '' }) => {
    if (!buffer?.length) throw new Error('The uploaded file is empty')

    if (mimetype === 'application/pdf' || /\.pdf$/i.test(originalname)) {
        return truncate(await parsePdf(buffer))
    }
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || /\.docx$/i.test(originalname)) {
        const { value } = await mammoth.extractRawText({ buffer })
        return truncate(value)
    }
    if (
        mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimetype === 'application/vnd.ms-excel' ||
        /\.(xlsx|xls)$/i.test(originalname)
    ) {
        return truncate(parseSpreadsheet(buffer))
    }
    if (isTextFile(mimetype, originalname)) {
        const raw = buffer.toString('utf8')
        return truncate(isHtml(mimetype, originalname) ? stripHtml(raw) : raw)
    }

    throw new Error('Unsupported file type. Upload a PDF, Word (docx), Excel, or text file.')
}
