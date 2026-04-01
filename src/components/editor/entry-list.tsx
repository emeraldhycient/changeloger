"use client"

import { useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChangelogEntryCard,
  type ChangelogEntryCardProps,
} from "@/components/editor/changelog-entry-card"
import {
  useEntries,
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry,
  useReorderEntries,
} from "@/hooks/use-changelog-entries"
import type { ReleaseEntry } from "@/hooks/use-releases"

// ─── Sortable wrapper ──────────────────────────────────────────────────────

function SortableEntryCard({
  entry,
  onUpdate,
  onDelete,
}: {
  entry: ReleaseEntry
  onUpdate: ChangelogEntryCardProps["onUpdate"]
  onDelete: ChangelogEntryCardProps["onDelete"]
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ChangelogEntryCard
        entry={entry}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={listeners}
      />
    </div>
  )
}

// ─── EntryList ─────────────────────────────────────────────────────────────

interface EntryListProps {
  releaseId: string
}

export function EntryList({ releaseId }: EntryListProps) {
  const { data: entries = [], isLoading } = useEntries(releaseId)
  const createEntry = useCreateEntry()
  const updateEntry = useUpdateEntry()
  const deleteEntry = useDeleteEntry()
  const reorderEntries = useReorderEntries()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = entries.findIndex((e) => e.id === active.id)
      const newIndex = entries.findIndex((e) => e.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(entries, oldIndex, newIndex)
      reorderEntries.mutate({
        releaseId,
        orderedIds: reordered.map((e) => e.id),
      })
    },
    [entries, releaseId, reorderEntries],
  )

  const handleAddEntry = useCallback(() => {
    createEntry.mutate({
      releaseId,
      category: "added",
      title: "New entry",
    })
  }, [releaseId, createEntry])

  const handleUpdate = useCallback(
    (entryId: string, updates: Partial<ReleaseEntry>) => {
      updateEntry.mutate({ releaseId, entryId, ...updates })
    },
    [releaseId, updateEntry],
  )

  const handleDelete = useCallback(
    (entryId: string) => {
      deleteEntry.mutate({ releaseId, entryId })
    },
    [releaseId, deleteEntry],
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted/50" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No entries yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first changelog entry to get started.
        </p>
        <Button variant="outline" className="mt-6" onClick={handleAddEntry}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Entry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="max-h-[calc(100vh-16rem)]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={entries.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {entries.map((entry) => (
                <SortableEntryCard
                  key={entry.id}
                  entry={entry}
                  onUpdate={(updates) => handleUpdate(entry.id, updates)}
                  onDelete={() => handleDelete(entry.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleAddEntry}
        disabled={createEntry.isPending}
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Add Entry
      </Button>
    </div>
  )
}
