import { create } from "zustand"

interface WorkspaceState {
  currentWorkspaceId: string | null
  setCurrentWorkspaceId: (id: string | null) => void
  initialized: boolean
  setInitialized: (v: boolean) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => {
  // Hydrate from localStorage on creation (client only)
  let persisted: string | null = null
  if (typeof window !== "undefined") {
    persisted = localStorage.getItem("changeloger_workspace_id")
  }

  return {
    currentWorkspaceId: persisted,
    initialized: !!persisted,
    setCurrentWorkspaceId: (id) => {
      if (typeof window !== "undefined") {
        if (id) {
          localStorage.setItem("changeloger_workspace_id", id)
        } else {
          localStorage.removeItem("changeloger_workspace_id")
        }
      }
      set({ currentWorkspaceId: id })
    },
    setInitialized: (v) => set({ initialized: v }),
  }
})
