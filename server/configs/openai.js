import {OpenAI} from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENCODE_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://opencode.ai/inference/go/openai/v1",
    // Don't let a dead connection hang a request for minutes.
    timeout: 45_000,
    maxRetries: 1,
    defaultHeaders: {
        // OpenCode Go asks clients to identify themselves with their own
        // user agent instead of a generic SDK name.
        'User-Agent': 'Chatyy/1.0',
    },
});

export default openai
