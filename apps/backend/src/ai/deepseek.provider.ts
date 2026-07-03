import { Provider } from '@nestjs/common'
import OpenAI from 'openai'

export const DEEPSEEK_SERVICE = 'DEEPSEEK_SERVICE'

export const DeepSeekProvider: Provider = {
  provide: DEEPSEEK_SERVICE,
  useFactory: () => {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      console.warn('[AiModule] DEEPSEEK_API_KEY is not set — AI features will use mock fallback')
    }
    return new OpenAI({
      apiKey: apiKey || 'dummy-key',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      timeout: 30_000,
      maxRetries: 1,
    })
  },
}

/** 是否已配置 DeepSeek API Key */
export function isDeepSeekConfigured(): boolean {
  return !!process.env.DEEPSEEK_API_KEY
}
