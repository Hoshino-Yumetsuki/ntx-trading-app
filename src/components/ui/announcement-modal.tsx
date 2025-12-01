'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/src/contexts/language-context'
import { API_BASE_URL } from '@/src/services/config'
import { Button } from '@/src/components/ui/button'
import { X } from 'lucide-react'

interface Announcement {
  id: number
  title: string
  summary: string
  imageUrl: string
  publishDate: string
  content?: string
}

interface AnnouncementModalProps {
  onViewAnnouncement?: (id: number) => void
}

const ANNOUNCEMENT_READ_KEY = 'ntx-announcement-read-ids'

export function AnnouncementModal({ onViewAnnouncement }: AnnouncementModalProps) {
  const { t } = useLanguage()
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<Announcement[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // 获取已读公告ID列表
  const getReadAnnouncementIds = useCallback((): number[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(ANNOUNCEMENT_READ_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }, [])

  // 标记公告为已读并保存到 localStorage
  const saveReadId = useCallback((id: number) => {
    const readIds = getReadAnnouncementIds()
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id]
      localStorage.setItem(ANNOUNCEMENT_READ_KEY, JSON.stringify(newReadIds))
    }
  }, [getReadAnnouncementIds])

  // 标记单条公告为已读并从列表中移除
  const markAsReadAndRemove = useCallback((id: number) => {
    saveReadId(id)
    setUnreadAnnouncements((prev) => {
      const newList = prev.filter((item) => item.id !== id)
      // 如果没有未读公告了，关闭弹窗
      if (newList.length === 0) {
        setIsOpen(false)
      }
      return newList
    })
  }, [saveReadId])

  // 标记所有公告为已读
  const markAllAsRead = useCallback(() => {
    const readIds = getReadAnnouncementIds()
    const newReadIds = [...readIds]
    unreadAnnouncements.forEach((announcement) => {
      if (!newReadIds.includes(announcement.id)) {
        newReadIds.push(announcement.id)
      }
    })
    localStorage.setItem(ANNOUNCEMENT_READ_KEY, JSON.stringify(newReadIds))
  }, [getReadAnnouncementIds, unreadAnnouncements])

  // 获取所有未读公告
  useEffect(() => {
    let cancelled = false

    async function fetchAnnouncements() {
      try {
        const response = await fetch(`${API_BASE_URL}/user/academy/articles`)
        if (response.ok) {
          const data: Announcement[] = await response.json()
          if (!cancelled && data.length > 0) {
            // 按发布日期排序（最新的在前）
            const sortedData = data.sort(
              (a, b) =>
                new Date(b.publishDate).getTime() -
                new Date(a.publishDate).getTime()
            )

            // 过滤出未读公告
            const readIds = getReadAnnouncementIds()
            const unread = sortedData.filter(
              (announcement) => !readIds.includes(announcement.id)
            )

            if (unread.length > 0) {
              setUnreadAnnouncements(unread)
              setIsOpen(true)
            }
          }
        }
      } catch (error) {
        console.error('获取公告失败:', error)
      }
    }

    fetchAnnouncements()

    return () => {
      cancelled = true
    }
  }, [getReadAnnouncementIds])

  // 关闭弹窗并标记所有为已读
  const handleClose = useCallback(() => {
    markAllAsRead()
    setIsOpen(false)
  }, [markAllAsRead])

  // 点击"我知道了"，只标记当前公告为已读
  const handleDismiss = useCallback((announcement: Announcement) => {
    markAsReadAndRemove(announcement.id)
  }, [markAsReadAndRemove])

  // 点击"查看公告"，标记已读、关闭弹窗并跳转查看
  const handleViewAnnouncement = useCallback((announcement: Announcement) => {
    saveReadId(announcement.id)
    setIsOpen(false)
    onViewAnnouncement?.(announcement.id)
  }, [saveReadId, onViewAnnouncement])

  if (!isOpen || unreadAnnouncements.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 背景遮罩 + 高斯模糊 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* 弹窗容器 */}
      <div className="relative z-10 w-[90%] max-w-md mx-4 max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800">
              {t('announcement.title') || '平台公告'}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-[#1C55FF] rounded-full">
              {unreadAnnouncements.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 可滚动的公告列表 */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-4 p-4">
            {unreadAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 transition-all duration-300"
              >
                {/* 公告配图 */}
                {announcement.imageUrl && announcement.imageUrl !== '/placeholder.png' && (
                  <div className="relative w-full h-36 overflow-hidden">
                    <Image
                      src={announcement.imageUrl}
                      alt={announcement.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    {/* 渐变遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                {/* 公告内容 */}
                <div className="p-4">
                  {/* 标签和日期 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-medium text-white bg-[#1C55FF] rounded-full">
                      {t('announcement.tag') || '公告'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(announcement.publishDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-base font-bold text-slate-800 mb-1.5 line-clamp-2">
                    {announcement.title}
                  </h3>

                  {/* 摘要内容 */}
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
                    {announcement.summary}
                  </p>

                  {/* 按钮组 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-slate-600 border-slate-200 hover:bg-white rounded-lg text-sm"
                      onClick={() => handleDismiss(announcement)}
                    >
                      {t('announcement.dismiss') || '我知道了'}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-9 bg-[#1C55FF] hover:bg-[#1C55FF]/90 text-white rounded-lg text-sm"
                      onClick={() => handleViewAnnouncement(announcement)}
                    >
                      {t('announcement.view') || '查看公告'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
