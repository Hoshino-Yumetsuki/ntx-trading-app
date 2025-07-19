'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'

export type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
)

interface LanguageProviderProps {
  children: ReactNode
}

// 检测浏览器语言
const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'zh'

  const browserLang = navigator.language || navigator.languages[0]
  return browserLang.startsWith('zh') ? 'zh' : 'en'
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('zh')
  const [isInitialized, setIsInitialized] = useState(false)

  // 从 localStorage 恢复语言设置或检测浏览器语言
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ntx-language') as Language
    if (savedLanguage) {
      setLanguageState(savedLanguage)
    } else {
      const detectedLanguage = detectBrowserLanguage()
      setLanguageState(detectedLanguage)
    }
    setIsInitialized(true)
  }, [])

  // 保存语言设置到 localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('ntx-language', language)
    }
  }, [language, isInitialized])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  // 翻译函数
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// 翻译字典
const translations: Record<Language, Record<string, string>> = {
  zh: {
    // 导航标签
    'nav.home': '主页',
    'nav.news': '新闻',
    'nav.mining': '挖矿',
    'nav.profile': '我的',

    // 主页
    'home.tutorial.title': '新手教程',
    'home.tutorial.subtitle': '从零开始，掌握专业交易技能',
    'home.tutorial.button': '开始学习',
    'home.signals.title': '交易信号',
    'home.signals.subtitle': '实时市场分析',
    'home.features.title': '平台特色',
    'home.features.mining': '交易挖矿',
    'home.features.mining.desc': '通过交易获得 NTX 代币奖励',
    'home.features.staking': '质押收益',
    'home.features.staking.desc': '质押 NTX 获得稳定分红',
    'home.features.governance': '社区治理',
    'home.features.governance.desc': '参与平台决策，共享发展红利',
    'home.features.academy': '黑马学院',
    'home.features.academy.desc': '专业交易培训，提升投资技能',

    // 主页卡片
    'home.card.tutorial.title': '新手教程',
    'home.card.tutorial.subtitle': '快速入门，掌握平台核心功能',
    'home.card.tutorial.desc':
      '从零开始，一步步学习如何使用NTX平台进行交易挖矿和策略学习。',
    'home.card.tutorial.button': '查看详情',

    'home.card.ai.title': '机器学习预测',
    'home.card.ai.subtitle': 'AI驱动，洞察市场未来趋势',
    'home.card.ai.desc':
      '利用先进的机器学习算法，为您提供精准的市场趋势预测，辅助交易决策。',
    'home.card.ai.button': '点击试用',

    'home.card.mining.title': '交易挖矿',
    'home.card.mining.subtitle': '每笔交易获得反佣和挖矿奖励',
    'home.card.mining.desc': '通过程序化工具捕捉市场信号，实现收益最大化',

    // 教程页面
    'tutorial.title': 'NexTrade DAO 平台新手引导',
    'tutorial.subtitle': '完整的平台使用指南',
    'tutorial.welcome': '欢迎来到 NexTrade DAO',
    'tutorial.welcome.desc': '通过交易返利、质押分红和社区治理赚取 NTX 代币',
    'tutorial.back': '返回',

    'tutorial.overview.title': 'NexTrade DAO 概述',
    'tutorial.overview.content':
      '欢迎加入 NextTrade DAO，这是一个基于区块链技术的去中心化交易平台。我们的目标用户包括加密货币交易者、DeFi 爱好者以及希望通过交易获得额外收益的投资者。平台通过创新的交易挖矿机制，让用户在交易的同时获得 NTX 代币奖励。',

    'tutorial.audience.title': '受众群体',
    'tutorial.audience.content':
      '• 加密货币交易新手\n• 对区块链、DeFi 和 RWA 投资感兴趣的用户\n• 希望通过返利和质押获得额外收益的投资者',

    'tutorial.account.title': '账户设置与交易所绑定',
    'tutorial.account.content':
      '绑定交易所账户: 点击首页导航【挖矿】，进入【交易所】页面选择并【去绑定】。然后【去注册】跳转至交易所页面完成注册（注意：必须填写 NexTrade DAO 平台的邀请码）。\n\n获取/交易所 UID: 进入交易所个人中心页面获取 UID，然后回到 NexTrade DAO 的【交易所】页面进行绑定 UID，完成后即可实现挖矿。\n\n创建/连接钱包: 用户连接 BSC 链兼容钱包，即可进行充币及提币等操作。',

    'tutorial.mining.title': '2. 交易挖矿与返利机制',
    'tutorial.mining.content':
      '代币产出规则:\n• 代币总供应量: 30亿\n• 挖矿最大产量: 21亿\n• 初始每日铸币量: 383,561.64 NTX\n• 每日递减量: 第1-20年通缩率 5.48%; 第21-50年通缩率 9.81%\n• 铸币持续时间: 约50年\n\n交易挖矿计算公式:\nMa = (V₀ / Vall) * M * 0.9\n\n其中 Ma 为用户每日代币奖励, V₀ 为用户当日交易量, Vall 为平台当日总交易量, M 为平台当日代币总产量。\n\n普通用户通过 NexTrade DAO 注册交易所账户并交易后，次日将以 NTX 代币形式获得返佣，一部分代币会分配给邀请人。',

    'tutorial.rebate.title': '3. 返佣收益链路详解',
    'tutorial.rebate.content':
      '以下为不同场景下的返佣收益结构图:\n\n返佣链路图 (基础结构)\n图1: 基础邀请返佣结构\n\n返佣链路图 (经纪商结构)\n图2: 以经纪商为核心的扩展结构\n\n返佣链路图 (经纪商收益示例)\n图3: 经纪商直推人收益示例',

    'tutorial.staking.title': '4. 质押与分红',
    'tutorial.staking.content':
      '平台提供两种质押形式：普通质押挖矿（回购 NTX 分发利息）和流动性提供者(LP)质押（在 PancakeSwap V2 中质押 USDT 和 NTX 获得加权分红），以增强市场流动性。',

    'tutorial.governance.title': '5. 社区参与与治理',
    'tutorial.governance.content':
      '我们鼓励用户参与 SocialFi 活动和社区治理。通过在 Telegram、Discord 的活跃度可累积积分兑换奖励。消耗 NTX 可锻造 GNTX 治理代币，用于参与社区决策投票。持有 GNTX 并满足邀请条件可申请成为经纪商，享受更高返佣。',

    'tutorial.academy.title': '6. 学院系统与交易策略',
    'tutorial.academy.content':
      'NexTrade DAO 提供专业的交易技术和营销培训，涵盖加密交易策略、Web3 营销和 RWA 投资知识。用户可通过 USDT、NTX 或 SocialFi 贡献兑换课程，旨在提升用户技能，增强平台粘性。',

    // 通用
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.confirm': '确认',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.view': '查看',
    'common.more': '更多'
  },
  en: {
    // Navigation tabs
    'nav.home': 'Home',
    'nav.news': 'News',
    'nav.mining': 'Mining',
    'nav.profile': 'Profile',

    // Home page
    'home.tutorial.title': 'New User Tutorial',
    'home.tutorial.subtitle': 'Master professional trading skills from scratch',
    'home.tutorial.button': 'Start Learning',
    'home.signals.title': 'Trading Signals',
    'home.signals.subtitle': 'Real-time Market Analysis',
    'home.features.title': 'Platform Features',
    'home.features.mining': 'Trade Mining',
    'home.features.mining.desc': 'Earn NTX token rewards through trading',
    'home.features.staking': 'Staking Rewards',
    'home.features.staking.desc': 'Stake NTX for stable dividends',
    'home.features.governance': 'Community Governance',
    'home.features.governance.desc':
      'Participate in platform decisions, share development dividends',
    'home.features.academy': 'Trading Academy',
    'home.features.academy.desc':
      'Professional trading training to enhance investment skills',

    // Home page cards
    'home.card.tutorial.title': 'Beginner Tutorial',
    'home.card.tutorial.subtitle': 'Quick start, master core platform features',
    'home.card.tutorial.desc':
      'Learn step by step how to use the NTX platform for trade mining and strategy learning from scratch.',
    'home.card.tutorial.button': 'View Details',

    'home.card.ai.title': 'ML Prediction',
    'home.card.ai.subtitle': 'AI-driven, insight into future market trends',
    'home.card.ai.desc':
      'Utilize advanced machine learning algorithms to provide accurate market trend predictions and assist trading decisions.',
    'home.card.ai.button': 'Try Now',

    'home.card.mining.title': 'Trade Mining',
    'home.card.mining.subtitle':
      'Earn rebates and mining rewards from every trade',
    'home.card.mining.desc':
      'Capture market signals through programmatic tools to maximize returns',

    // Tutorial page
    'tutorial.title': 'NexTrade DAO Platform Guide',
    'tutorial.subtitle': 'Complete platform usage guide',
    'tutorial.welcome': 'Welcome to NexTrade DAO',
    'tutorial.welcome.desc':
      'Earn NTX tokens through trading rebates, staking dividends and community governance',
    'tutorial.back': 'Back',

    'tutorial.overview.title': 'NexTrade DAO Overview',
    'tutorial.overview.content':
      'Welcome to NextTrade DAO, a decentralized trading platform based on blockchain technology. Our target users include cryptocurrency traders, DeFi enthusiasts, and investors who want to earn additional income through trading. The platform uses an innovative trade-to-earn mechanism that allows users to earn NTX token rewards while trading.',

    'tutorial.audience.title': 'Target Audience',
    'tutorial.audience.content':
      '• Cryptocurrency trading beginners\n• Users interested in blockchain, DeFi and RWA investments\n• Investors who want to earn additional income through rebates and staking',

    'tutorial.account.title': 'Account Setup & Exchange Binding',
    'tutorial.account.content':
      'Bind Exchange Account: Click [Mining] in the homepage navigation, enter the [Exchange] page, select and [Bind]. Then [Register] to jump to the exchange page to complete registration (Note: You must fill in the invitation code of the NexTrade DAO platform).\n\nGet Exchange UID: Enter the exchange personal center page to get the UID, then return to the [Exchange] page of NexTrade DAO to bind the UID. After completion, mining can be realized.\n\nCreate/Connect Wallet: Users connect BSC chain compatible wallets to perform operations such as deposits and withdrawals.',

    'tutorial.mining.title': '2. Trading Mining & Rebate Mechanism',
    'tutorial.mining.content':
      "Token Production Rules:\n• Total Token Supply: 3 billion\n• Maximum Mining Output: 2.1 billion\n• Initial Daily Minting: 383,561.64 NTX\n• Daily Reduction: Years 1-20 deflation rate 5.48%; Years 21-50 deflation rate 9.81%\n• Minting Duration: About 50 years\n\nTrading Mining Formula:\nMa = (V₀ / Vall) * M * 0.9\n\nWhere Ma is the user's daily token reward, V₀ is the user's daily trading volume, Vall is the platform's daily total trading volume, and M is the platform's daily total token production.\n\nOrdinary users will receive rebates in the form of NTX tokens the next day after registering an exchange account through NexTrade DAO and trading, with some tokens distributed to inviters.",

    'tutorial.rebate.title': '3. Rebate Revenue Chain Analysis',
    'tutorial.rebate.content':
      'The following are rebate revenue structure diagrams for different scenarios:\n\nRebate Chain Diagram (Basic Structure)\nFigure 1: Basic Invitation Rebate Structure\n\nRebate Chain Diagram (Broker Structure)\nFigure 2: Extended Structure Centered on Brokers\n\nRebate Chain Diagram (Broker Revenue Example)\nFigure 3: Direct Referral Revenue Example for Brokers',

    'tutorial.staking.title': '4. Staking & Dividends',
    'tutorial.staking.content':
      'The platform provides two forms of staking: ordinary staking mining (repurchasing NTX to distribute interest) and liquidity provider (LP) staking (staking USDT and NTX in PancakeSwap V2 to obtain weighted dividends) to enhance market liquidity.',

    'tutorial.governance.title': '5. Community Participation & Governance',
    'tutorial.governance.content':
      'We encourage users to participate in SocialFi activities and community governance. Activity on Telegram and Discord can accumulate points for rewards. Consuming NTX can forge GNTX governance tokens for participating in community decision voting. Holding GNTX and meeting invitation conditions allows application to become a broker with higher rebates.',

    'tutorial.academy.title': '6. Academy System & Trading Strategies',
    'tutorial.academy.content':
      'NexTrade DAO provides professional trading technology and marketing training, covering crypto trading strategies, Web3 marketing, and RWA investment knowledge. Users can exchange courses through USDT, NTX, or SocialFi contributions, aiming to improve user skills and enhance platform stickiness.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.more': 'More'
  }
}
