
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
import type { Gear, GearStatus, Category, InventoryPage } from './types'


// Backend gear structure
type ApiGear = {
    gear_id: number
    name: string
    category_id: number
    category_name: string
    subcategory_id: number | null
    subcategory: string | null
    description?: string | null
    size: string | null
    purchase_date?: string | null
    expiration_date: string | null
    condition_status: 'good' | 'minor_wear' | 'damaged'
    status: GearStatus
    total_quantity: number
    maintenance_count: number
    unit_cost: string | number
    faculty_only: number | boolean
    needs_cleaning: number | boolean
    delivery_allowed: number | boolean
    is_high_risk: number | boolean
}


// Convert backend gear to frontend gear
function mapApiGear(item: ApiGear): Gear {
    return {
        id: item.gear_id,
        name: item.name,
        category: item.category_name,
        categoryId: item.category_id,
        subcategory: item.subcategory ?? '',
        subcategoryId: item.subcategory_id,
        size: item.size ?? '',
        purchaseDate: item.purchase_date?.slice(0, 10) ?? '',
        expirationDate: item.expiration_date?.slice(0, 10) ?? '',
        condition: item.condition_status,
        status: item.status,
        description: item.description ?? '',
        access: item.faculty_only ? 'Faculty only' : 'Everyone',
        totalQuantity: item.total_quantity,
        unitCost: Number(item.unit_cost),
        maintenanceCount: item.maintenance_count,
        needsCleaning: Boolean(item.needs_cleaning),
        deliveryAllowed: Boolean(item.delivery_allowed),
        isHighRisk: Boolean(item.is_high_risk),
    }
}


// Convert frontend gear to backend request body
function mapGearToApi(updated: Gear, original: Gear){
    return {
        name: updated.name.trim(),
        category_id: original.categoryId,
        subcategory_id: original.subcategoryId,
        total_quantity: updated.totalQuantity,
        maintenance_count: updated.maintenanceCount,
        unit_cost: updated.unitCost,
        condition_status: updated.condition,
        purchase_date: updated.purchaseDate || null,
        expiration_date: updated.expirationDate || null,
        description: updated.description || null,
        size: updated.size || null,
        needs_cleaning: updated.needsCleaning,
        delivery_allowed: updated.deliveryAllowed,
        faculty_only: updated.access === 'Faculty only',
        is_high_risk: updated.isHighRisk,
        is_active: updated.status !== 'Inactive'
    }
}


// Retrieve gear from backend
async function fetchGear(): Promise<Gear[]>{
    const response = await fetch('/api/gear', {
        cache: 'no-store'
    })

    if(!response.ok){
        throw new Error(`Failed to fetch gear: ${response.status}`)
    }

    const data: ApiGear[] = await response.json()

    return data.map(mapApiGear)
}


export function InventoryPanel({ page, selectedId, navigate }: {
    page: InventoryPage | null
    selectedId: number | null
    navigate: (page: InventoryPage, id?: number) => void
}) {

    const [gear, setGear] = useState<Gear[]>([])
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<Category[]>(initialCategories)
    const [error, setError] = useState<string | null>(null)


    // Load gear when component mounts
    useEffect(() => {
        async function loadGear(){
            setLoading(true)
            setError(null)

            try{
                const data = await fetchGear()
                setGear(data)
            }
            catch(error){
                console.error("Failed to fetch gear:", error)
                setError("Failed to load inventory. Please try again.")
            }
            finally{
                setLoading(false)
            }
        }

        loadGear()
    }, [])


    const selectedGear = gear.find(g => g.id === selectedId)


    // ADD — currently frontend only
    const addGear = (g: Omit<Gear, 'id'>) => {
        setGear(prev => [...prev, { ...g, id: Date.now() }])
    }


    // EDIT — connected to backend
    const saveGear = async (updated: Gear): Promise<void> => {
        const original = gear.find(g => g.id === updated.id)

        if(!original){
            throw new Error("Gear not found")
        }

        if(original.categoryId === undefined || original.subcategoryId === undefined){
            throw new Error("Missing category information")
        }

        // Category changes are not supported yet
        if(updated.category !== original.category || updated.subcategory !== original.subcategory){
            throw new Error("Changing categories is not supported yet")
        }

        // Convert frontend object to backend format
        const body = mapGearToApi(updated, original)

        // Send PUT request
        const response = await fetch(`/api/gear/${updated.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        if(!response.ok){
            const data = await response.json().catch(() => null)
            throw new Error(data?.error || "Failed to update gear")
        }

        // Refresh inventory after successful update
        try{
            const data = await fetchGear()
            setGear(data)
        }
        catch(error){
            console.error("Failed to refresh inventory:", error)
            throw new Error("Gear was saved, but inventory could not be refreshed. Reload the page.")
        }
    }


    // DELETE — currently frontend only
    const deleteGear = (id: number) => {
        setGear(prev => prev.filter(g => g.id !== id))
    }


    // Render selected inventory page
    const renderPage = () => {
        switch(page){
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
                    ? <EditGearPage
                        gearItem={selectedGear}
                        navigate={navigate}
                        onSave={saveGear}
                        onDelete={deleteGear}
                      />
                    : <GearPage gear={gear} navigate={navigate} />

            case 'categories':
                return <CategoriesPage
                    categories={categories}
                    setCategories={setCategories}
                    gear={gear}
                />

            case 'reports':
                return <ReportsPage
                    rentals={initialRentals}
                    gear={gear}
                    users={initialUsers}
                />

            case null:
                return null
        }
    }


    if(page === null) return null

    const isGearPage =
        page === 'gear' ||
        page === 'gear-details' ||
        page === 'edit-gear'


    if(isGearPage && loading){
        return (
            <div className="p-6 text-center text-text-s">
                Loading inventory...
            </div>
        )
    }


    if(isGearPage && error){
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
