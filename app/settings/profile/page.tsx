'use client'

import { usePets } from '@/lib/context/PetContext'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Mail, User as UserIcon, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, userName, refreshUser } = usePets()
  
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Заполняем форму при загрузке
  useEffect(() => {
    if (userName) {
      setName(userName)
    }
  }, [userName])

  const handleUpdateName = async () => {
    if (!name.trim() || !user) return

    setLoading(true)
    setMessage(null)

    try {
      // Обновляем в auth.users (user_metadata)
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: name.trim() }
      })

      if (authError) throw authError

      // Обновляем в user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          name: name.trim(),
          email: user.email,
        })

      if (profileError) throw profileError

      await refreshUser()
      setMessage({ text: 'Имя успешно обновлено!', type: 'success' })
    } catch (error) {
      console.error('Error updating name:', error)
      setMessage({ text: 'Ошибка при обновлении имени', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Получаем первые буквы имени для большого аватара
  const getInitials = () => {
    if (!userName) return '?'
    const names = userName.split(' ')
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase()
    }
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase()
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

        {/* Профиль */}
        <Card className="watercolor-card p-6">
          <div className="flex flex-col items-center mb-6">
            {/* Большой аватар */}
            <div className="w-24 h-24 rounded-full bg-accent/80 flex items-center justify-center mb-4 shadow-soft">
              <span className="text-3xl font-heading font-medium">
                {getInitials()}
              </span>
            </div>
            <h1 className="text-2xl font-heading">{userName}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
          </div>

          {/* Форма изменения имени */}
          <div className="space-y-4 pt-4 border-t border-white/30">
            <h2 className="font-heading text-lg">Редактировать профиль</h2>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Имя
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="bg-white/50 border-white/60"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-secondary/30 text-secondary-foreground' 
                  : 'bg-destructive/30 text-destructive-foreground'
              }`}>
                {message.text}
              </div>
            )}

            <Button
              onClick={handleUpdateName}
              disabled={loading || !name.trim() || name === userName}
              className="w-full rounded-full bg-primary hover:bg-primary/80"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>

          {/* Кнопка выхода */}
          <div className="mt-6 pt-4 border-t border-white/30">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full rounded-full border-destructive/30 text-destructive-foreground hover:bg-destructive/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти из аккаунта
            </Button>
          </div>

          {/* Милая подпись */}
          <p className="text-xs text-center text-muted-foreground/60 mt-6">
            Bakitty • забота с любовью 🐱
          </p>
        </Card>
      </main>
    </>
  )
}