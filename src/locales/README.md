# 新翻译系统

## 概述

这是重构后的翻译系统，旨在解决原有系统的维护难度大和重复键问题。

## 主要改进

### 1. 文件分离
- **旧系统**: 所有翻译都在一个大文件中 (`language-context.tsx`)
- **新系统**: 翻译内容分离到独立的 JSON 文件中
  - `zh.json` - 中文翻译
  - `en.json` - 英文翻译

### 2. 类型安全
- 添加了完整的 TypeScript 类型定义 (`src/types/i18n.ts`)
- 翻译键有类型检查，避免拼写错误
- IDE 自动补全支持

### 3. 模块化结构
```json
{
  "common": { ... },      // 通用翻译
  "auth": { ... },        // 认证相关
  "security": { ... },    // 安全设置
  "mining": { ... }       // 挖矿相关
}
```

### 4. 避免重复
- 通过嵌套结构组织翻译键
- 消除了重复的翻译键问题
- 更清晰的命名空间

## 使用方法

### 基本用法

```tsx
import { useLanguage } from '@/src/contexts/language-context-new'

function MyComponent() {
  const { t, language, setLanguage } = useLanguage()

  return (
    <div>
      <h1>{t('mining.title')}</h1>
      <p>{t('mining.subtitle')}</p>
      <button onClick={() => setLanguage('en')}>
        Switch to English
      </button>
    </div>
  )
}
```

### 带 Fallback 的用法

```tsx
// 如果翻译不存在，显示 fallback 文本
{t('mining.user.totalMining', '总挖矿量')}
```

### 类型安全的翻译键

```tsx
import type { TranslationKey } from '@/src/types/i18n'

const key: TranslationKey = 'mining.user.title' // ✅ 类型安全
const invalidKey: TranslationKey = 'invalid.key' // ❌ 编译错误
```

## 迁移指南

### 1. 更新导入

**旧代码:**
```tsx
import { useLanguage } from '@/src/contexts/language-context'
```

**新代码:**
```tsx
import { useLanguage } from '@/src/contexts/language-context-new'
```

### 2. 翻译键保持不变

大部分翻译键保持不变，无需修改组件代码：

```tsx
// 这些调用保持不变
{t('mining.title')}
{t('mining.user.title')}
{t('mining.exchange.bind')}
```

### 3. 移除重复键

以下重复的键已被移除：
- `mining.exchange.bindExchange` → 使用 `mining.exchange.bind`

## 文件结构

```
src/
├── locales/
│   ├── zh.json           # 中文翻译
│   ├── en.json           # 英文翻译
│   └── README.md         # 说明文档
├── types/
│   └── i18n.ts          # 类型定义
├── contexts/
│   ├── language-context.tsx     # 旧的翻译上下文
│   └── language-context-new.tsx # 新的翻译上下文
├── utils/
│   └── migrate-translations.ts  # 迁移工具
└── examples/
    └── translation-usage.tsx    # 使用示例
```

## 优势

1. **维护性更好**: 翻译内容与逻辑分离，更容易维护
2. **无重复键**: 通过结构化避免重复翻译键
3. **类型安全**: TypeScript 类型检查，减少错误
4. **可扩展性**: 容易添加新语言和新翻译
5. **性能更好**: JSON 文件可以被打包工具优化
6. **团队协作**: 翻译人员可以直接编辑 JSON 文件

## 添加新翻译

### 1. 在 JSON 文件中添加翻译

**zh.json:**
```json
{
  "mining": {
    "newFeature": {
      "title": "新功能",
      "description": "这是一个新功能"
    }
  }
}
```

**en.json:**
```json
{
  "mining": {
    "newFeature": {
      "title": "New Feature",
      "description": "This is a new feature"
    }
  }
}
```

### 2. 更新类型定义

在 `src/types/i18n.ts` 中添加新的类型：

```typescript
export type TranslationKey = 
  | 'mining.newFeature.title'
  | 'mining.newFeature.description'
  | ... // 其他键
```

### 3. 在组件中使用

```tsx
{t('mining.newFeature.title')}
{t('mining.newFeature.description')}
```

## 切换到新系统

1. 将 `language-context-new.tsx` 重命名为 `language-context.tsx`
2. 备份原有的 `language-context.tsx`
3. 更新 `src/app/layout.tsx` 中的 Provider 导入
4. 测试所有使用翻译的组件

## 注意事项

- 新系统与旧系统的 API 完全兼容
- 翻译键命名保持不变，无需修改现有代码
- 建议逐步迁移，可以两个系统并存
- 确保所有翻译键在两种语言中都存在
