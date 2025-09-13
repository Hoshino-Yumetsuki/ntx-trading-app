export interface NewsItem {
  id: string | number // 确保 id 是 string | number
  title: string
  summary: string
  imageUrl: string
  publishDate: string
  modifyDate: string
  isDisplayed: boolean
  content?: string
  source?: string
}
