'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker } from 'react-day-picker'
import { zhCN, enUS } from 'date-fns/locale'
import { format } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useLanguage } from '@/src/contexts/language-context'
import 'react-day-picker/style.css'

interface DatePickerProps {
  value: string // YYYY-MM-DD format
  onChange: (date: string) => void
  maxDate?: Date
  minDate?: Date
  className?: string
}

export function DatePicker({
  value,
  onChange,
  maxDate,
  minDate,
  className
}: DatePickerProps) {
  const { language, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [tempDateStr, setTempDateStr] = useState<string>('')

  const selectedDate = value ? new Date(value) : undefined
  const tempDate = tempDateStr ? new Date(tempDateStr) : selectedDate
  const locale = language === 'zh' ? zhCN : enUS

  const handleOpen = () => {
    setTempDateStr(value)
    setIsOpen(true)
  }

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setTempDateStr(format(date, 'yyyy-MM-dd'))
    }
  }

  const handleConfirm = () => {
    if (tempDateStr) {
      onChange(tempDateStr)
    }
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempDateStr('')
    setIsOpen(false)
  }

  const displayValue = selectedDate
    ? format(selectedDate, 'yyyy/MM/dd')
    : t('common.selectDate')

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-slate-700 hover:border-blue-300 transition-colors ${className}`}
      >
        <span>{displayValue}</span>
        <Calendar className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={handleCancel}
          >
            {/* 背景遮罩 */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* 日历弹窗 */}
            <div
              className="relative bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                  {t('common.selectDate')}
                </h3>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 日历 */}
              <div className="p-4">
                <DayPicker
                  mode="single"
                  selected={tempDate}
                  onSelect={handleSelect}
                  locale={locale}
                  disabled={[
                    ...(maxDate ? [{ after: maxDate }] : []),
                    ...(minDate ? [{ before: minDate }] : [])
                  ]}
                  defaultMonth={selectedDate}
                  showOutsideDays
                  classNames={{
                    months: 'relative',
                    month: 'space-y-4',
                    month_caption: 'flex justify-center items-center h-8 mb-2',
                    caption_label: 'text-base font-semibold text-slate-800',
                    nav: 'absolute top-0 inset-x-0 flex justify-between items-center h-8 px-1',
                    button_previous:
                      'p-1 rounded-full hover:bg-blue-50 text-slate-600',
                    button_next:
                      'p-1 rounded-full hover:bg-blue-50 text-slate-600',
                    weekdays: 'flex',
                    weekday:
                      'w-10 h-8 flex items-center justify-center text-xs font-medium text-slate-500',
                    week: 'flex',
                    day: 'w-10 h-10 p-0',
                    day_button: 'w-full h-full flex items-center justify-center text-sm rounded-full hover:bg-blue-50 transition-colors cursor-pointer',
                    selected:
                      '[&>button]:bg-[#1C55FF] [&>button]:text-white [&>button]:hover:bg-[#1C55FF] [&>button]:font-semibold',
                    today: '[&>button]:border-2 [&>button]:border-[#1C55FF] [&>button]:font-semibold',
                    outside: '[&>button]:text-slate-300',
                    disabled: '[&>button]:text-slate-300 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent'
                  }}
                  components={{
                    Chevron: ({ orientation }) =>
                      orientation === 'left' ? (
                        <ChevronLeft className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )
                  }}
                />
              </div>

              {/* 底部按钮 */}
              <div className="flex gap-3 px-4 py-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-10"
                  onClick={handleCancel}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  className="flex-1 bg-[#1C55FF] hover:bg-[#1545DD] rounded-xl h-10"
                  onClick={handleConfirm}
                  disabled={!tempDateStr}
                >
                  {t('common.confirm')}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
