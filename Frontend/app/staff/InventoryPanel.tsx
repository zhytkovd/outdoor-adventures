'use client';

import { useEffect, useState } from 'react'
import type { ReservationStatus } from '@/app/rentals/types'
import { Btn, C, Card, DateInput, Field, Modal, SearchField, SelectInput, StatusBadge, Textarea, TextInput } from '@/components/rentals/ui'
import { GearIllustration } from '@/components/rentals/illustrations'

// ─── Types ───────────────────────────────────────────────────────────────────
export type InventoryPage = 'dashboard' | 'gear' | 'categories' | 'reports'
  | 'gear-details' | 'add-gear' | 'edit-gear'

type RentalStatus = 'Trip Reserved' | 'Active' | 'Due Soon' | 'Overdue' | 'Returned'
type GearStatus = 'Available' | 'Rented' | 'Maintenance' | 'Inactive'
type UserRole = 'Student' | 'Staff' | 'Admin'
type UserStatus = 'Active' | 'Inactive'
type AccessLevel = 'Everyone' | 'Staff only'

interface User {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  rentals: number
  joined: string
}

interface Category {
  id: number
  name: string
  description: string
  itemCount: number
  icon: string
  subcategories: string[]
}

interface Rental {
  id: number
  student: string
  gear: string
  dueDate: string
  status: RentalStatus
  durationDays: number
}

interface Gear {
  id: number
  name: string
  category: string
  subcategory: string
  size: string
  purchaseDate: string
  condition: string
  status: GearStatus
  description: string
  access: AccessLevel
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialRentals: Rental[] = [
  { id: 1, student: 'Maya K.', gear: 'Tent #14', dueDate: 'Sept 20', status: 'Active', durationDays: 7 },
  { id: 2, student: 'Jordan T.', gear: 'Backpack #08', dueDate: 'Sept 18', status: 'Due Soon', durationDays: 7 },
  { id: 3, student: 'Alex R.', gear: 'Sleeping Bag', dueDate: 'Sept 17', status: 'Overdue', durationDays: 7 },
  { id: 4, student: 'Taylor S.', gear: 'Kayak #03', dueDate: 'Sept 15', status: 'Overdue', durationDays: 7 },
  { id: 5, student: 'Jamie L.', gear: 'Tent #15', dueDate: 'Sept 12', status: 'Returned', durationDays: 7 },
  { id: 6, student: 'Sam W.', gear: 'Stove #07', dueDate: 'Sept 4', status: 'Returned', durationDays: 3 },
  { id: 7, student: 'Chris M.', gear: 'Tent #14', dueDate: 'Sept 29', status: 'Trip Reserved', durationDays: 5 },
  { id: 8, student: 'Jordan T.', gear: 'Tent #14', dueDate: 'Aug 27', status: 'Returned', durationDays: 7 },
  { id: 9, student: 'Maya K.', gear: 'Backpack #08', dueDate: 'Aug 17', status: 'Returned', durationDays: 5 },
]

const initialUsers: User[] = [
  { id: 1, name: 'Maya K.', email: 'maya.k@school.edu', role: 'Student', status: 'Active', rentals: 4, joined: 'Aug 2026' },
  { id: 2, name: 'Jordan T.', email: 'jordan.t@school.edu', role: 'Student', status: 'Active', rentals: 7, joined: 'Aug 2026' },
  { id: 3, name: 'Alex R.', email: 'alex.r@school.edu', role: 'Student', status: 'Active', rentals: 2, joined: 'Sep 2026' },
  { id: 4, name: 'Taylor S.', email: 'taylor.s@school.edu', role: 'Student', status: 'Active', rentals: 5, joined: 'Aug 2026' },
  { id: 5, name: 'Jamie L.', email: 'jamie.l@school.edu', role: 'Student', status: 'Inactive', rentals: 1, joined: 'Jul 2026' },
  { id: 6, name: 'Sam W.', email: 'sam.w@school.edu', role: 'Student', status: 'Active', rentals: 3, joined: 'Aug 2026' },
  { id: 7, name: 'Chris M.', email: 'chris.m@school.edu', role: 'Staff', status: 'Active', rentals: 0, joined: 'Jan 2025' },
  { id: 8, name: 'Dana P.', email: 'dana.p@school.edu', role: 'Admin', status: 'Active', rentals: 0, joined: 'Jan 2024' },
]

const initialCategories: Category[] = [
  { id: 1, name: 'Camping', description: 'Tents, sleeping bags, tarps, and shelter equipment.', itemCount: 12, icon: '⛺', subcategories: ['Tents', 'Sleep Systems', 'Shelter'] },
  { id: 2, name: 'Hiking', description: 'Backpacks, trekking poles, and trail essentials.', itemCount: 8, icon: '🥾', subcategories: ['Backpacks', 'Trekking Poles'] },
  { id: 3, name: 'Water Sports', description: 'Kayaks, canoes, paddles, and life vests.', itemCount: 5, icon: '🚣', subcategories: ['Kayaks', 'Safety Gear'] },
  { id: 4, name: 'Cooking', description: 'Camp stoves, cookware, and food storage.', itemCount: 9, icon: '🍳', subcategories: ['Stoves', 'Cookware'] },
  { id: 5, name: 'Climbing', description: 'Harnesses, ropes, carabiners, and helmets.', itemCount: 6, icon: '🧗', subcategories: ['Protection', 'Ropes'] },
  { id: 6, name: 'Navigation', description: 'Compasses, maps, and GPS devices.', itemCount: 4, icon: '🧭', subcategories: ['Maps', 'GPS'] },
]

const initialGear: Gear[] = [
  { id: 1, name: 'Tent #14', category: 'Camping', subcategory: 'Tents', size: '2-Person', purchaseDate: 'Jan 5, 2024', condition: 'Good', status: 'Rented', description: 'Compact 2-person tent, great for weekend trips.', access: 'Everyone' },
  { id: 2, name: 'Tent #15', category: 'Camping', subcategory: 'Tents', size: '4-Person', purchaseDate: 'Jan 15, 2024', condition: 'Good', status: 'Available', description: 'Spacious 4-person tent, great for group trips.', access: 'Everyone' },
  { id: 3, name: 'Backpack #08', category: 'Hiking', subcategory: 'Backpacks', size: 'Medium', purchaseDate: 'Feb 3, 2024', condition: 'Good', status: 'Rented', description: '65L hiking backpack with frame support.', access: 'Everyone' },
  { id: 4, name: 'Kayak #03', category: 'Water Sports', subcategory: 'Kayaks', size: '—', purchaseDate: 'Mar 10, 2023', condition: 'Good', status: 'Available', description: 'Single-person sea kayak with paddle.', access: 'Staff only' },
  { id: 5, name: 'Stove #07', category: 'Cooking', subcategory: 'Stoves', size: '—', purchaseDate: 'Jan 5, 2024', condition: 'Needs Repair', status: 'Inactive', description: 'Portable camping stove. Currently not working and needs repair.', access: 'Everyone' },
  { id: 6, name: 'Sleeping Bag', category: 'Camping', subcategory: 'Sleep Systems', size: 'Standard', purchaseDate: 'Dec 1, 2023', condition: 'Fair', status: 'Rented', description: 'Rated to 20°F, suitable for three-season use.', access: 'Everyone' },
]

const itemType = (name: string) => name.replace(/\s+#\d+$/, '')

function gearIllustrationType(name: string) {
  const type = itemType(name).toLowerCase().replace(/\s+/g, '-')
  return type === 'stove' ? 'camp-stove' : type
}

// ─── Status Badges ────────────────────────────────────────────────────────────
const rentalTones: Record<RentalStatus, ReservationStatus> = {
  'Trip Reserved': 'Checked Out',
  Active: 'Approved',
  'Due Soon': 'Pending',
  Overdue: 'Denied',
  Returned: 'Returned',
}

const gearTones: Record<GearStatus, ReservationStatus> = {
  Available: 'Approved',
  Rented: 'Checked Out',
  Maintenance: 'Pending',
  Inactive: 'Returned',
}

function RentalBadge({ status }: { status: RentalStatus }) {
  return <StatusBadge status={rentalTones[status]} label={status} />
}

function GearBadge({ status }: { status: GearStatus }) {
  return <StatusBadge status={gearTones[status]} label={status} />
}

const headingStyle = { fontSize: 26, fontWeight: 700, color: C.tp, letterSpacing: '-0.02em' }

// ─── Page: Dashboard ──────────────────────────────────────────────────────────
function DashboardPage({ rentals }: { rentals: Rental[] }) {
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

// ─── Page: Gear Inventory ─────────────────────────────────────────────────────
type GearFilter = 'All' | GearStatus

function GearPage({ gear, navigate }: { gear: Gear[]; navigate: (p: InventoryPage, id?: number) => void }) {
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

// ─── Page: Gear Details ───────────────────────────────────────────────────────
function GearDetailsPage({
  gearItem, navigate
}: {
  gearItem: Gear
  navigate: (p: InventoryPage, id?: number) => void
}) {
  return (
    <div className="w-full">
      <Btn
        onClick={() => navigate('gear')}
        variant="ghost" size="sm"
      >
        ← Back to Gear
      </Btn>

      <h1 style={headingStyle} className="mb-6">Gear Details</h1>

      <Card className="p-6">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 bg-sage rounded-lg border border-sage flex items-center justify-center shrink-0">
            <GearIllustration type={gearIllustrationType(gearItem.name)} />
          </div>
          <div className="flex-1">
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Name</div>
            <div className="text-xl font-bold text-text-p mb-3">{gearItem.name}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-text-dis uppercase font-medium mb-0.5">Category</div>
                <div className="text-text-p">{gearItem.category}</div>
              </div>
              <div>
                <div className="text-xs text-text-dis uppercase font-medium mb-0.5">Size</div>
                <div className="text-text-p">{gearItem.size}</div>
              </div>
              <div>
                <div className="text-xs text-text-dis uppercase font-medium mb-0.5">Subcategory</div>
                <div className="text-text-p">{gearItem.subcategory}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border-col pt-4 mb-4 text-sm">
          <div>
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Purchase Date</div>
            <div className="text-text-p">{gearItem.purchaseDate}</div>
          </div>
          <div>
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Condition</div>
            <div className="text-text-p">{gearItem.condition}</div>
          </div>
          <div>
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Status</div>
            <GearBadge status={gearItem.status} />
          </div>
          <div>
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Access</div>
            <div className="text-text-p">{gearItem.access}</div>
          </div>
        </div>

        <div className="border-t border-border-col pt-4">
          <div className="text-xs text-text-dis uppercase font-medium mb-1">Description</div>
          <p className="text-sm text-text-s">{gearItem.description}</p>
        </div>
      </Card>

      <Btn
        onClick={() => navigate('edit-gear', gearItem.id)}
        variant="primary"
      >
        Edit Gear
      </Btn>
    </div>
  )
}

// ─── Page: Add Gear ───────────────────────────────────────────────────────────
function AddGearPage({ navigate, onAdd }: { navigate: (p: InventoryPage, id?: number) => void; onAdd: (g: Omit<Gear, 'id'>) => void }) {
  const [form, setForm] = useState({
    name: '', category: '', subcategory: '', size: '', purchaseDate: '',
    condition: 'Good', status: 'Available' as GearStatus, description: '', access: 'Everyone' as AccessLevel
  })
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) return
    const timeout = setTimeout(() => navigate('gear'), 1500)
    return () => clearTimeout(timeout)
  }, [success, navigate])

  const handleSubmit = () => {
    if (!form.name || !form.category) return
    onAdd({ ...form, status: form.status as GearStatus })
    setSuccess(true)
  }

  if (success) {
    return (
      <Card className="max-w-sm mx-auto mt-20 p-8 text-center">
        <div className="w-14 h-14 bg-sage rounded-full flex items-center justify-center mx-auto mb-4 text-pine text-2xl">✓</div>
        <h2 className="text-xl font-bold text-text-p mb-2">Gear Added!</h2>
        <p className="text-sm text-text-s">{form.name} has been added to inventory.</p>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <h1 style={headingStyle} className="mb-6">Add New Gear</h1>

      <Card className="p-6 space-y-4">
        <Field label="Name *">
          <TextInput
            placeholder="e.g., Sleeping Bag"
            value={form.name}
            onChange={value => setForm({ ...form, name: value })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category *">
            <SelectInput
              value={form.category}
              onChange={value => setForm({ ...form, category: value })}
              placeholder="Select category..."
              options={['Camping', 'Hiking', 'Water Sports', 'Cooking', 'Climbing'].map(value => ({ label: value, value }))}
            />
          </Field>
          <Field label="Subcategory">
            <TextInput
              placeholder="e.g., Tents"
              value={form.subcategory}
              onChange={value => setForm({ ...form, subcategory: value })}
            />
          </Field>
          <Field label="Size">
            <TextInput
              placeholder="e.g., Medium"
              value={form.size}
              onChange={value => setForm({ ...form, size: value })}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Purchase Date">
            <DateInput
              value={form.purchaseDate}
              onChange={value => setForm({ ...form, purchaseDate: value })}
              min=""
            />
          </Field>
          <Field label="Access">
            <SelectInput
              value={form.access}
              onChange={value => setForm({ ...form, access: value as AccessLevel })}
              options={['Everyone', 'Staff only'].map(value => ({ label: value, value }))}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Condition">
            <SelectInput
              value={form.condition}
              onChange={value => setForm({ ...form, condition: value })}
              options={['Excellent', 'Good', 'Fair', 'Needs Repair'].map(value => ({ label: value, value }))}
            />
          </Field>
          <Field label="Status *">
            <SelectInput
              value={form.status}
              onChange={value => setForm({ ...form, status: value as GearStatus })}
              options={['Available', 'Maintenance', 'Inactive'].map(value => ({ label: value, value }))}
            />
          </Field>
        </div>
        <Field label="Description">
          <Textarea
            placeholder="Enter details about the gear..."
            value={form.description}
            onChange={value => setForm({ ...form, description: value })}
          />
        </Field>
      </Card>

      <div className="flex gap-3 mt-5">
        <Btn
          onClick={() => navigate('gear')}
          variant="secondary"
        >
          Cancel
        </Btn>
        <Btn
          onClick={handleSubmit}
          variant="primary"
        >
          Add Gear
        </Btn>
      </div>
    </div>
  )
}

// ─── Page: Edit Gear ──────────────────────────────────────────────────────────
function EditGearPage({
  gearItem, navigate, onSave, onDelete
}: {
  gearItem: Gear
  navigate: (p: InventoryPage, id?: number) => void
  onSave: (g: Gear) => void
  onDelete: (id: number) => void
}) {
  const [form, setForm] = useState({ ...gearItem })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<GearStatus>(gearItem.status)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) return
    const timeout = setTimeout(() => navigate('gear'), 1500)
    return () => clearTimeout(timeout)
  }, [success, navigate])

  const handleStatusChange = (status: GearStatus) => {
    if (status === 'Inactive' && form.status !== 'Inactive') {
      setPendingStatus(status)
      setShowStatusConfirm(true)
    } else {
      setForm({ ...form, status })
    }
  }

  const confirmStatusChange = () => {
    setForm({ ...form, status: pendingStatus })
    setShowStatusConfirm(false)
  }

  const handleSave = () => {
    onSave(form)
    setSuccess(true)
  }

  const handleDelete = () => {
    onDelete(gearItem.id)
    navigate('gear')
  }

  if (success) {
    return (
      <Card className="max-w-sm mx-auto mt-20 p-8 text-center">
        <div className="w-14 h-14 bg-sage rounded-full flex items-center justify-center mx-auto mb-4 text-pine text-2xl">✓</div>
        <h2 className="text-xl font-bold text-text-p mb-2">Gear Updated!</h2>
        <p className="text-sm text-text-s">{form.name} has been updated.</p>
        <Btn
          onClick={() => navigate('gear')}
          variant="primary"
        >
          View Gear Inventory
        </Btn>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <h1 style={headingStyle} className="mb-6">Edit Gear</h1>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-border-col">
          <div className="w-16 h-16 bg-sage rounded-lg border border-sage flex items-center justify-center">
            <GearIllustration type={gearIllustrationType(gearItem.name)} />
          </div>
          <div>
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Name *</div>
            <TextInput
            value={form.name}
              onChange={value => setForm({ ...form, name: value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category *">
            <SelectInput
              value={form.category}
              onChange={value => setForm({ ...form, category: value })}
              options={['Camping', 'Hiking', 'Water Sports', 'Cooking', 'Climbing'].map(value => ({ label: value, value }))}
            />
          </Field>
          <Field label="Size">
            <TextInput
              value={form.size}
              onChange={value => setForm({ ...form, size: value })}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Purchase Date">
            <TextInput
              value={form.purchaseDate}
              onChange={value => setForm({ ...form, purchaseDate: value })}
            />
          </Field>
          <Field label="Access">
            <SelectInput
              value={form.access}
              onChange={value => setForm({ ...form, access: value as AccessLevel })}
              options={['Everyone', 'Staff only'].map(value => ({ label: value, value }))}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Condition">
            <SelectInput
              value={form.condition}
              onChange={value => setForm({ ...form, condition: value })}
              options={['Excellent', 'Good', 'Fair', 'Needs Repair'].map(value => ({ label: value, value }))}
            />
          </Field>
          <Field label="Status *">
            <SelectInput
              value={form.status}
              onChange={value => handleStatusChange(value as GearStatus)}
              options={['Available', 'Rented', 'Maintenance', 'Inactive'].map(value => ({ label: value, value }))}
            />
          </Field>
        </div>

        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={value => setForm({ ...form, description: value })}
          />
        </Field>
      </Card>

      <div className="flex gap-3 mt-5">
        <Btn
          onClick={() => navigate('gear')}
          variant="secondary"
        >
          Cancel
        </Btn>
        <Btn
          onClick={() => setShowDeleteConfirm(true)}
          variant="destructive"
        >
          Delete Gear
        </Btn>
        <Btn
          onClick={handleSave}
          variant="primary"
        >
          Save Changes
        </Btn>
      </div>

      {showStatusConfirm && (
        <Modal
          title="Change Gear Status?"
          onClose={() => setShowStatusConfirm(false)}
          footer={<>
              <Btn
                onClick={() => setShowStatusConfirm(false)}
                variant="secondary"
              >
                Cancel
              </Btn>
              <Btn
                onClick={confirmStatusChange}
                variant="destructive"
              >
                Yes, Mark as Inactive
              </Btn>
          </>}
        >
        <p className="text-sm text-text-s mb-5">
          Are you sure you want to mark <strong>{form.name}</strong> as Inactive?
          <br /><br />
          This item will no longer appear in the available gear list and cannot be selected for new rentals.
        </p>
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal
          title="Delete Gear?"
          onClose={() => setShowDeleteConfirm(false)}
          footer={<>
              <Btn
                onClick={() => setShowDeleteConfirm(false)}
                variant="secondary"
              >
                Cancel
              </Btn>
              <Btn
                onClick={handleDelete}
                variant="destructive"
              >
                Delete
              </Btn>
          </>}
        >
        <p className="text-sm text-text-s mb-5">
          Are you sure you want to permanently delete <strong>{form.name}</strong>? This action cannot be undone.
        </p>
        </Modal>
      )}
    </div>
  )
}

// ─── Page: Categories ─────────────────────────────────────────────────────────
function CategoriesPage({ categories, setCategories, gear }: { categories: Category[]; setCategories: React.Dispatch<React.SetStateAction<Category[]>>; gear: Gear[] }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', description: '', icon: '📦', subcategories: '' })
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const openAdd = () => {
    setForm({ name: '', description: '', icon: '📦', subcategories: '' })
    setEditingId(null)
    setShowAddModal(true)
  }

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, description: cat.description, icon: cat.icon, subcategories: cat.subcategories.join(', ') })
    setEditingId(cat.id)
    setShowAddModal(true)
  }

  const saveCategory = () => {
    if (!form.name) return
    if (editingId) {
      setCategories(prev => prev.map(c => c.id === editingId ? { ...c, ...form, subcategories: form.subcategories.split(',').map(s => s.trim()).filter(Boolean) } : c))
    } else {
      setCategories(prev => [...prev, { id: Date.now(), ...form, subcategories: form.subcategories.split(',').map(s => s.trim()).filter(Boolean), itemCount: 0 }])
    }
    setShowAddModal(false)
  }

  const confirmDelete = () => {
    if (deleteId) setCategories(prev => prev.filter(c => c.id !== deleteId))
    setDeleteId(null)
  }

  const gearCountForCategory = (name: string) => gear.filter(g => g.category === name).length

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 style={headingStyle}>Categories</h1>
        <Btn
          onClick={openAdd}
          variant="primary"
        >
          + Add Category
        </Btn>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {categories.map(cat => {
          const liveCount = gearCountForCategory(cat.name)
          return (
            <Card key={cat.id} className="px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-sage rounded-lg flex items-center justify-center text-2xl shrink-0">
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text-p">{cat.name}</div>
                <div className="text-sm text-text-s truncate">{cat.description}</div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {cat.subcategories.map(sub => (
                    <span key={sub} className="text-xs bg-table-hd text-text-s px-2 py-0.5 rounded">{sub}</span>
                  ))}
                </div>
              </div>
              <div className="text-center shrink-0">
                <div className="text-xl font-bold text-pine ">{liveCount || cat.itemCount}</div>
                <div className="text-xs text-text-dis">items</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Btn
                  onClick={() => openEdit(cat)}
                  variant="secondary" size="sm"
                >
                  Edit
                </Btn>
                <Btn
                  onClick={() => setDeleteId(cat.id)}
                  variant="destructive" size="sm"
                >
                  Delete
                </Btn>
              </div>
            </Card>
          )
        })}
      </div>

      {showAddModal && (
        <Modal
          title={editingId ? 'Edit Category' : 'Add Category'}
          onClose={() => setShowAddModal(false)}
          footer={<>
            <Btn onClick={() => setShowAddModal(false)} variant="secondary">Cancel</Btn>
            <Btn onClick={saveCategory}>{editingId ? 'Save Changes' : 'Add Category'}</Btn>
          </>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-[5rem_1fr] gap-3">
              <Field label="Icon">
                <TextInput
                value={form.icon} onChange={value => setForm({ ...form, icon: value })} />
              </Field>
              <Field label="Name *">
                <TextInput
                value={form.name} onChange={value => setForm({ ...form, name: value })} placeholder="e.g., Climbing" />
              </Field>
            </div>
            <Field label="Description">
              <Textarea value={form.description} onChange={value => setForm({ ...form, description: value })} placeholder="Brief description of what goes in this category..." />
            </Field>
            <Field label="Subcategories" helper="Separate subcategories with commas.">
              <TextInput
              value={form.subcategories} onChange={value => setForm({ ...form, subcategories: value })} placeholder="e.g., Tents, Sleep Systems, Shelter" />
            </Field>
          </div>
        </Modal>
      )}

      {deleteId !== null && (
        <Modal
          title="Delete Category?"
          onClose={() => setDeleteId(null)}
          footer={<>
              <Btn onClick={() => setDeleteId(null)} variant="secondary">Cancel</Btn>
              <Btn onClick={confirmDelete} variant="destructive">Delete</Btn>
          </>}
        >
        <p className="text-sm text-text-s mb-5">This will remove the category. Existing gear items in this category will be unaffected.</p>
        </Modal>
      )}
    </div>
  )
}

// ─── Page: Reports ────────────────────────────────────────────────────────────
function ReportsPage({ rentals, gear, users }: { rentals: Rental[]; gear: Gear[]; users: User[] }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rentals' | 'gear' | 'donors'>('overview')

  const totalRentals = rentals.length
  const activeRentals = rentals.filter(r => r.status === 'Active').length
  const overdueRentals = rentals.filter(r => r.status === 'Overdue').length
  const returnedRentals = rentals.filter(r => r.status === 'Returned').length
  const availableGear = gear.filter(g => g.status === 'Available').length
  const rentedGear = gear.filter(g => g.status === 'Rented').length
  const activeUsers = users.filter(u => u.status === 'Active').length
  const averageDuration = Math.round((rentals.reduce((sum, rental) => sum + rental.durationDays, 0) / Math.max(rentals.length, 1)) * 10) / 10
  const uniqueRentalTypes = new Set(rentals.map(r => itemType(r.gear))).size
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
  const donors = [
    { name: 'Alpine Community Fund', type: 'Grant', contribution: '$12,500', items: 0, lastGift: 'Aug 28, 2026' },
    { name: 'Trailhead Outfitters', type: 'Gear', contribution: '$8,400', items: 18, lastGift: 'Aug 12, 2026' },
    { name: 'North Valley Alumni', type: 'Campaign', contribution: '$6,250', items: 0, lastGift: 'Jul 30, 2026' },
    { name: 'Summit Club', type: 'Gear', contribution: '$3,100', items: 9, lastGift: 'Jul 18, 2026' },
  ]

  const statusBreakdown: { label: RentalStatus; count: number; color: string }[] = [
    { label: 'Trip Reserved', count: rentals.filter(r => r.status === 'Trip Reserved').length, color: 'bg-pine' },
    { label: 'Active', count: activeRentals, color: 'bg-pine' },
    { label: 'Due Soon', count: rentals.filter(r => r.status === 'Due Soon').length, color: 'bg-surface' },
    { label: 'Overdue', count: overdueRentals, color: 'bg-clay' },
    { label: 'Returned', count: returnedRentals, color: 'bg-text-s' },
  ]

  const gearStatusBreakdown: { label: GearStatus; count: number; color: string }[] = [
    { label: 'Available', count: availableGear, color: 'bg-pine' },
    { label: 'Rented', count: rentedGear, color: 'bg-surface' },
    { label: 'Maintenance', count: gear.filter(g => g.status === 'Maintenance').length, color: 'bg-surface' },
    { label: 'Inactive', count: gear.filter(g => g.status === 'Inactive').length, color: 'bg-text-s' },
  ]

  const BarChart = ({ data }: { data: { label: string; count: number; color: string }[] }) => {
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Rentals', value: totalRentals, sub: 'all time' },
              { label: 'Unique Items', value: uniqueRentalTypes, sub: 'gear types rented' },
              { label: 'Avg. Duration', value: `${averageDuration}d`, sub: 'per rental' },
              { label: 'Active Now', value: activeRentals, sub: 'currently out' },
              { label: 'Active Users', value: activeUsers, sub: 'registered' },
            ].map(s => (
              <Card key={s.label} className="p-4 text-center">
                <div className="text-2xl font-bold text-text-p">{s.value}</div>
                <div className="text-xs font-semibold text-text-p mt-1">{s.label}</div>
                <div className="text-xs text-text-dis">{s.sub}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="font-semibold text-text-p mb-4 text-sm uppercase ">Rental Status</h3>
              <BarChart data={statusBreakdown} />
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-text-p mb-4 text-sm uppercase ">Gear Status</h3>
              <BarChart data={gearStatusBreakdown} />
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'rentals' && (
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-semibold text-text-p mb-4 text-sm uppercase ">Rental Status Breakdown</h3>
            <BarChart data={statusBreakdown} />
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

      {activeTab === 'donors' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold text-text-p">$30,250</div>
              <div className="text-xs font-semibold text-text-p mt-1">Total Support</div>
              <div className="text-xs text-text-dis">estimated value</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-text-p">27</div>
              <div className="text-xs font-semibold text-text-p mt-1">Gear Donated</div>
              <div className="text-xs text-text-dis">inventory items</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-text-p">{donors.length}</div>
              <div className="text-xs font-semibold text-text-p mt-1">Active Donors</div>
              <div className="text-xs text-text-dis">this year</div>
            </Card>
          </div>
          <Card>
            <div className="px-5 py-4 border-b border-border-col">
              <h3 className="font-semibold text-text-p text-sm uppercase ">Donor Contributions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-table-hd text-text-s text-xs ">
                    <th className="text-left px-5 py-3 font-medium">Donor</th>
                    <th className="text-left px-5 py-3 font-medium">Type</th>
                    <th className="text-left px-5 py-3 font-medium">Value</th>
                    <th className="text-left px-5 py-3 font-medium">Gear Items</th>
                    <th className="text-left px-5 py-3 font-medium">Last Gift</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((donor, index) => (
                    <tr key={donor.name} className={index < donors.length - 1 ? 'border-b border-border-col' : ''}>
                      <td className="px-5 py-3 font-medium text-text-p">{donor.name}</td>
                      <td className="px-5 py-3 text-text-s">{donor.type}</td>
                      <td className="px-5 py-3 text-text-p ">{donor.contribution}</td>
                      <td className="px-5 py-3 text-text-s ">{donor.items || '—'}</td>
                      <td className="px-5 py-3 text-text-s text-xs">{donor.lastGift}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export function InventoryPanel({ page, selectedId, navigate }: {
  page: InventoryPage | null
  selectedId: number | null
  navigate: (page: InventoryPage, id?: number) => void
}) {
  const [gear, setGear] = useState<Gear[]>(initialGear)
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  const selectedGear = gear.find(g => g.id === selectedId)

  const addGear = (g: Omit<Gear, 'id'>) => {
    setGear(prev => [...prev, { ...g, id: Date.now() }])
  }

  const saveGear = (updated: Gear) => {
    setGear(prev => prev.map(g => g.id === updated.id ? updated : g))
  }

  const deleteGear = (id: number) => {
    setGear(prev => prev.filter(g => g.id !== id))
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage rentals={initialRentals} />
      case 'gear':
        return <GearPage gear={gear} navigate={navigate} />
      case 'gear-details':
        return selectedGear
          ? <GearDetailsPage gearItem={selectedGear} navigate={navigate} />
          : <GearPage gear={gear} navigate={navigate} />
      case 'add-gear':
        return <AddGearPage navigate={navigate} onAdd={addGear} />
      case 'edit-gear':
        return selectedGear
          ? <EditGearPage gearItem={selectedGear} navigate={navigate} onSave={saveGear} onDelete={deleteGear} />
          : <GearPage gear={gear} navigate={navigate} />
      case 'categories':
        return <CategoriesPage categories={categories} setCategories={setCategories} gear={gear} />
      case 'reports':
        return <ReportsPage rentals={initialRentals} gear={gear} users={initialUsers} />
      case null:
        return null
    }
  }

  if (page === null) return null

  return (
    <div className="min-w-0">
      <p className="mb-3 text-sm text-text-s">Sample inventory data. Changes last until you sign out or reload.</p>
      {renderPage()}
    </div>
  )
}
