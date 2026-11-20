import { useState } from 'react'
import { Card } from '@/components/rentals/ui'
import { RentalBadge, headingStyle } from '../InventoryUi'
import type { Gear, GearStatus, Rental, RentalStatus, User } from '../types'
import { itemType } from '../gear/gearNames'
import { DonorReport } from './DonorReport'
import { filterRentalsByStartDate, previousCalendarRange } from './reportDates'

const periods = [
  { key: 'all', label: 'All time' },
  { key: 'month', label: 'Last month' },
  { key: 'year', label: 'Last year' },
  { key: 'custom', label: 'Custom range' },
] as const

const rentalStatusColors: Record<RentalStatus, string> = {
  'Trip Reserved': 'bg-pine',
  Active: 'bg-pine',
  'Due Soon': 'bg-moss',
  Overdue: 'bg-clay',
  Returned: 'bg-text-s',
}

function rentalStatusBreakdown(rentals: Rental[]) {
  return Object.entries(rentalStatusColors).map(([label, color]) => ({
    label,
    color,
    count: rentals.filter(rental => rental.status === label).length,
  }))
}

const dateLabel = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })
const calendarDate = /^\d{4}-\d{2}-\d{2}$/

function BarChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-24 text-xs text-text-s text-right shrink-0">{d.label}</div>
          <div className="flex-1 bg-table-hd rounded-full h-5 overflow-hidden">
            <div
              className={`${d.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
              style={{ width: `${(d.count / max) * 100}%` }}
            >
              {d.count > 0 && <span className="text-xs text-white font-medium">{d.count}</span>}
            </div>
          </div>
          {d.count === 0 && <span className="text-xs text-text-dis ">0</span>}
        </div>
      ))}
    </div>
  )
}

export function ReportsPage({ rentals, gear, users }: { rentals: Rental[]; gear: Gear[]; users: User[] }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rentals' | 'gear' | 'donors'>('overview')
  const [period, setPeriod] = useState<typeof periods[number]['key']>('all')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const customIncomplete = period === 'custom' && (!start || !end)
  const customInvalid = period === 'custom' && !customIncomplete && (!calendarDate.test(start) || !calendarDate.test(end))
  const customReversed = period === 'custom' && !customIncomplete && !customInvalid && start > end
  const range = period === 'all' ? null
    : period === 'custom' ? { start, end }
    : previousCalendarRange(period, new Date())
  const showOverview = !customIncomplete && !customInvalid && !customReversed
  const overviewRentals = range ? filterRentalsByStartDate(rentals, range) : rentals
  const activeRentals = overviewRentals.filter(r => r.status === 'Active').length
  const availableGear = gear.filter(g => g.status === 'Available').length
  const rentedGear = gear.filter(g => g.status === 'Rented').length
  const activeUsers = users.filter(u => u.status === 'Active').length
  const averageDuration = overviewRentals.length
    ? Math.round((overviewRentals.reduce((sum, rental) => sum + rental.durationDays, 0) / overviewRentals.length) * 10) / 10
    : null
  const uniqueRentalTypes = new Set(overviewRentals.map(r => itemType(r.gear))).size
  const rentalTypeCounts = Array.from(new Set(gear.map(g => itemType(g.name)))).map(name => ({
    name,
    count: rentals.filter(r => itemType(r.gear) === name).length,
    category: gear.find(g => itemType(g.name) === name)?.category ?? '—',
  })).sort((a, b) => b.count - a.count)
  const leastRented = [...rentalTypeCounts].sort((a, b) => a.count - b.count).slice(0, 4)
  const tentSizeDemand = Array.from(new Set(gear.filter(g => itemType(g.name) === 'Tent').map(g => g.size))).map(size => ({
    size,
    rentals: rentals.filter(r => {
      const rentedGear = gear.find(g => g.name === r.gear)
      return itemType(r.gear) === 'Tent' && rentedGear?.size === size
    }).length,
  })).sort((a, b) => b.rentals - a.rentals)
  const gearStatusBreakdown: { label: GearStatus; count: number; color: string }[] = [
    { label: 'Available', count: availableGear, color: 'bg-pine' },
    { label: 'Rented', count: rentedGear, color: 'bg-surface' },
    { label: 'Maintenance', count: gear.filter(g => g.status === 'Maintenance').length, color: 'bg-surface' },
    { label: 'Inactive', count: gear.filter(g => g.status === 'Inactive').length, color: 'bg-text-s' },
  ]

  return (
    <div className="w-full">
      <h1 style={headingStyle} className="mb-6">Reports</h1>

      <div className="flex flex-wrap gap-1 mb-6 bg-table-hd rounded-lg p-1 w-fit">
        {(['overview', 'rentals', 'gear', 'donors'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="seg-btn capitalize"
                data-active={activeTab === tab}
                aria-pressed={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-5">
          <Card className="space-y-3 p-4">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-text-p">Rental period</legend>
              <div className="flex w-fit flex-wrap gap-1 rounded-lg bg-table-hd p-1">
                {periods.map(option => (
                  <button key={option.key} type="button" className="seg-btn"
                    data-active={period === option.key} aria-pressed={period === option.key}
                    onClick={() => setPeriod(option.key)}>
                    {option.label}
                  </button>
                ))}
              </div>
              {period === 'custom' && (
                <div className="mt-3 grid max-w-xl gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm text-text-p">
                    Start date
                    <input type="date" max="9999-12-31" value={start} onChange={event => setStart(event.target.value)}
                      className="rounded-lg border border-border-col bg-surface px-3 py-2 focus:border-pine" />
                  </label>
                  <label className="grid gap-1 text-sm text-text-p">
                    End date
                    <input type="date" max="9999-12-31" value={end} onChange={event => setEnd(event.target.value)}
                      className="rounded-lg border border-border-col bg-surface px-3 py-2 focus:border-pine" />
                  </label>
                </div>
              )}
            </fieldset>
            {customIncomplete && <p className="text-sm text-text-s">Choose both dates to show rental activity.</p>}
            {customInvalid && <p role="alert" className="text-sm text-clay">Enter dates with a four-digit year.</p>}
            {customReversed && <p role="alert" className="text-sm text-clay">End date must be on or after the start date.</p>}
            {showOverview && range && (
              <p role="status" className="text-sm text-text-s">
                Rentals starting {dateLabel.format(new Date(range.start + 'T00:00:00Z'))} through {dateLabel.format(new Date(range.end + 'T00:00:00Z'))}.
              </p>
            )}
          </Card>

          {showOverview && (
            <>
              {overviewRentals.length === 0 && <p role="status" className="text-sm text-text-s">No rentals started in this period.</p>}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Total Rentals', value: overviewRentals.length, sub: 'started in period' },
                  { label: 'Unique Items', value: uniqueRentalTypes, sub: 'gear types rented' },
                  { label: 'Avg. Duration', value: averageDuration === null ? '—' : `${averageDuration}d`, sub: 'per rental' },
                  { label: 'Active Now', value: activeRentals, sub: 'still active from period' },
                  { label: 'Active Users', value: activeUsers, sub: 'currently registered' },
                ].map(s => (
                  <Card key={s.label} className="p-4 text-center">
                    <div className="text-2xl font-bold text-text-p">{s.value}</div>
                    <div className="text-xs font-semibold text-text-p mt-1">{s.label}</div>
                    <div className="text-xs text-text-dis">{s.sub}</div>
                  </Card>
                ))}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Card className="p-5">
                  <h3 className="font-semibold text-text-p mb-4 text-sm uppercase ">Rental Status</h3>
                  <BarChart data={rentalStatusBreakdown(overviewRentals)} />
                </Card>
                <Card className="p-5">
                  <h3 className="font-semibold text-text-p mb-4 text-sm uppercase ">Current Gear Status</h3>
                  <BarChart data={gearStatusBreakdown} />
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'rentals' && (
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-semibold text-text-p mb-4 text-sm uppercase ">Rental Status Breakdown</h3>
            <BarChart data={rentalStatusBreakdown(rentals)} />
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-border-col">
              <h3 className="font-semibold text-text-p text-sm uppercase ">All Rentals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-table-hd text-text-s text-xs ">
                    <th className="text-left px-5 py-3 font-medium">Student</th>
                    <th className="text-left px-5 py-3 font-medium">Gear</th>
                    <th className="text-left px-5 py-3 font-medium">Due</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((r, i) => (
                    <tr key={r.id} className={i < rentals.length - 1 ? 'border-b border-border-col' : ''}>
                      <td className="px-5 py-3 font-medium text-text-p">{r.student}</td>
                      <td className="px-5 py-3 text-text-s">{r.gear}</td>
                      <td className="px-5 py-3 text-text-s text-xs">{r.dueDate}</td>
                      <td className="px-5 py-3"><RentalBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'gear' && (
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-semibold text-text-p mb-4 text-sm uppercase ">Gear Status Breakdown</h3>
            <BarChart data={gearStatusBreakdown} />
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-border-col">
              <h3 className="font-semibold text-text-p text-sm uppercase ">Most Rented Gear Types</h3>
              <p className="text-xs text-text-dis mt-1">Grouped by item type rather than inventory ID.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-table-hd text-text-s text-xs ">
                    <th className="text-left px-5 py-3 font-medium">Item</th>
                    <th className="text-left px-5 py-3 font-medium">Category</th>
                    <th className="text-left px-5 py-3 font-medium">Times Rented</th>
                  </tr>
                </thead>
                <tbody>
                  {rentalTypeCounts.map((item, i) => (
                    <tr key={item.name} className={i < rentalTypeCounts.length - 1 ? 'border-b border-border-col' : ''}>
                      <td className="px-5 py-3 font-medium text-text-p">{item.name}</td>
                      <td className="px-5 py-3 text-text-s">{item.category}</td>
                      <td className="px-5 py-3 text-text-p font-medium">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="font-semibold text-text-p text-sm uppercase mb-4">Least Frequently Rented</h3>
              <div className="space-y-3">
                {leastRented.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm text-text-p">{item.name}</span>
                    <span className="text-xs text-text-s">{item.count} rentals</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-text-p text-sm uppercase ">Tent Size Demand</h3>
              <p className="text-xs text-text-dis mt-1 mb-4">Use demand by capacity to guide purchasing.</p>
              <div className="space-y-3">
                {tentSizeDemand.map((item, index) => (
                  <div key={item.size} className="flex items-center justify-between">
                    <span className="text-sm text-text-p">{item.size}</span>
                    <span className={`text-xs font-medium ${index === 0 ? 'text-pine' : 'text-text-s'}`}>
                      {item.rentals} rentals{index === 0 ? ' · Buy more' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'donors' && <DonorReport />}
    </div>
  )
}
