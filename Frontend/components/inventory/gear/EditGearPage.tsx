import { useEffect, useState } from 'react'
import { Btn, Card, Modal } from '@/components/rentals/ui'
import { headingStyle } from '../InventoryUi'
import type { Gear, InventoryPage } from '../types'
import { GearForm, validateGearForm } from './GearForm'

type Props = {
  gearItem: Gear
  navigate: (p: InventoryPage, id?: number) => void
  onSave: (gear: Gear) => void
  onDelete: (id: number) => void
}

export function EditGearPage({ gearItem, navigate, onSave, onDelete }: Props) {
  const [form, setForm] = useState<Gear>({ ...gearItem })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({ ...gearItem })
    setSuccess(false)
    setError('')
  }, [gearItem.id])

  useEffect(() => {
    if (!success) return
    const timeout = setTimeout(() => navigate('gear'), 1500)
    return () => clearTimeout(timeout)
  }, [success, navigate])

  const handleSave = () => {
    const message = validateGearForm(form)
    if (message) {
      setError(message)
      return
    }
    setError('')
    onSave({ ...form, name: form.name.trim() })
    setSuccess(true)
  }

  const handleDelete = () => {
    onDelete(gearItem.id)
    setShowDeleteConfirm(false)
    navigate('gear')
  }

  if (success) {
    return (
      <Card className="max-w-sm mx-auto mt-20 p-8 text-center">
        <div className="w-14 h-14 bg-sage rounded-full flex items-center justify-center mx-auto mb-4 text-pine text-2xl">✓</div>
        <h2 className="text-xl font-bold text-text-p mb-2">Gear Updated!</h2>
        <p className="text-sm text-text-s">{form.name} has been updated.</p>
        <div className="mt-5">
          <Btn onClick={() => navigate('gear')} variant="primary">View Gear Inventory</Btn>
        </div>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <h1 style={headingStyle} className="mb-6">Edit Gear</h1>
      <GearForm
        value={form}
        onChange={changes => setForm(previous => ({ ...previous, ...changes }))}
        onDeactivateRequest={() => setShowStatusConfirm(true)}
      />
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 mt-5">
        <Btn onClick={() => navigate('gear')} variant="secondary">Cancel</Btn>
        <Btn onClick={() => setShowDeleteConfirm(true)} variant="destructive">Delete Gear</Btn>
        <Btn onClick={handleSave} variant="primary">Save Changes</Btn>
      </div>

      {showStatusConfirm && (
        <Modal
          title="Deactivate Gear?"
          onClose={() => setShowStatusConfirm(false)}
          footer={<>
            <Btn onClick={() => setShowStatusConfirm(false)} variant="secondary">Cancel</Btn>
            <Btn
              onClick={() => {
                setForm(previous => ({ ...previous, status: 'Inactive' }))
                setShowStatusConfirm(false)
              }}
              variant="destructive"
            >
              Yes, Mark as Inactive
            </Btn>
          </>}
        >
          <p className="text-sm text-text-s">
            Mark <strong>{form.name}</strong> as inactive? It will no longer be offered for new rentals.
          </p>
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal
          title="Delete Gear?"
          onClose={() => setShowDeleteConfirm(false)}
          footer={<>
            <Btn onClick={() => setShowDeleteConfirm(false)} variant="secondary">Cancel</Btn>
            <Btn onClick={handleDelete} variant="destructive">Delete Gear</Btn>
          </>}
        >
          <p className="text-sm text-text-s">
            Remove <strong>{form.name}</strong> from the displayed inventory? Database deletion is not yet connected.
          </p>
        </Modal>
      )}
    </div>
  )
}
