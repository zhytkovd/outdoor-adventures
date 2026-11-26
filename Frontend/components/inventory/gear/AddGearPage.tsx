
import { useEffect, useState } from 'react'
import { Btn, Card } from '@/components/rentals/ui'
import { headingStyle } from '../InventoryUi'
import type { Gear, InventoryPage } from '../types'
import { GearForm, type GearFormValues, validateGearForm } from './GearForm'

type Props = {
  navigate: (p: InventoryPage, id?: number) => void
  onAdd: (gear: Omit<Gear, 'id'>) => Promise<void>
}

const emptyGear: GearFormValues = {
  name: '',
  category: '',
  subcategory: '',
  size: '',
  purchaseDate: '',
  expirationDate: '',
  description: '',
  totalQuantity: 1,
  unitCost: 0,
  maintenanceCount: 0,
  condition: 'good',
  access: 'Everyone',
  status: 'Available',
  needsCleaning: false,
  deliveryAllowed: false,
  isHighRisk: false,
}

export function AddGearPage({ navigate, onAdd }: Props) {
  const [form, setForm] = useState<GearFormValues>({ ...emptyGear })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!success) return
    const timeout = setTimeout(() => navigate('gear'), 1500)
    return () => clearTimeout(timeout)
  }, [success, navigate])

  const handleSubmit = async () => {
    if (saving) return

    const message = validateGearForm(form)

    if (message) {
      setError(message)
      return
    }

    setError('')
    setSaving(true)

    try {
      await onAdd({ ...form, name: form.name.trim() })
      setSuccess(true)
    }
    catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create gear")
    }
    finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <Card className="max-w-sm mx-auto mt-20 p-8 text-center">
        <div className="w-14 h-14 bg-sage rounded-full flex items-center justify-center mx-auto mb-4 text-pine text-2xl">✓</div>
        <h2 className="text-xl font-bold text-text-p mb-2">Gear Added!</h2>
        <p className="text-sm text-text-s">{form.name} has been added to inventory.</p>
        <div className="mt-5">
          <Btn onClick={() => navigate('gear')} variant="primary">
            View Gear Inventory
          </Btn>
        </div>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <h1 style={headingStyle} className="mb-6">Add New Gear</h1>

      <div className={saving ? 'pointer-events-none opacity-70' : ''}>
        <GearForm
          value={form}
          onChange={changes => {
            if (!saving) {
              setForm(previous => ({ ...previous, ...changes }))
            }
          }}
        />
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 mt-5">
        <Btn
          onClick={() => {
            if (!saving) navigate('gear')
          }}
          variant="secondary"
        >
          Cancel
        </Btn>

        <Btn onClick={handleSubmit} variant="primary">
          {saving ? 'Adding...' : 'Add Gear'}
        </Btn>
      </div>
    </div>
  )
}
