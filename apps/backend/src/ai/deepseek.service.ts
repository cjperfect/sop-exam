/**
 * DeepSeek AI 服务 — 封装 OpenAI SDK，提供流式与非流式 chat
 *
 * 模型: deepseek-v4-flash
 * 流式原理: stream: true → for await 逐 chunk 消费 → 按 \\n 拆行 yield
 */
import { Injectable, Logger } from '@nestjs/common'
import OpenAI from 'openai'

/** 流式输出事件 — message=原始文本片段, line=完整 JSON 行 */
export type StreamEvent = { type: 'message'; text: string } | { type: 'line'; text: string }

@Injectable()
export class DeepSeekService {
  private readonly logger = new Logger(DeepSeekService.name)
  private readonly client: OpenAI

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY is not set — AI features will not work')
    }
    this.client = new OpenAI({
      apiKey: apiKey || 'dummy-key',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      timeout: 60_000,
      maxRetries: 1,
    })
  }

  get isConfigured(): boolean {
    return !!process.env.DEEPSEEK_API_KEY
  }

  /** 非流式 chat — 等待完整响应后返回（用于学习建议等一次性问答） */
  async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'deepseek-v4-flash',
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })
    return response.choices[0]?.message?.content?.trim() ?? ''
  }

  /** 流式生成 — 逐 chunk 产出 message 和 line 事件 */
  async *streamChat(systemPrompt: string, userPrompt: string): AsyncGenerator<StreamEvent> {
    const stream = await this.client.chat.completions.create({
      model: 'deepseek-v4-flash',
      temperature: 0.7,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
    })

    let buffer = ''
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta as Record<string, unknown> | undefined
      if (!delta) continue

      // 思考过程 / 正文内容 都作为 message 推送
      const reasoning = delta.reasoning_content as string | undefined
      const content = delta.content as string | undefined
      const text = content || reasoning
      if (!text) continue

      yield { type: 'message', text }

      // 只有正文内容（content）才用于解析 JSON 行
      if (!content) continue

      buffer += content
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed) yield { type: 'line', text: trimmed }
      }
    }
    if (buffer.trim()) {
      yield { type: 'line', text: buffer.trim() }
    }
  }
}
