import { Btn, Card } from '@/components/rentals/ui'
import { GearBadge, headingStyle } from '../InventoryUi'
import { GearIllustration } from '@/components/rentals/illustrations'
import { gearIllustrationType } from './gearNames'
import type { Gear, InventoryPage } from '../types'

type Props = {
  gearItem: Gear
  navigate: (page: InventoryPage, id?: number) => void
}

const conditionLabels: Record<string, string> = {
  good: 'Good',
  minor_wear: 'Minor wear',
  damaged: 'Damaged',
}

function formatDate(value: string) {
  if (!value) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function DetailField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs uppercase text-text-dis mb-1">{label}</p>
      <p className="text-sm text-text-p">
        {value === null || value === undefined || value === '' ? '—' : value}
      </p>
    </div>
  )
}

function BooleanField({ label, value }: { label: string; value: boolean }) {
  return <DetailField label={label} value={value ? 'Yes' : 'No'} />
}

export function GearDetailsPage({ gearItem, navigate }: Props) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => navigate('gear')}
        className="text-sm text-text-s hover:text-pine mb-4"
      >
        ← Back to Gear
      </button>
      <h1 style={headingStyle} className="mb-6">Gear Details</h1>

      <Card className="p-6 space-y-6">
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-text-p">Gear Information</h2>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 bg-sage rounded-lg flex items-center justify-center shrink-0">
              <GearIllustration type={gearIllustrationType(gearItem.name)} />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-5 sm:grid-cols-3">
              <DetailField label="Name" value={gearItem.name} />
              <DetailField label="Category" value={gearItem.category} />
              <DetailField label="Subcategory" value={gearItem.subcategory} />
              <DetailField label="Size" value={gearItem.size} />
              <DetailField label="Purchase Date" value={formatDate(gearItem.purchaseDate)} />
              <DetailField label="Expiration Date" value={formatDate(gearItem.expirationDate)} />
            </div>
          </div>
          <DetailField label="Description" value={gearItem.description} />
        </section>

        <section className="space-y-4 border-t border-border-col pt-5">
          <h2 className="text-base font-semibold text-text-p">Inventory &amp; Cost</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <DetailField label="Total Quantity" value={gearItem.totalQuantity} />
            <DetailField label="Maintenance Count" value={gearItem.maintenanceCount} />
            <DetailField label="Unit Cost" value={
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                .format(gearItem.unitCost)
            } />
          </div>
        </section>

        <section className="space-y-4 border-t border-border-col pt-5">
          <h2 className="text-base font-semibold text-text-p">Condition &amp; Restrictions</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <DetailField label="Condition" value={conditionLabels[gearItem.condition] ?? gearItem.condition} />
            <DetailField label="Access" value={gearItem.access} />
            <DetailField label="Active Status" value={gearItem.status === 'Inactive' ? 'Inactive' : 'Active'} />
            <BooleanField label="Needs Cleaning" value={gearItem.needsCleaning} />
            <BooleanField label="Delivery Allowed" value={gearItem.deliveryAllowed} />
            <BooleanField label="High Risk" value={gearItem.isHighRisk} />
          </div>
          <div>
            <p className="text-xs uppercase text-text-dis mb-1">Calculated Inventory Status</p>
            <GearBadge status={gearItem.status} />
          </div>
        </section>
      </Card>

      <div className="mt-5">
        <Btn onClick={() => navigate('edit-gear', gearItem.id)} variant="primary">Edit Gear</Btn>
      </div>
    </div>
  )
}
