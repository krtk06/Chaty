import {OpenAI} from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENCODE_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: "https://opencode.ai/zen/go/v1"
});

export default openai