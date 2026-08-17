import { useActivity } from '@hooks/useActivity'
import { cx } from '@lib/cx'

const LEVELS = ['bg-white/6', 'bg-neon/20', 'bg-neon/40', 'bg-neon/70', 'bg-neon']

export function ContributionGraph() {
  const { days } = useActivity()
  const weeks: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="overflow-x-auto border border-white/10 bg-panel/60 p-4" aria-label="Contribution activity">
      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} events`}
                className={cx('h-2.5 w-2.5', LEVELS[day.level])}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-muted">EVENT DENSITY // 52 WEEK WINDOW</p>
    </div>
  )
}
