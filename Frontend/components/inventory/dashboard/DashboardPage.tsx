import { Card } from '@/components/rentals/ui'
import { RentalBadge, headingStyle } from '../InventoryUi'
import type { Rental } from '../types'

export function DashboardPage({ rentals }: { rentals: Rental[] }) {
  const reserved = rentals.filter(r => r.status === 'Trip Reserved').length
  const active = rentals.filter(r => r.status === 'Active').length
  const dueSoon = rentals.filter(r => r.status === 'Due Soon').length
  const overdue = rentals.filter(r => r.status === 'Overdue').length
  const recent = rentals.slice(0, 3)

  return (
    <div className="w-full">
      <h1 style={headingStyle} className="mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Trip Reserved', count: reserved },
          { label: 'Active Rentals', count: active },
          { label: 'Due Soon', count: dueSoon },
          { label: 'Overdue Rentals', count: overdue },
        ].map(({ label, count }) => (
          <Card key={label} className="p-4 text-center">
            <div className="text-2xl font-semibold text-text-p">{count}</div>
            <div className="text-sm text-text-s">{label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-border-col flex items-center justify-between">
          <h2 className="font-semibold text-text-p">Recent Rentals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-table-hd text-text-s text-xs ">
                <th className="text-left px-5 py-3 font-medium">Student</th>
                <th className="text-left px-5 py-3 font-medium">Gear</th>
                <th className="text-left px-5 py-3 font-medium">Due Date</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr
                  key={r.id}
                  className={`${i < recent.length - 1 ? 'border-b border-border-col' : ''}`}
                >
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
  )
}
