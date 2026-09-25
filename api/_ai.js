// The website chat's AI. Picks a provider from whichever key is set in Vercel:
//   GEMINI_API_KEY     → Google Gemini (free tier available). Model: GEMINI_MODEL, default gemini-3.8-flash
//   ANTHROPIC_API_KEY  → Claude. Model: CHAT_MODEL, default claude-opus-5
// With neither key, there is no AI: visitors chat with Justin directly.
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import { CHAT_SYSTEM_PROMPT } from './_chatPrompt.js'

export const FALLBACK_REPLY = "Sorry, I can't help with that here. For anything about your vehicle, call Justin on +976 8885 6529."

export function aiProvider() {
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.ANTHROPIC_API_KEY) return 'claude'
  return null
}

export const aiConfigured = () => aiProvider() !== null

// history: [{ role: 'user' | 'assistant', content: string }], starting with 'user' and ending with 'user'.
export async function askAI(history) {
  return aiProvider() === 'gemini' ? askGemini(history) : askClaude(history)
}

let gemini
async function askGemini(history) {
  gemini ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash'
  const response = await gemini.models.generateContent({
    model,
    contents: history.map((message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    })),
    config: {
      systemInstruction: CHAT_SYSTEM_PROMPT,
      maxOutputTokens: 1024,
      // Gemini 3 models: little thinking keeps short chat replies fast and within free-tier limits.
      ...(model.startsWith('gemini-3') ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
    },
  })
  // No text means the answer was blocked or empty; fall back to a safe reply.
  return response.text?.trim() || FALLBACK_REPLY
}

let claude
async function askClaude(history) {
  claude ??= new Anthropic()
  const model = process.env.CHAT_MODEL || 'claude-opus-5'
  const request = {
    model,
    max_tokens: 4000,
    system: [{ type: 'text', text: CHAT_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: history,
  }

  // Opus 5: low effort suits short chat replies; server-side fallbacks retry on another model if one declines.
  const response = model.startsWith('claude-opus-5')
    ? await claude.beta.messages.create({
        ...request,
        output_config: { effort: 'low' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      })
    : await claude.messages.create(request)

  if (response.stop_reason === 'refusal') return FALLBACK_REPLY
  const reply = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim()
  return reply || FALLBACK_REPLY
}
