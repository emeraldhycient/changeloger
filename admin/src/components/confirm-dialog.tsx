import { useState, useEffect } from "react"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  typeToConfirm?: string
  destructive?: boolean
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  typeToConfirm,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("")

  const canConfirm = typeToConfirm ? typed === typeToConfirm : true

  useEffect(() => {
    if (!open) setTyped("")
  }, [open])

  // Escape to close, Enter to confirm
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
      if (e.key === "Enter" && canConfirm && !loading) {
        if (typeToConfirm && typed !== typeToConfirm) return
        e.preventDefault()
        onConfirm()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose, onConfirm, canConfirm, loading, typeToConfirm, typed])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        {typeToConfirm && (
          <div className="mt-4">
            <p className="mb-1.5 text-sm text-muted-foreground">
              Type <strong className="text-foreground">{typeToConfirm}</strong> to confirm:
            </p>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
              placeholder={typeToConfirm}
              autoFocus
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm || loading}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              destructive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
