import type { SupportedLanguage } from '@/src/types/i18n'

/**
 * 清除文本中的控制标记 [Sort:数字]、[Link:...] 和 [Show]
 * @param text 包含控制标记的文本
 * @returns 清除标记后的文本
 */
export function cleanControlTags(text: string): string {
  if (!text) return ''
  return text
    .replace(/\[Sort:\d+\]/g, '')
    .replace(/\[Link:[^\]]+\]/g, '')
    .replace(/\[Show\]/gi, '')
    .trim()
}

/**
 * 多语言属性标记的正则表达式（用于简单单行内容）
 * 匹配格式: [lang:text="内容"] 例如 [zh:text="中文内容"] [en:text="English content"]
 */
const SIMPLE_LOCALE_TAG_REGEX = /\[(\w+):text="([^"]+)"\]/g

/**
 * 解析多语言标记，支持多行内容
 * 通过查找 [lang:text=" 开始标记，然后向后搜索对应的 "] 结束标记
 */
function parseLocaleTags(text: string): {
  tags: Record<string, string>
  duplicates: Set<string>
} {
  const tags: Record<string, string> = {}
  const duplicates = new Set<string>()

  // 匹配 [lang:text=" 的模式
  const startPattern = /\[(\w+):text="/g
  let match: RegExpExecArray | null

  while ((match = startPattern.exec(text)) !== null) {
    const lang = match[1]
    const contentStart = match.index + match[0].length

    // 从 contentStart 开始，找到对应的 "] 结束标记
    // 需要找到 "] 后面跟着空白、[ 或字符串结尾的位置
    let endIndex = -1
    let searchPos = contentStart

    while (searchPos < text.length) {
      const closePos = text.indexOf('"]', searchPos)
      if (closePos === -1) break

      // 检查 "] 后面的字符
      const afterClose = closePos + 2
      if (
        afterClose >= text.length || // 字符串结尾
        text[afterClose] === '\n' || // 换行
        text[afterClose] === '\r' || // 回车
        text[afterClose] === ' ' || // 空格
        text[afterClose] === '\t' || // Tab
        text[afterClose] === '[' // 下一个标记开始
      ) {
        endIndex = closePos
        break
      }
      // 继续搜索下一个 "]
      searchPos = closePos + 1
    }

    if (endIndex !== -1) {
      const content = text.substring(contentStart, endIndex)
      if (lang in tags) {
        duplicates.add(lang)
      }
      tags[lang] = content

      // 更新 startPattern 的 lastIndex，跳过已解析的内容
      startPattern.lastIndex = endIndex + 2
    }
  }

  return { tags, duplicates }
}

/**
 * 从字符串中提取所有语言属性标记
 * @param text 包含语言标记的文本
 * @returns 语言到文本的映射对象，以及是否存在重复标记
 */
function extractLocaleTags(text: string): {
  tags: Record<string, string>
  duplicates: Set<string>
} {
  // 先尝试简单正则（适用于单行内容）
  const simpleTags: Record<string, string> = {}
  const simpleDuplicates = new Set<string>()

  SIMPLE_LOCALE_TAG_REGEX.lastIndex = 0
  let simpleMatch: RegExpExecArray | null

  while ((simpleMatch = SIMPLE_LOCALE_TAG_REGEX.exec(text)) !== null) {
    const [, lang, content] = simpleMatch
    if (lang in simpleTags) {
      simpleDuplicates.add(lang)
    }
    simpleTags[lang] = content
  }

  // 如果简单正则找到了标记，使用它的结果
  if (Object.keys(simpleTags).length > 0) {
    return { tags: simpleTags, duplicates: simpleDuplicates }
  }

  // 否则使用复杂解析（适用于多行内容）
  return parseLocaleTags(text)
}

/**
 * 清除文本中的所有语言属性标记
 * @param text 包含语言标记的文本
 * @returns 清除标记后的文本
 */
function cleanLocaleTags(text: string): string {
  // 先尝试简单正则清除
  let result = text.replace(SIMPLE_LOCALE_TAG_REGEX, '')

  // 如果还有多行标记，手动清除
  const startPattern = /\[(\w+):text="/g
  let match: RegExpExecArray | null

  while ((match = startPattern.exec(result)) !== null) {
    const tagStart = match.index
    const contentStart = tagStart + match[0].length
    let endIndex = -1
    let searchPos = contentStart

    while (searchPos < result.length) {
      const closePos = result.indexOf('"]', searchPos)
      if (closePos === -1) break

      const afterClose = closePos + 2
      if (
        afterClose >= result.length ||
        result[afterClose] === '\n' ||
        result[afterClose] === '\r' ||
        result[afterClose] === ' ' ||
        result[afterClose] === '\t' ||
        result[afterClose] === '['
      ) {
        endIndex = closePos
        break
      }
      searchPos = closePos + 1
    }

    if (endIndex !== -1) {
      // 删除整个标记 [lang:text="..."]
      result = result.substring(0, tagStart) + result.substring(endIndex + 2)
      startPattern.lastIndex = tagStart // 重置位置继续搜索
    }
  }

  return result.trim()
}

/**
 * 处理包含语言属性标记的字符串
 * 如果存在当前语言的标记且不重复，则返回该标记的内容
 * 如果存在重复的当前语言标记，或没有匹配的语言标记，则返回清除标记后的原始内容
 *
 * @param text 包含语言标记的文本
 * @param language 当前语言
 * @returns 处理后的文本
 *
 * @example
 * // 当 language 为 'zh' 时
 * processLocaleString('Hello [zh:text="你好"] [en:text="Hello"]', 'zh')
 * // 返回: "你好"
 *
 * // 当 language 为 'en' 时
 * processLocaleString('Hello [zh:text="你好"] [en:text="Hello"]', 'en')
 * // 返回: "Hello"
 *
 * // 当没有匹配的语言标记时
 * processLocaleString('Hello [zh:text="你好"]', 'en')
 * // 返回: "Hello" (清除标记后的原始内容)
 *
 * // 当存在重复的语言标记时
 * processLocaleString('Hello [zh:text="你好"] [zh:text="哈喽"]', 'zh')
 * // 返回: "Hello" (清除标记后的原始内容)
 */
export function processLocaleString(
  text: string,
  language: SupportedLanguage
): string {
  if (typeof text !== 'string') {
    return text
  }

  const { tags, duplicates } = extractLocaleTags(text)

  // 如果当前语言的标记存在重复，直接返回清除标记后的原始内容
  if (duplicates.has(language)) {
    return cleanLocaleTags(text)
  }

  // 如果存在当前语言的标记且不重复，返回该标记的内容
  if (tags[language]) {
    return tags[language]
  }

  // 否则返回清除标记后的原始内容
  return cleanLocaleTags(text)
}

/**
 * 递归处理对象中所有字符串字段的语言属性标记
 *
 * @param data 需要处理的数据（可以是对象、数组或原始值）
 * @param language 当前语言
 * @returns 处理后的数据
 *
 * @example
 * const apiResponse = {
 *   title: "标题 [zh:text=\"中文标题\"] [en:text=\"English Title\"]",
 *   items: [
 *     { name: "项目 [zh:text=\"项目一\"] [en:text=\"Item One\"]" }
 *   ]
 * }
 *
 * processApiResponse(apiResponse, 'zh')
 * // 返回: { title: "中文标题", items: [{ name: "项目一" }] }
 */
export function processApiResponse<T>(data: T, language: SupportedLanguage): T {
  if (data === null || data === undefined) {
    return data
  }

  // 处理字符串
  if (typeof data === 'string') {
    return processLocaleString(data, language) as T
  }

  // 处理数组
  if (Array.isArray(data)) {
    return data.map((item) => processApiResponse(item, language)) as T
  }

  // 处理对象
  if (typeof data === 'object') {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = processApiResponse(value, language)
    }
    return result as T
  }

  // 其他类型（number, boolean 等）直接返回
  return data
}

/**
 * 创建一个带有语言处理的 fetch 包装器
 *
 * @param language 当前语言
 * @returns 处理后的 fetch 函数
 *
 * @example
 * const { language } = useLanguage()
 * const localeFetch = createLocaleFetch(language)
 *
 * const data = await localeFetch('/api/data')
 *   .then(res => res.json())
 *   .then(data => processApiResponse(data, language))
 */
export function createLocaleFetch(_language: SupportedLanguage) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await fetch(input, init)
    return response
  }
}

/**
 * 处理文本：先清除控制标记，再处理多语言标记
 * 这是一个便捷函数，组合了 cleanControlTags 和 processLocaleString
 *
 * @param text 包含控制标记和多语言标记的文本
 * @param language 当前语言
 * @returns 处理后的文本
 *
 * @example
 * processText('[Sort:1][en:text="Hello"]你好', 'zh')
 * // 返回: "你好"
 *
 * processText('[Sort:1][en:text="Hello"]你好', 'en')
 * // 返回: "Hello"
 */
export function processText(text: string, language: SupportedLanguage): string {
  if (!text) return ''
  const cleaned = cleanControlTags(text)
  return processLocaleString(cleaned, language)
}

/**
 * React Hook: 用于处理 API 响应的多语言内容
 * 这是一个工具函数，配合 useLanguage 使用
 *
 * @example
 * const { language } = useLanguage()
 *
 * useEffect(() => {
 *   fetch('/api/announcements')
 *     .then(res => res.json())
 *     .then(data => {
 *       const processedData = processApiResponse(data, language)
 *       setAnnouncements(processedData)
 *     })
 * }, [language])
 */
