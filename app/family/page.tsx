'use client'

import { usePets } from '@/lib/context/PetContext'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, UserPlus, Mail, Crown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type FamilyMemberWithDetails = {
  id: string
  user_id: string | null
  role: 'owner' | 'member'
  status: 'active' | 'pending'
  invited_email: string | null
  created_at: string
  user_name?: string
  user_email?: string
}

export default function FamilyPage() {
  const router = useRouter()
  const supabase = createClient()
  const { currentPet } = usePets()
  
  const [members, setMembers] = useState<FamilyMemberWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Загружаем членов семьи
  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (!currentPet) return

      setLoading(true)
      try {
        // Получаем всех членов семьи для текущего питомца
        const { data: familyMembers, error } = await supabase
          .from('family_members')
          .select('*')
          .eq('pet_id', currentPet.id)
          .order('created_at', { ascending: true })

        if (error) throw error

        // Получаем информацию о пользователях
        const userIds = familyMembers
          .map(m => m.user_id)
          .filter((id): id is string => id !== null)

        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, name, email')
          .in('id', userIds)

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

        // Собираем данные
        const membersWithDetails = familyMembers.map(member => ({
          ...member,
          user_name: member.user_id ? profileMap.get(member.user_id)?.name : undefined,
          user_email: member.user_id ? profileMap.get(member.user_id)?.email : member.invited_email,
        }))

        setMembers(membersWithDetails)
      } catch (error) {
        console.error('Error loading family members:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFamilyMembers()
  }, [currentPet, supabase])

  const handleInvite = async () => {
    if (!currentPet || !inviteEmail.trim()) return

    setInviteLoading(true)
    setInviteMessage(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      // Проверяем, не приглашён ли уже этот email
      const existing = members.find(m => m.invited_email === inviteEmail)
      if (existing) {
        setInviteMessage({ text: 'Этот email уже приглашён', type: 'error' })
        return
      }

      // Создаём запись в family_members
      const { error } = await supabase
        .from('family_members')
        .insert({
          pet_id: currentPet.id,
          invited_by: userData.user.id,
          status: 'pending',
          invited_email: inviteEmail,
          role: 'member',
        })

      if (error) throw error

      setInviteMessage({ text: 'Приглашение отправлено!', type: 'success' })
      setInviteEmail('')
      
      // Перезагружаем список
      setTimeout(() => {
        setInviteDialogOpen(false)
        setInviteMessage(null)
        // Обновить список членов семьи
        window.location.reload() // временное решение
      }, 1500)
    } catch (error) {
      console.error('Error inviting member:', error)
      setInviteMessage({ text: 'Ошибка при отправке приглашения', type: 'error' })
    } finally {
      setInviteLoading(false)
    }
  }

  if (!currentPet) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🐱</div>
            <p className="text-muted-foreground">Выберите питомца</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Кнопка назад */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-heading">Семья {currentPet.name}</h1>
          <p className="text-muted-foreground">
            Управляйте доступом к питомцу
          </p>
        </div>

        {/* Список членов семьи */}
        <Card className="watercolor-card p-6 mb-6">
          <h2 className="font-heading text-lg mb-4">Участники</h2>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Пока нет участников
            </p>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-white/30 rounded-lg"
                >
                  {/* Аватар */}
                  <div className="w-10 h-10 rounded-full bg-accent/80 flex items-center justify-center flex-shrink-0">
                    <span className="font-heading">
                      {member.user_name 
                        ? member.user_name.charAt(0).toUpperCase()
                        : '?'}
                    </span>
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {member.user_name || 'Ожидает'}
                      </p>
                      {member.role === 'owner' && (
                        <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      )}
                      {member.status === 'pending' && (
                        <span className="text-xs bg-yellow-200/50 text-yellow-700 px-2 py-0.5 rounded-full flex-shrink-0">
                          ожидает
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.user_email || member.invited_email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Кнопка приглашения */}
        <Button
          onClick={() => setInviteDialogOpen(true)}
          className="w-full rounded-full bg-primary hover:bg-primary/80 py-6 text-lg"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Пригласить по email
        </Button>

        {/* Диалог приглашения */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="watercolor-card border-white/30 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                Пригласить в семью
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Отправьте приглашение по email. После подтверждения человек сможет отмечать действия для {currentPet.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-white/50 border-white/60"
                />
              </div>

              {inviteMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  inviteMessage.type === 'success' 
                    ? 'bg-secondary/30 text-secondary-foreground' 
                    : 'bg-destructive/30 text-destructive-foreground'
                }`}>
                  {inviteMessage.text}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setInviteDialogOpen(false)
                  setInviteMessage(null)
                  setInviteEmail('')
                }}
                className="rounded-full"
              >
                Отмена
              </Button>
              <Button
                onClick={handleInvite}
                disabled={inviteLoading || !inviteEmail.trim()}
                className="rounded-full bg-primary hover:bg-primary/80"
              >
                {inviteLoading ? 'Отправка...' : 'Отправить приглашение'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Информация */}
        <p className="text-xs text-center text-muted-foreground/60 mt-6">
          Приглашённые пользователи смогут отмечать действия, но не смогут управлять питомцем
        </p>
      </main>
    </>
  )
}