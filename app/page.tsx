'use client'

import { usePets } from '@/lib/context/PetContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const { pets, currentPet, setCurrentPet, loading, hasPets, userName } = usePets()

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
    <div className="p-4">
      <h1 className="text-2xl font-heading">
        Привет, {userName}! 👋
      </h1>
      <p className="text-muted-foreground">
        Сегодня заботимся о {currentPet?.name || 'питомце'}
      </p>
      
      {/* Временный список питомцев */}
      <div className="mt-8 space-y-2">
        {pets.map(pet => (
          <div 
            key={pet.id}
            className={`p-4 rounded-lg watercolor-card cursor-pointer transition-all ${
              currentPet?.id === pet.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setCurrentPet(pet)}
          >
            <p className="font-heading text-lg">{pet.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}