import type { SupportedLanguage } from '@/src/types/i18n'

/**
 * 多语言属性标记的正则表达式
 * 匹配格式: [lang:text="内容"] 例如 [zh:text="中文内容"] [en:text="English content"]
 */
const LOCALE_TAG_REGEX = /\[(\w+):text="([^"]+)"\]/g

/**
 * 从字符串中提取所有语言属性标记
 * @param text 包含语言标记的文本
 * @returns 语言到文本的映射对象，以及是否存在重复标记
 */
function extractLocaleTags(text: string): {
  tags: Record<string, string>
  duplicates: Set<string>
} {
  const tags: Record<string, string> = {}
  const duplicates = new Set<string>()
  let match: RegExpExecArray | null

  // 重置正则的 lastIndex
  LOCALE_TAG_REGEX.lastIndex = 0

  while ((match = LOCALE_TAG_REGEX.exec(text)) !== null) {
    const [, lang, content] = match
    // 如果该语言已经存在，标记为重复
    if (lang in tags) {
      duplicates.add(lang)
    }
    tags[lang] = content
  }

  return { tags, duplicates }
}

/**
 * 清除文本中的所有语言属性标记
 * @param text 包含语言标记的文本
 * @returns 清除标记后的文本
 */
function cleanLocaleTags(text: string): string {
  return text.replace(LOCALE_TAG_REGEX, '').trim()
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
export function createLocaleFetch(language: SupportedLanguage) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await fetch(input, init)
    return response
  }
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
