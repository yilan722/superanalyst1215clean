/**
 * Qwen3Max API客户端 - 深度推理和分析
 * 从Python转换而来，使用fetch实现
 */
interface QwenMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface QwenChatOptions {
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

interface QwenChatResult {
  content?: string
  status: 'success' | 'error'
  error?: string
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

import { QWEN_CONFIG } from './report-generation-config'

export class QwenClient {
  private apiKey: string
  private apiUrl: string
  private model: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || QWEN_CONFIG.apiKey
    this.apiUrl = QWEN_CONFIG.apiUrl
    this.model = QWEN_CONFIG.model
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * 与Qwen3Max进行对话
   */
  async chat(
    messages: QwenMessage[],
    options: QwenChatOptions = {}
  ): Promise<QwenChatResult> {
    const { temperature = 0.7, maxTokens = 4000, systemPrompt } = options

    // 如果提供了系统提示词，插入到消息开头
    const finalMessages: QwenMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages

    const payload = {
      model: this.model,
      messages: finalMessages,
      temperature,
      max_tokens: maxTokens
    }

    // 根据maxTokens动态调整超时时间
    // 16000 tokens大约需要10-15分钟，设置更长的超时时间
    const timeoutSeconds = Math.max(600, Math.floor(maxTokens / 20)) * 1000 // 转换为毫秒

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds)

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.status === 200) {
        const result = await response.json()
        return {
          content: result.choices[0].message.content,
          status: 'success',
          usage: result.usage || {}
        }
      } else {
        // 解析错误信息
        let errorMsg = `API错误 ${response.status}`
        try {
          const errorJson = await response.json()
          if (errorJson.error) {
            const errorDetail = errorJson.error
            const errorMessage = errorDetail.message || ''
            const errorCode = errorDetail.code || ''

            // 处理额度不足的情况
            if (response.status === 403 && errorCode.includes('insufficient_user_quota')) {
              errorMsg = `API额度不足: ${errorMessage}\n\n` +
                `💡 可能的原因：\n` +
                `1. API计费可能有延迟，请稍后重试\n` +
                `2. 请检查API密钥是否正确\n` +
                `3. 请登录API服务商控制台查看实际余额\n` +
                `4. 如果余额充足，可能是API服务商的计费系统问题\n\n` +
                `🔧 建议操作：\n` +
                `- 等待几分钟后重试\n` +
                `- 检查API服务商控制台的余额和账单\n` +
                `- 确认使用的是正确的API密钥`
            } else {
              errorMsg = `API错误 ${response.status}: ${errorMessage}`
            }
          }
        } catch {
          // 如果无法解析JSON，使用原始错误信息
          const errorText = await response.text()
          errorMsg = `API错误 ${response.status}: ${errorText.substring(0, 200)}`
        }

        return {
          error: errorMsg,
          status: 'error'
        }
      }
    } catch (error: any) {
      let errorMsg = '未知错误'

      if (error.name === 'AbortError') {
        errorMsg = `请求超时（${timeoutSeconds / 1000}秒）: ${error.message}\n\n` +
          `💡 可能的原因：\n` +
          `1. 生成内容过长（max_tokens=${maxTokens}），需要更长时间\n` +
          `2. API服务器响应较慢\n` +
          `3. 网络连接不稳定\n\n` +
          `🔧 建议操作：\n` +
          `- 尝试减少maxTokens参数\n` +
          `- 检查网络连接\n` +
          `- 稍后重试`
      } else if (error.message) {
        errorMsg = error.message
      }

      return {
        error: errorMsg,
        status: 'error'
      }
    }
  }

  /**
   * 简单的单次提示（便捷方法）
   */
  async simplePrompt(
    prompt: string,
    options: QwenChatOptions = {}
  ): Promise<string> {
    const messages: QwenMessage[] = [{ role: 'user', content: prompt }]
    const result = await this.chat(messages, options)

    if (result.status === 'success' && result.content) {
      return result.content
    } else {
      throw new Error(`Qwen API调用失败: ${result.error || '未知错误'}`)
    }
  }
}

