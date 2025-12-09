// 前端请求的 URL（F12 显示的地址，实际会被 Service Worker 拦截）
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://app.ntxdao.com/api'
export const RSS_BASE_URL = process.env.NEXT_PUBLIC_RSS_BASE_URL || 'https://app.ntxdao.com/rss'

// 真实的后端 URL（Service Worker 转发目标）
export const API_PROXY_TARGET = process.env.NEXT_PUBLIC_API_PROXY_TARGET || 'https://api.ntxdao.com/api'
export const RSS_PROXY_TARGET = process.env.NEXT_PUBLIC_RSS_PROXY_TARGET || 'https://rss.ntxdao.com/rss'