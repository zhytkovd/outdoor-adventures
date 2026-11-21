'use client'

import { useState, useEffect } from 'react'
import { CategoriesPage } from './categories/CategoriesPage'
import { DashboardPage } from './dashboard/DashboardPage'
import { AddGearPage } from './gear/AddGearPage'
import { EditGearPage } from './gear/EditGearPage'
import { GearDetailsPage } from './gear/GearDetailsPage'
import { GearPage } from './gear/GearPage'
import { initialCategories, initialRentals, initialUsers } from './mockData'
import { ReportsPage } from './reports/ReportsPage'
import type { Gear, GearStatus } from './types'
import type { Category, InventoryPage } from './types'

export function InventoryPanel({ page, selectedId, navigate }: {
  page: InventoryPage | null
  selectedId: number | null
  navigate: (page: InventoryPage, id?: number) => void
}) {


  
const [gear, setGear] = useState<Gear[]>([])
const [loading, setLoading] = useState(true)
const [categories, setCategories] = useState<Category[]>(initialCategories)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  async function loadGear() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gear')

      if (!response.ok) {
        throw new Error(`Failed to fetch gear: ${response.status}`)
      }

      const data: ApiGear[] = await response.json()
      setGear(data.map(mapApiGear))

    } catch (err) {
      console.error('Failed to fetch gear:', err)
      setError('Failed to load inventory. Please try again.')

    } finally {
      setLoading(false)
    }
  }

  loadGear()
}, [])


 
type ApiGear = {
  gear_id: number
  name: string
  category_name: string
  description?: string | null
  purchase_date?: string | null
  subcategory: string | null
  size: string | null
  condition_status: 'good' | 'minor_wear' | 'damaged'
  status: GearStatus
  faculty_only: number | boolean

  total_quantity: number
  unit_cost: string | number
  expiration_date: string | null
  maintenance_count: number
  needs_cleaning: number | boolean
  delivery_allowed: number | boolean
  is_high_risk: number | boolean
}


  function mapApiGear(item: ApiGear): Gear {
    return {
      id: item.gear_id,
      name: item.name,
      category: item.category_name,
      subcategory: item.subcategory ?? '—',
      size: item.size ?? '—',
      purchaseDate: item.purchase_date ?? '',
      condition: item.condition_status,
      status: item.status,
      description: item.description ?? '',
      access: item.faculty_only ? 'Faculty only' : 'Everyone',
      totalQuantity: item.total_quantity,
      unitCost: Number(item.unit_cost),
      expirationDate: item.expiration_date ?? '',
      maintenanceCount: item.maintenance_count,
      needsCleaning: Boolean(item.needs_cleaning),
      deliveryAllowed: Boolean(item.delivery_allowed),
      isHighRisk: Boolean(item.is_high_risk),
    }
  }


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

const isGearPage =
  page === 'gear' ||
  page === 'gear-details' ||
  page === 'edit-gear'

if (isGearPage && loading) {
  return (
    <div className="p-6 text-center text-text-s">
      Loading inventory...
    </div>
  )
}

if (isGearPage && error) {
  return (
    <div className="p-6 text-center text-red-600">
      {error}
    </div>
  )
}

return (
  <div className="min-w-0">
    {renderPage()}
  </div>
)

}
