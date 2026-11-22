import { useRef, useState } from 'react'
import { Btn, Card, Modal } from '@/components/rentals/ui'
import { headingStyle } from '../InventoryUi'
import type { Category } from '../types'

type DraftSubcategory = {
    key: number
    name: string
}

export type NewCategoryInput = {
    name: string
    description: string | null
    icon: string | null
    subcategories: {name: string}[]
}

type Props = {
    categories: Category[]
    loading: boolean
    error: string | null
    onAdd: (category: NewCategoryInput) => Promise<void>
}

export function CategoriesPage({ categories, loading, error, onAdd }: Props) {
    const [showAdd, setShowAdd] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [icon, setIcon] = useState('')
    const [subcategories, setSubcategories] = useState<DraftSubcategory[]>([])
    const nextSubcategoryKey = useRef(1)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')

    const openAdd = () => {
        setName('')
        setDescription('')
        setIcon('')
        setSubcategories([])
        nextSubcategoryKey.current = 1
        setFormError('')
        setShowAdd(true)
    }

    const addSubcategory = () => {
        const key = nextSubcategoryKey.current++
        setSubcategories(previous => [...previous, {key, name: ''}])
    }

    const updateSubcategory = (key: number, name: string) => {
        setSubcategories(previous => previous.map(sub => sub.key === key ? {...sub, name} : sub))
    }

    const removeSubcategory = (key: number) => {
        setSubcategories(previous => previous.filter(sub => sub.key !== key))
    }

    const handleAdd = async () => {
        if(saving) return

        const subcategoryNames = subcategories.map(sub => sub.name.trim())

        if(!name.trim() || name.length > 100){
            setFormError('Category name must be between 1 and 100 characters')
            return
        }

        if(icon.length > 50){
            setFormError('Icon name cannot exceed 50 characters')
            return
        }

        if(subcategoryNames.some(value => value === '' || value.length > 100)){
            setFormError('Each subcategory must have a name between 1 and 100 characters')
            return
        }

        if(new Set(subcategoryNames.map(value => value.toLowerCase())).size !== subcategoryNames.length){
            setFormError('Duplicate subcategory name')
            return
        }

        setSaving(true)
        setFormError('')

        try{
            await onAdd({
                name: name.trim(),
                description: description.trim() || null,
                icon: icon.trim() || null,
                subcategories: subcategoryNames.map(name => ({name}))
            })
            setShowAdd(false)
        }
        catch(error){
            setFormError(error instanceof Error ? error.message : 'Failed to create category')
        }
        finally{
            setSaving(false)
        }
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h1 style={headingStyle}>Categories</h1>
                <Btn onClick={openAdd} variant="primary">+ Add Category</Btn>
            </div>

            {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}

            {loading ? (
                <div className="p-6 text-center text-text-s">Loading categories...</div>
            ) : categories.length === 0 ? (
                <div className="p-6 text-center text-text-s">No categories found.</div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {categories.map(cat => (
                        <Card key={cat.id} className="px-5 py-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-sage rounded-lg flex items-center justify-center text-2xl shrink-0">
                                {cat.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-text-p">{cat.name}</div>
                                <div className="text-sm text-text-s truncate">{cat.description || 'No description'}</div>
                                <div className="flex gap-1.5 mt-2 flex-wrap">
                                    {cat.subcategories.map(sub => (
                                        <span key={sub.id} className="text-xs bg-table-hd text-text-s px-2 py-0.5 rounded">
                                            {sub.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-center shrink-0">
                                <div className="text-xl font-bold text-pine">{cat.itemCount}</div>
                                <div className="text-xs text-text-dis">items</div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button type="button" disabled className="rounded-lg border border-border-col px-3 py-2 text-sm text-text-s opacity-50 cursor-not-allowed">Edit</button>
                                <button type="button" disabled className="rounded-lg px-3 py-2 bg-red-600 text-white text-sm opacity-50 cursor-not-allowed">Delete</button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {showAdd && (
                <Modal
                    title="Add Category"
                    onClose={() => {if(!saving) setShowAdd(false)}}
                    footer={<>
                        <Btn onClick={() => {if(!saving) setShowAdd(false)}} variant="secondary">Cancel</Btn>
                        <Btn onClick={handleAdd} variant="primary">{saving ? 'Adding...' : 'Add Category'}</Btn>
                    </>}
                >
                    <div className={saving ? 'space-y-4 pointer-events-none opacity-70' : 'space-y-4'}>
                        <div className="grid grid-cols-[90px_1fr] gap-3">
                            <label className="block text-sm text-text-p">
                                Icon
                                <input
                                    type="text"
                                    value={icon}
                                    maxLength={50}
                                    onChange={event => setIcon(event.target.value)}
                                    placeholder="tent"
                                    className="mt-1 w-full rounded-lg border border-border-col bg-white px-3 py-2 text-sm"
                                />
                            </label>
                            <label className="block text-sm text-text-p">
                                Name *
                                <input
                                    type="text"
                                    value={name}
                                    maxLength={100}
                                    onChange={event => setName(event.target.value)}
                                    placeholder="e.g., Cycling"
                                    className="mt-1 w-full rounded-lg border border-border-col bg-white px-3 py-2 text-sm"
                                />
                            </label>
                        </div>

                        <label className="block text-sm text-text-p">
                            Description
                            <textarea
                                value={description}
                                onChange={event => setDescription(event.target.value)}
                                placeholder="Brief description of what goes in this category..."
                                rows={3}
                                className="mt-1 w-full rounded-lg border border-border-col bg-white px-3 py-2 text-sm resize-y"
                            />
                        </label>

                        <div>
                            <label className="block text-sm text-text-p mb-2">Subcategories</label>
                            <div className="space-y-2">
                                {subcategories.map((sub, index) => (
                                    <div key={sub.key} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            aria-label={`Subcategory ${index + 1}`}
                                            value={sub.name}
                                            maxLength={100}
                                            onChange={event => updateSubcategory(sub.key, event.target.value)}
                                            placeholder="e.g., Bicycles"
                                            className="min-w-0 flex-1 rounded-lg border border-border-col bg-white px-3 py-2 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSubcategory(sub.key)}
                                            aria-label={`Remove subcategory ${index + 1}`}
                                            className="rounded-lg border border-red-400 text-red-600 px-3 py-2 text-sm hover:bg-red-50"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addSubcategory}
                                className="mt-3 rounded-lg border border-pine text-pine px-3 py-2 text-sm hover:bg-sage"
                            >
                                + Add Subcategory
                            </button>
                            <p className="mt-1 text-xs text-text-s">Optional. Add each subcategory separately.</p>
                        </div>
                    </div>

                    {formError && <p role="alert" className="mt-3 text-sm text-red-600">{formError}</p>}
                </Modal>
            )}
        </div>
    )
}
