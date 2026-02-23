'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/supabase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/') // редирект на главную
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Декоративный элемент — облачко */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md watercolor-card p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-foreground mb-2">Bakitty</h1>
          <p className="text-muted-foreground">
            Войдите в свой уютный мир заботы о питомцах
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50 border-white/60 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground/80">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50 border-white/60 focus:border-primary"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/20 text-destructive-foreground rounded-lg text-sm">
              {error === 'Invalid login credentials' 
                ? 'Неверный email или пароль' 
                : error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/80 text-foreground font-heading py-6 text-lg rounded-full transition-all transform hover:scale-105"
          >
            {loading ? 'Входим...' : 'Войти'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Ещё нет аккаунта?{' '}
            <Link 
              href="/register" 
              className="text-primary-foreground underline hover:text-primary transition-colors"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>

        {/* Милая подпись */}
        <p className="text-xs text-center text-muted-foreground/60 mt-8">
          с любовью к вашим пушистым глупышам 🐱
        </p>
      </Card>
    </div>
  )
}