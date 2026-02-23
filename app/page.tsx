'use client'

import { usePets } from '@/lib/context/PetContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ActionGrid } from '@/components/pets/ActionGrid'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const {  currentPet, loading, hasPets, userName, todayActions, deleteAction } = usePets()
  const { user, userLoading } = usePets()


    useEffect(() => {
    if (!userLoading && user) {
      // Проверяем, есть ли профиль
      const checkProfile = async () => {
        const { data } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.id)
          .single()
        
        if (!data) {
          router.push('/confirm-email')
        }
      }
      checkProfile()
    }
  }, [user, userLoading, router])

  // Если загрузка закончилась и нет питомцев — редирект на онбординг
  useEffect(() => {
    if (!loading && !hasPets) {
      router.push('/onboarding')
    }
  }, [loading, hasPets, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🐱</div>
          <p className="text-muted-foreground">Загружаем ваших пушистых...</p>
        </div>
      </div>
    )
  }

  if (!hasPets) {
    return null // редирект сработает
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Приветствие */}
        <div className="mb-6">
          <h1 className="text-2xl font-heading">
            Привет, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Сегодня заботимся о {currentPet?.name}
          </p>
        </div>

        {/* Сетка действий */}
        <section className="mb-8">
          <h2 className="text-lg font-heading mb-3">Что делаем?</h2>
          <ActionGrid />
        </section>

        {/* Лента сегодня (временная) */}
        <section>
          <h2 className="text-lg font-heading mb-3">Сегодня</h2>
          {todayActions.length === 0 ? (
            <div className="text-center py-8 watercolor-card rounded-lg">
              <span className="text-4xl mb-2 block">😴</span>
              <p className="text-muted-foreground">Пока тишина...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayActions.map((action) => (
                <div
                  key={action.id}
                  className="watercolor-card p-3 flex items-center gap-3 group relative"
                >
                  <span className="text-2xl">{action.template_icon || '📝'}</span>
                  <div className="flex-1">
                    <p className="font-medium">{action.template_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.user_name} • {new Date(action.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  {/* Кнопка удаления действия */}
                  <button
                    onClick={() => {
                      if (confirm('Удалить это действие?')) {
                        deleteAction(action.id)
                      }
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}