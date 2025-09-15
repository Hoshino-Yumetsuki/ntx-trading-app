export interface NewsItem {
  id: string | number
  title: string
  summary: string
  imageUrl: string
  publishDate: string
  modifyDate: string
  isDisplayed: boolean
  content?: string
  source?: string
}
