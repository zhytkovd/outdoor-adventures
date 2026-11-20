'use client'

import { useState } from 'react'
import { CategoriesPage } from './categories/CategoriesPage'
import { DashboardPage } from './dashboard/DashboardPage'
import { AddGearPage } from './gear/AddGearPage'
import { EditGearPage } from './gear/EditGearPage'
import { GearDetailsPage } from './gear/GearDetailsPage'
import { GearPage } from './gear/GearPage'
import { initialCategories, initialGear, initialRentals, initialUsers } from './mockData'
import { ReportsPage } from './reports/ReportsPage'
import type { Category, Gear, InventoryPage } from './types'

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
