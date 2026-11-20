import type { Category, Gear, Rental, User } from './types'

export const initialRentals: Rental[] = [
  { id: 1, student: 'Maya K.', gear: 'Tent #14', startDate: '2026-09-13', dueDate: 'Sept 20', status: 'Active', durationDays: 7 },
  { id: 2, student: 'Jordan T.', gear: 'Backpack #08', startDate: '2026-09-11', dueDate: 'Sept 18', status: 'Due Soon', durationDays: 7 },
  { id: 3, student: 'Alex R.', gear: 'Sleeping Bag', startDate: '2026-09-10', dueDate: 'Sept 17', status: 'Overdue', durationDays: 7 },
  { id: 4, student: 'Taylor S.', gear: 'Kayak #03', startDate: '2026-09-08', dueDate: 'Sept 15', status: 'Overdue', durationDays: 7 },
  { id: 5, student: 'Jamie L.', gear: 'Tent #15', startDate: '2026-09-05', dueDate: 'Sept 12', status: 'Returned', durationDays: 7 },
  { id: 6, student: 'Sam W.', gear: 'Stove #07', startDate: '2026-09-01', dueDate: 'Sept 4', status: 'Returned', durationDays: 3 },
  { id: 7, student: 'Chris M.', gear: 'Tent #14', startDate: '2026-09-24', dueDate: 'Sept 29', status: 'Trip Reserved', durationDays: 5 },
  { id: 8, student: 'Jordan T.', gear: 'Tent #14', startDate: '2026-08-20', dueDate: 'Aug 27', status: 'Returned', durationDays: 7 },
  { id: 9, student: 'Maya K.', gear: 'Backpack #08', startDate: '2026-08-12', dueDate: 'Aug 17', status: 'Returned', durationDays: 5 },
]

export const initialUsers: User[] = [
  { id: 1, name: 'Maya K.', email: 'maya.k@school.edu', role: 'Student', status: 'Active', rentals: 4, joined: 'Aug 2026' },
  { id: 2, name: 'Jordan T.', email: 'jordan.t@school.edu', role: 'Student', status: 'Active', rentals: 7, joined: 'Aug 2026' },
  { id: 3, name: 'Alex R.', email: 'alex.r@school.edu', role: 'Student', status: 'Active', rentals: 2, joined: 'Sep 2026' },
  { id: 4, name: 'Taylor S.', email: 'taylor.s@school.edu', role: 'Student', status: 'Active', rentals: 5, joined: 'Aug 2026' },
  { id: 5, name: 'Jamie L.', email: 'jamie.l@school.edu', role: 'Student', status: 'Inactive', rentals: 1, joined: 'Jul 2026' },
  { id: 6, name: 'Sam W.', email: 'sam.w@school.edu', role: 'Student', status: 'Active', rentals: 3, joined: 'Aug 2026' },
  { id: 7, name: 'Chris M.', email: 'chris.m@school.edu', role: 'Staff', status: 'Active', rentals: 0, joined: 'Jan 2025' },
  { id: 8, name: 'Dana P.', email: 'dana.p@school.edu', role: 'Admin', status: 'Active', rentals: 0, joined: 'Jan 2024' },
]

export const initialCategories: Category[] = [
  { id: 1, name: 'Camping', description: 'Tents, sleeping bags, tarps, and shelter equipment.', itemCount: 12, icon: '⛺', subcategories: ['Tents', 'Sleep Systems', 'Shelter'] },
  { id: 2, name: 'Hiking', description: 'Backpacks, trekking poles, and trail essentials.', itemCount: 8, icon: '🥾', subcategories: ['Backpacks', 'Trekking Poles'] },
  { id: 3, name: 'Water Sports', description: 'Kayaks, canoes, paddles, and life vests.', itemCount: 5, icon: '🚣', subcategories: ['Kayaks', 'Safety Gear'] },
  { id: 4, name: 'Cooking', description: 'Camp stoves, cookware, and food storage.', itemCount: 9, icon: '🍳', subcategories: ['Stoves', 'Cookware'] },
  { id: 5, name: 'Climbing', description: 'Harnesses, ropes, carabiners, and helmets.', itemCount: 6, icon: '🧗', subcategories: ['Protection', 'Ropes'] },
  { id: 6, name: 'Navigation', description: 'Compasses, maps, and GPS devices.', itemCount: 4, icon: '🧭', subcategories: ['Maps', 'GPS'] },
]

export const initialGear: Gear[] = [
  { id: 1, name: 'Tent #14', category: 'Camping', subcategory: 'Tents', size: '2-Person', purchaseDate: 'Jan 5, 2024', condition: 'Good', status: 'Rented', description: 'Compact 2-person tent, great for weekend trips.', access: 'Everyone' },
  { id: 2, name: 'Tent #15', category: 'Camping', subcategory: 'Tents', size: '4-Person', purchaseDate: 'Jan 15, 2024', condition: 'Good', status: 'Available', description: 'Spacious 4-person tent, great for group trips.', access: 'Everyone' },
  { id: 3, name: 'Backpack #08', category: 'Hiking', subcategory: 'Backpacks', size: 'Medium', purchaseDate: 'Feb 3, 2024', condition: 'Good', status: 'Rented', description: '65L hiking backpack with frame support.', access: 'Everyone' },
  { id: 4, name: 'Kayak #03', category: 'Water Sports', subcategory: 'Kayaks', size: '—', purchaseDate: 'Mar 10, 2023', condition: 'Good', status: 'Available', description: 'Single-person sea kayak with paddle.', access: 'Staff only' },
  { id: 5, name: 'Stove #07', category: 'Cooking', subcategory: 'Stoves', size: '—', purchaseDate: 'Jan 5, 2024', condition: 'Needs Repair', status: 'Inactive', description: 'Portable camping stove. Currently not working and needs repair.', access: 'Everyone' },
  { id: 6, name: 'Sleeping Bag', category: 'Camping', subcategory: 'Sleep Systems', size: 'Standard', purchaseDate: 'Dec 1, 2023', condition: 'Fair', status: 'Rented', description: 'Rated to 20°F, suitable for three-season use.', access: 'Everyone' },
]
