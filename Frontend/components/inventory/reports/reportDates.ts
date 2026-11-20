import type { Rental } from '../types'

export interface DateRange {
  start: string
  end: string
}

function localDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function previousCalendarRange(period: 'month' | 'year', today: Date): DateRange {
  const year = today.getFullYear()
  const month = today.getMonth()
  const start = period === 'month' ? new Date(year, month - 1, 1) : new Date(year - 1, 0, 1)
  const end = period === 'month' ? new Date(year, month, 0) : new Date(year, 0, 0)
  return { start: localDateKey(start), end: localDateKey(end) }
}

export function filterRentalsByStartDate(rentals: Rental[], { start, end }: DateRange) {
  return rentals.filter(rental => rental.startDate >= start && rental.startDate <= end)
}
