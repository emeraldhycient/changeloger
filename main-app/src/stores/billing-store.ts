import { create } from "zustand"

interface BillingState {
  upgradeModalOpen: boolean
  limitMessage: string | null
  openUpgradeModal: (message?: string) => void
  closeUpgradeModal: () => void
}

export const useBillingStore = create<BillingState>((set) => ({
  upgradeModalOpen: false,
  limitMessage: null,
  openUpgradeModal: (message) =>
    set({ upgradeModalOpen: true, limitMessage: message || null }),
  closeUpgradeModal: () =>
    set({ upgradeModalOpen: false, limitMessage: null }),
}))
