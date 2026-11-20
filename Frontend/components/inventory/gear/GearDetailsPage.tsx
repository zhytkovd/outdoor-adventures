import { Btn, Card } from '@/components/rentals/ui'
import { GearBadge, headingStyle } from '../InventoryUi'
import type { Gear, InventoryPage } from '../types'
import { GearIllustration } from '@/components/rentals/illustrations'
import { gearIllustrationType } from './gearNames'

export function GearDetailsPage({
  gearItem, navigate
}: {
  gearItem: Gear
  navigate: (p: InventoryPage, id?: number) => void
}) {
  return (
    <div className="w-full">
      <Btn
        onClick={() => navigate('gear')}
        variant="ghost" size="sm"
      >
        ← Back to Gear
      </Btn>

      <h1 style={headingStyle} className="mb-6">Gear Details</h1>

      <Card className="p-6">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 bg-sage rounded-lg border border-sage flex items-center justify-center shrink-0">
            <GearIllustration type={gearIllustrationType(gearItem.name)} />
          </div>
          <div className="flex-1">
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Name</div>
            <div className="text-xl font-bold text-text-p mb-3">{gearItem.name}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-text-dis uppercase font-medium mb-0.5">Category</div>
                <div className="text-text-p">{gearItem.category}</div>
              </div>
              <div>
                <div className="text-xs text-text-dis uppercase font-medium mb-0.5">Size</div>
                <div className="text-text-p">{gearItem.size}</div>
              </div>
              <div>
                <div className="text-xs text-text-dis uppercase font-medium mb-0.5">Subcategory</div>
                <div className="text-text-p">{gearItem.subcategory}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border-col pt-4 mb-4 text-sm">
          <div>
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Purchase Date</div>
            <div className="text-text-p">{gearItem.purchaseDate}</div>
          </div>
          <div>
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Condition</div>
            <div className="text-text-p">{gearItem.condition}</div>
          </div>
          <div>
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Status</div>
            <GearBadge status={gearItem.status} />
          </div>
          <div>
            <div className="text-xs text-text-dis uppercase font-medium mb-1">Access</div>
            <div className="text-text-p">{gearItem.access}</div>
          </div>
        </div>

        <div className="border-t border-border-col pt-4">
          <div className="text-xs text-text-dis uppercase font-medium mb-1">Description</div>
          <p className="text-sm text-text-s">{gearItem.description}</p>
        </div>
      </Card>

      <Btn
        onClick={() => navigate('edit-gear', gearItem.id)}
        variant="primary"
      >
        Edit Gear
      </Btn>
    </div>
  )
}
