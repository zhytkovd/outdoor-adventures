import type { ReservationStatus } from '@/app/rentals/types'
import { C, StatusBadge } from '@/components/rentals/ui'
import type { GearStatus, RentalStatus } from './types'

const rentalTones: Record<RentalStatus, ReservationStatus> = {
  'Trip Reserved': 'Checked Out',
  Active: 'Approved',
  'Due Soon': 'Pending',
  Overdue: 'Denied',
  Returned: 'Returned',
}

const gearTones: Record<GearStatus, ReservationStatus> = {
  Available: 'Approved',
  Rented: 'Checked Out',
  Maintenance: 'Pending',
  Inactive: 'Returned',
}

export function RentalBadge({ status }: { status: RentalStatus }) {
  return <StatusBadge status={rentalTones[status]} label={status} />
}

export function GearBadge({ status }: { status: GearStatus }) {
  return <StatusBadge status={gearTones[status]} label={status} />
}

export const headingStyle = { fontSize: 26, fontWeight: 700, color: C.tp, letterSpacing: '-0.02em' }
