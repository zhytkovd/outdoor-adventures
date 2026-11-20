import { useEffect, useState } from 'react'
import { Btn, Card, DateInput, Field, SelectInput, Textarea, TextInput } from '@/components/rentals/ui'
import { headingStyle } from '../InventoryUi'
import type { AccessLevel, Gear, GearStatus, InventoryPage } from '../types'

export function AddGearPage({ navigate, onAdd }: { navigate: (p: InventoryPage, id?: number) => void; onAdd: (g: Omit<Gear, 'id'>) => void }) {
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
