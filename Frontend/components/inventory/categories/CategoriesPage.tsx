import { useState } from 'react'
import { Btn, Card, Field, Modal, Textarea, TextInput } from '@/components/rentals/ui'
import { headingStyle } from '../InventoryUi'
import type { Category, Gear } from '../types'

export function CategoriesPage({ categories, setCategories, gear }: { categories: Category[]; setCategories: React.Dispatch<React.SetStateAction<Category[]>>; gear: Gear[] }) {
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
