// 翻译数据类型 - 简化为 any 类型，避免维护复杂的接口定义
export type Translations = any;

// 支持的语言类型
export type SupportedLanguage = "zh" | "en";

// 翻译键路径类型 - 简化为 string 类型，避免手动维护联合类型
export type TranslationKey = string;
