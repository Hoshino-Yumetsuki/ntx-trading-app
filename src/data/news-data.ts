// 统一管理新闻和通知数据
// 这个文件作为所有新闻和通知的单一数据源

export type NewsItem = {
  id: string
  date: string
  time: string
  title: string
  content: string
  link: string
  category?: string // 例如："市场行情", "NTX动态", "行情分析", "行业新闻", "NTX公告"
  isHighlighted?: boolean
}

export const newsItems: NewsItem[] = [
  {
    id: '1',
    date: '2024年7月13日',
    time: '09:00',
    title: '【市场行情】比特币突破7万美元，多头情绪高涨',
    content:
      '今日比特币价格强势突破7万美元关口，创下近期新高。市场分析师指出，宏观经济数据利好和机构资金持续流入是主要推动力，短期内多头情绪预计将继续主导市场。',
    link: '#',
    category: '市场行情',
    isHighlighted: true
  },
  {
    id: '2',
    date: '2024年7月12日',
    time: '15:30',
    title: '【NTX动态】教育研究院新增《量化交易实战》课程',
    content:
      '为满足用户对高级交易策略的需求，教育研究院正式上线《量化交易实战》课程，由资深量化专家授课，深入讲解程序化交易模型构建与优化。',
    link: '#',
    category: 'NTX动态'
  },
  {
    id: '3',
    date: '2024年7月11日',
    time: '10:45',
    title: '【行情分析】以太坊生态TVL再创新高，DeFi热度不减',
    content:
      '以太坊（ETH）生态系统总锁仓价值（TVL）持续增长，DeFi（去中心化金融）项目表现强劲。这表明市场对去中心化应用的需求旺盛，ETH有望继续领跑公链赛道。',
    link: '#',
    category: '行情分析'
  },
  {
    id: '4',
    date: '2024年7月10日',
    time: '18:00',
    title: '【行业新闻】Web3游戏融资活跃，GameFi迎来新机遇',
    content:
      '近期Web3游戏领域融资活动频繁，多家GameFi项目获得巨额投资。分析认为，随着技术成熟和用户认知度提升，GameFi有望成为下一个加密市场爆发点。',
    link: '#',
    category: '行业新闻'
  },
  {
    id: '5',
    date: '2024年7月09日',
    time: '11:20',
    title: '【NTX公告】平台安全升级完成，保障用户资产安全',
    content:
      'NTX平台已完成新一轮安全系统升级，引入多重加密技术和实时风控机制，全面提升用户账户和资产的安全性，请用户放心使用。',
    link: '#',
    category: 'NTX公告'
  }
]

// 获取最近的新闻，可指定获取数量
export function getRecentNews(count: number = 3): NewsItem[] {
  return [...newsItems].slice(0, count)
}

// 根据类别过滤新闻
export function getNewsByCategory(category: string): NewsItem[] {
  return newsItems.filter((item) => item.category === category)
}

// 获取精选新闻
export function getHighlightedNews(): NewsItem[] {
  return newsItems.filter((item) => item.isHighlighted)
}
