'use client'

interface PeriodSelectorProps {
  value: string
  onChange: (period: string) => void
}

const PERIODS = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '3 meses', value: '3m' },
  { label: '6 meses', value: '6m' },
  { label: '1 ano', value: '1a' },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            value === p.value
              ? 'bg-[#00c977] text-white shadow-lg shadow-[#00c977]/30'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-[#00c977]/50'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
