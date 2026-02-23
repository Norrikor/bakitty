'use client'

import { usePets } from '@/lib/context/PetContext'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, PawPrint, Package, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Pet, ActionTemplate } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

export default function PetSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { pets, currentPet } = usePets()
  
  const [pet, setPet] = useState<Pet | null>(null)
  const [templates, setTemplates] = useState<ActionTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const petId = params.id as string

  useEffect(() => {
    const loadPetData = async () => {
      setLoading(true)
      
      // Ищем питомца в списке
      const foundPet = pets.find(p => p.id === petId)
      if (foundPet) {
        setPet(foundPet)
      } else {
        // Если нет в списке, загружаем отдельно
        const { data } = await supabase
          .from('pets')
          .select('*')
          .eq('id', petId)
          .single()
        
        setPet(data)
      }

      // Загружаем шаблоны
      const { data: templatesData } = await supabase
        .from('action_templates')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: true })

      setTemplates(templatesData || [])
      setLoading(false)
    }

    loadPetData()
  }, [petId, pets, supabase])

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-bounce">🐱</div>
            <p className="text-muted-foreground">Загружаем данные...</p>
          </div>
        </main>
      </>
    )
  }

  if (!pet) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😿</div>
            <p className="text-muted-foreground">Питомец не найден</p>
            <Button 
              onClick={() => router.push('/')}
              className="mt-4 rounded-full"
            >
              На главную
            </Button>
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

        {/* Информация о питомце */}
        <Card className="watercolor-card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
              <span className="text-2xl font-heading">
                {pet.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-heading">{pet.name}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <PawPrint className="w-4 h-4" />
                {pet.id === currentPet?.id ? 'Текущий питомец' : 'Питомец'}
              </p>
            </div>
          </div>
        </Card>

        {/* Шаблоны действий */}
        <Card className="watercolor-card p-6 mb-6">
          <h2 className="font-heading text-lg mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Шаблоны действий
          </h2>
          
          {templates.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Пока нет шаблонов
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="flex items-center gap-3 p-3 bg-white/30 rounded-lg"
                >
                  <span className="text-2xl">{template.icon}</span>
                  <span className="flex-1 font-medium">{template.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Семья (заглушка) */}
        <Card className="watercolor-card p-6">
          <h2 className="font-heading text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Семья
          </h2>
          
          <p className="text-muted-foreground text-center py-4">
            Скоро здесь появится возможность приглашать членов семьи
          </p>
          
          <Button 
            variant="outline"
            className="w-full rounded-full mt-2"
            disabled
          >
            Пригласить (скоро)
          </Button>
        </Card>
      </main>
    </>
  )
}