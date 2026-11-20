import { useState } from 'react'
import { Btn, Card, SearchField, SelectInput } from '@/components/rentals/ui'
import { GearBadge, headingStyle } from '../InventoryUi'
import type { AccessLevel, Gear, GearStatus, InventoryPage } from '../types'

type GearFilter = 'All' | GearStatus

export function GearPage({ gear, navigate }: { gear: Gear[]; navigate: (p: InventoryPage, id?: number) => void }) {
  const [filter, setFilter] = useState<GearFilter>('All')
  const [accessFilter, setAccessFilter] = useState<'All' | AccessLevel>('All')
  const [search, setSearch] = useState('')

  const filters: GearFilter[] = ['All', 'Available', 'Rented', 'Maintenance', 'Inactive']
  const filtered = gear.filter(g => {
    const matchFilter = filter === 'All' || g.status === filter
    const matchAccess = accessFilter === 'All' || g.access === accessFilter
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchAccess && matchSearch
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 style={headingStyle}>Gear Inventory</h1>
        <Btn
          onClick={() => navigate('add-gear')}
          variant="primary"
        >
          + Add Gear
        </Btn>
      </div>

      <Card>
        <div className="p-4 border-b border-border-col flex items-center gap-3 flex-wrap">
          <SearchField            placeholder="Search gear..."
            value={search}
            onChange={setSearch}
          />
          <div className="flex gap-1 flex-wrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="seg-btn capitalize"
                data-active={filter === f}
                aria-pressed={filter === f}
              >
                {f}
              </button>
            ))}
          </div>
          <SelectInput
  value={accessFilter}
  onChange={value => setAccessFilter(value as 'All' | AccessLevel)}
  options={['All', 'Everyone', 'Staff only'].map(value => ({ label: value, value }))}
/>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-table-hd text-text-s text-xs ">
                <th className="text-left px-5 py-3 font-medium">Gear</th>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Subcategory</th>
                <th className="text-left px-5 py-3 font-medium">Size</th>
                <th className="text-left px-5 py-3 font-medium">Access</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-text-dis text-sm">No gear found</td>
                </tr>
              ) : filtered.map((g, i) => (
                <tr
                  key={g.id}
                  onClick={() => navigate('gear-details', g.id)}
                  className={`cursor-pointer hover:bg-sage transition-colors ${i < filtered.length - 1 ? 'border-b border-border-col' : ''}`}
                >
                  <td className="px-5 py-3 font-medium text-text-p">{g.name}</td>
                  <td className="px-5 py-3 text-text-s">{g.category}</td>
                  <td className="px-5 py-3 text-text-s">{g.subcategory}</td>
                  <td className="px-5 py-3 text-text-s text-xs">{g.size}</td>
                  <td className="px-5 py-3 text-text-s text-xs">{g.access}</td>
                  <td className="px-5 py-3"><GearBadge status={g.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
