'use client'

import { usePets } from '@/lib/context/PetContext'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

// Популярные эмодзи для быстрого выбора
const POPULAR_EMOJIS = ['🍗', '💊', '🚽', '🛁', '🎾', '😴', '💧', '🍖', '🥫', '🦴', '🐟', '🥛']

export function ActionGrid() {
  const { templates, currentPet, addAction, refreshCurrentPetData } = usePets()
  const [open, setOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🍗')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreateTemplate = async () => {
    if (!currentPet || !newTemplateName.trim()) return

    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { error } = await supabase
        .from('action_templates')
        .insert({
          pet_id: currentPet.id,
          name: newTemplateName.trim(),
          icon: selectedEmoji,
          created_by: userData.user.id,
        })

      if (error) throw error

      await refreshCurrentPetData()
      setNewTemplateName('')
      setSelectedEmoji('🍗')
      setOpen(false)
    } catch (error) {
      console.error('Error creating template:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!currentPet) return null

  return (
    <div className="space-y-4">
      {/* Сетка действий */}
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => addAction(template.id)}
            className="watercolor-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all active:scale-95 cursor-pointer group"
          >
            <span className="text-3xl group-hover:animate-bounce">{template.icon}</span>
            <span className="text-sm font-medium text-center">{template.name}</span>
          </button>
        ))}

        {/* Кнопка добавления нового шаблона */}
        <button
          onClick={() => setOpen(true)}
          className="watercolor-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all active:scale-95 cursor-pointer border-2 border-dashed border-primary/30 bg-white/50"
        >
          <span className="text-3xl text-primary/50">➕</span>
          <span className="text-sm font-medium text-primary/70">Новое</span>
        </button>
      </div>

      {/* Модалка создания шаблона */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="watercolor-card border-white/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Новое действие
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Добавьте свой шаблон действия для {currentPet.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Выбор эмодзи */}
            <div className="space-y-2">
              <Label htmlFor="emoji">Иконка</Label>
              <div className="grid grid-cols-6 gap-2">
                {POPULAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-primary/30 scale-110'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Название действия */}
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                placeholder="например, Сухой корм"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="bg-white/50 border-white/60"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-full"
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={loading || !newTemplateName.trim()}
              className="rounded-full bg-primary hover:bg-primary/80"
            >
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}