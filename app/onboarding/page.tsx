'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [petName, setPetName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('pets')
        .insert({
          name: petName,
          user_id: userData.user.id,
        })

      if (error) throw error

      router.push('/')
    } catch (error) {
      console.error('Error creating pet:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md watercolor-card p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-3xl font-heading mb-2">Добавьте первого питомца</h1>
          <p className="text-muted-foreground">
            Как зовут вашего пушистого глупыша?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            placeholder="например, Барсик"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
            className="bg-white/50 border-white/60 text-center text-lg py-6"
            autoFocus
          />

          <Button
            type="submit"
            disabled={loading || !petName.trim()}
            className="w-full bg-primary hover:bg-primary/80 text-foreground font-heading py-6 text-lg rounded-full transition-all"
          >
            {loading ? 'Создаём...' : 'Познакомиться'}
          </Button>
        </form>
      </div>
    </div>
  )
}