import { useEffect, useState } from 'react'
import { Btn, Card, Field, Modal, SelectInput, Textarea, TextInput } from '@/components/rentals/ui'
import { headingStyle } from '../InventoryUi'
import type { AccessLevel, Gear, GearStatus, InventoryPage } from '../types'
import { GearIllustration } from '@/components/rentals/illustrations'
import { gearIllustrationType } from './gearNames'

export function EditGearPage({
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
