'use client'

import { useState } from 'react'
import { ActionTemplate } from '@/lib/types'
import { usePets } from '@/lib/context/PetContext'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ActionCardProps {
  template: ActionTemplate
}

export function ActionCard({ template }: ActionCardProps) {
  const { addAction, deleteTemplate } = usePets()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteTemplate(template.id)
    setShowDeleteDialog(false)
  }

  const description = `Действие "${template.name}" будет удалено. Все отметки с этим шаблоном сохранятся, но без иконки.`

  return (
    <>
      <div className="relative group">
        <button
          onClick={() => addAction(template.id)}
          className="w-full watercolor-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all active:scale-95 cursor-pointer"
        >
          <span className="text-3xl group-hover:animate-bounce">{template.icon}</span>
          <span className="text-sm font-medium text-center">{template.name}</span>
        </button>
        
        {/* Кнопка удаления (появляется при наведении) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowDeleteDialog(true)
          }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="watercolor-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить шаблон?</AlertDialogTitle>
            <AlertDialogDescription>
                {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-full bg-destructive hover:bg-destructive/80"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}