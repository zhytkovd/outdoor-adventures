import {
  Card,
  DateInput,
  Field,
  SelectInput,
  Textarea,
  TextInput,
} from '@/components/rentals/ui'
import type { AccessLevel, Gear } from '../types'

export type GearFormValues = Omit<Gear, 'id'>

type GearFormProps = {
  value: GearFormValues
  onChange: (changes: Partial<GearFormValues>) => void
  onDeactivateRequest?: () => void
}

// Later, load these choices from the Categories API instead of hardcoding them.
const categories = ['Camping', 'Water', 'Hiking', 'Climbing', 'Winter', 'Sets']

const numberInputClass =
  'w-full rounded-xl border border-border-col bg-white px-4 py-3 text-sm text-text-p focus:outline-none focus:ring-2 focus:ring-pine/20'

export function validateGearForm(value: GearFormValues): string | null {
  if (!value.name.trim()) return 'Gear name is required.'
  if (!value.category) return 'Category is required.'
  if (!Number.isInteger(value.totalQuantity) || value.totalQuantity <= 0) {
    return 'Total quantity must be a positive integer.'
  }
  if (!Number.isFinite(value.unitCost) || value.unitCost < 0) {
    return 'Unit cost cannot be negative.'
  }
  if (
    !Number.isInteger(value.maintenanceCount) ||
    value.maintenanceCount < 0 ||
    value.maintenanceCount > value.totalQuantity
  ) {
    return 'Maintenance count must be between 0 and total quantity.'
  }
  return null
}

export function GearForm({ value, onChange, onDeactivateRequest }: GearFormProps) {
  const handleActiveChange = (next: string) => {
    if (next === 'Inactive' && value.status !== 'Inactive' && onDeactivateRequest) {
      onDeactivateRequest()
      return
    }
    // Available is a temporary UI value; the backend calculates real availability.
    onChange({ status: next === 'Inactive' ? 'Inactive' : 'Available' })
  }

  return (
    <Card className="p-6 space-y-6">
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-text-p">Gear Information</h2>
        <Field label="Name *">
          <TextInput
            placeholder="e.g., 2-Person Tent"
            value={value.name}
            onChange={name => onChange({ name })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category *">
            <SelectInput
              value={value.category}
              onChange={category => onChange({ category, subcategory: '' })}
              placeholder="Select category..."
              options={categories.map(category => ({ label: category, value: category }))}
            />
          </Field>
          <Field label="Subcategory">
            <TextInput
              placeholder="e.g., Tents"
              value={value.subcategory}
              onChange={subcategory => onChange({ subcategory })}
            />
          </Field>
          <Field label="Size">
            <TextInput
              placeholder="e.g., Medium"
              value={value.size}
              onChange={size => onChange({ size })}
            />
          </Field>
          <Field label="Purchase Date">
            <DateInput
              value={value.purchaseDate}
              onChange={purchaseDate => onChange({ purchaseDate })}
              min=""
            />
          </Field>
          <Field label="Expiration Date">
            <DateInput
              value={value.expirationDate}
              onChange={expirationDate => onChange({ expirationDate })}
              min=""
            />
          </Field>
        </div>
        <Field label="Description">
          <Textarea
            placeholder="Enter details about the gear..."
            value={value.description}
            onChange={description => onChange({ description })}
          />
        </Field>
      </section>

      <section className="space-y-4 border-t border-border-col pt-5">
        <h2 className="text-base font-semibold text-text-p">Inventory &amp; Cost</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Total Quantity *">
            <input
              aria-label="Total Quantity"
              className={numberInputClass}
              type="number"
              min={1}
              step={1}
              value={value.totalQuantity}
              onChange={event => onChange({ totalQuantity: Number(event.target.value) })}
            />
          </Field>
          <Field label="Maintenance Count *">
            <input
              aria-label="Maintenance Count"
              className={numberInputClass}
              type="number"
              min={0}
              step={1}
              value={value.maintenanceCount}
              onChange={event => onChange({ maintenanceCount: Number(event.target.value) })}
            />
          </Field>
          <Field label="Unit Cost ($) *">
            <input
              aria-label="Unit Cost"
              className={numberInputClass}
              type="number"
              min={0}
              step="0.01"
              value={value.unitCost}
              onChange={event => onChange({ unitCost: Number(event.target.value) })}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-border-col pt-5">
        <h2 className="text-base font-semibold text-text-p">Condition &amp; Restrictions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Condition">
            <SelectInput
              value={value.condition}
              onChange={condition => onChange({ condition })}
              options={[
                { label: 'Good', value: 'good' },
                { label: 'Minor wear', value: 'minor_wear' },
                { label: 'Damaged', value: 'damaged' },
              ]}
            />
          </Field>
          <Field label="Access">
            <SelectInput
              value={value.access}
              onChange={access => onChange({ access: access as AccessLevel })}
              options={[
                { label: 'Everyone', value: 'Everyone' },
                { label: 'Faculty only', value: 'Faculty only' },
              ]}
            />
          </Field>
          <Field label="Active Status *">
            <SelectInput
              value={value.status === 'Inactive' ? 'Inactive' : 'Active'}
              onChange={handleActiveChange}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
              ]}
            />
            <p className="mt-1 text-xs text-text-s">
              Rented and Maintenance statuses are calculated automatically.
            </p>
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-text-p">
            <input
              type="checkbox"
              checked={value.needsCleaning}
              onChange={event => onChange({ needsCleaning: event.target.checked })}
            />
            Needs Cleaning
          </label>
          <label className="flex items-center gap-2 text-sm text-text-p">
            <input
              type="checkbox"
              checked={value.deliveryAllowed}
              onChange={event => onChange({ deliveryAllowed: event.target.checked })}
            />
            Delivery Allowed
          </label>
          <label className="flex items-center gap-2 text-sm text-text-p">
            <input
              type="checkbox"
              checked={value.isHighRisk}
              onChange={event => onChange({ isHighRisk: event.target.checked })}
            />
            High Risk
          </label>
        </div>
      </section>
    </Card>
  )
}
