'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'

type Preset = { label: string; value: string; days?: number }

const PRESETS: Preset[] = [
  { label: 'Hoje', value: '1d', days: 1 },
  { label: 'Ontem', value: 'yesterday', days: 1 },
  { label: '7 dias', value: '7d', days: 7 },
  { label: '14 dias', value: '14d', days: 14 },
  { label: '30 dias', value: '30d', days: 30 },
  { label: '60 dias', value: '60d', days: 60 },
  { label: '90 dias', value: '90d', days: 90 },
  { label: 'Este mês', value: 'this_month' },
  { label: 'Mês passado', value: 'last_month' },
  { label: 'Este trimestre', value: 'this_quarter' },
  { label: 'Este ano', value: 'this_year' },
]

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function startOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isInRange(day: Date, from: Date | null, to: Date | null) {
  if (!from || !to) return false
  return day >= from && day <= to
}

function formatShort(d: Date) {
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

interface DateRangePickerProps {
  value: string
  onChange: (value: string, from?: string, to?: string) => void
  compare?: boolean
  onCompareToggle?: (enabled: boolean) => void
}

export function DateRangePicker({ value, onChange, compare, onCompareToggle }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [customFrom, setCustomFrom] = useState<Date | null>(null)
  const [customTo, setCustomTo] = useState<Date | null>(null)
  const [selecting, setSelecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const activePreset = PRESETS.find((p) => p.value === value)
  const displayLabel = activePreset
    ? activePreset.label
    : customFrom && customTo
      ? `${formatShort(customFrom)} — ${formatShort(customTo)}`
      : '30 dias'

  const handlePreset = (preset: Preset) => {
    onChange(preset.value)
    setCustomFrom(null)
    setCustomTo(null)
    setOpen(false)
  }

  const handleDayClick = (day: Date) => {
    if (!selecting || !customFrom) {
      setCustomFrom(day)
      setCustomTo(null)
      setSelecting(true)
    } else {
      const from = day < customFrom ? day : customFrom
      const to = day < customFrom ? customFrom : day
      setCustomFrom(from)
      setCustomTo(to)
      setSelecting(false)
      const fmtFrom = `${from.getFullYear()}-${(from.getMonth() + 1).toString().padStart(2, '0')}-${from.getDate().toString().padStart(2, '0')}`
      const fmtTo = `${to.getFullYear()}-${(to.getMonth() + 1).toString().padStart(2, '0')}-${to.getDate().toString().padStart(2, '0')}`
      onChange('custom', fmtFrom, fmtTo)
      setOpen(false)
    }
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const days = daysInMonth(viewYear, viewMonth)
  const offset = startOfWeek(viewYear, viewMonth)
  const today = new Date()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-[#00c977] dark:hover:border-[#00c977] transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-[#252940] dark:text-white">{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex"
            style={{ minWidth: 520 }}
          >
            {/* Presets */}
            <div className="w-40 border-r border-gray-100 dark:border-gray-700 py-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePreset(p)}
                  className={`w-full text-left px-4 py-1.5 text-xs font-medium transition-colors ${
                    value === p.value
                      ? 'bg-[#00c977]/10 text-[#00c977]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              {onCompareToggle && (
                <div className="px-4 pt-3 mt-2 border-t border-gray-100 dark:border-gray-700">
                  <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compare}
                      onChange={(e) => onCompareToggle(e.target.checked)}
                      className="rounded border-gray-300 text-[#00c977] focus:ring-[#00c977]"
                    />
                    Comparar
                  </label>
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className="p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-sm font-semibold text-[#252940] dark:text-white">
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {WEEKDAYS.map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: offset }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                  const day = new Date(viewYear, viewMonth, i + 1)
                  const isToday = isSameDay(day, today)
                  const isFrom = customFrom && isSameDay(day, customFrom)
                  const isTo = customTo && isSameDay(day, customTo)
                  const inRange = isInRange(day, customFrom, customTo)
                  const isFuture = day > today

                  return (
                    <button
                      key={i}
                      onClick={() => !isFuture && handleDayClick(day)}
                      disabled={isFuture}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
                        isFrom || isTo
                          ? 'bg-[#00c977] text-white'
                          : inRange
                            ? 'bg-[#00c977]/15 text-[#00c977]'
                            : isToday
                              ? 'ring-1 ring-[#00c977] text-[#00c977]'
                              : isFuture
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>

              {customFrom && !customTo && (
                <p className="text-[10px] text-gray-400 mt-2 text-center">Selecione a data final</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
