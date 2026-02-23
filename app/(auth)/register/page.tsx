'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/supabase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signUp(email, password, name)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Декоративные облака */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md watercolor-card p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-foreground mb-2">Bakitty</h1>
          <p className="text-muted-foreground">
            Присоединяйтесь к семье
          </p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-xl font-heading mb-2">Почти готово!</h2>
            <p className="text-muted-foreground">
              Проверьте почту для подтверждения регистрации
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground/80">
                Ваше имя
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Анна"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/50 border-white/60 focus:border-primary"
              />
            </div>

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
                minLength={6}
                className="bg-white/50 border-white/60 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Минимум 6 символов
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/20 text-destructive-foreground rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-heading py-6 text-lg rounded-full transition-all transform hover:scale-105"
            >
              {loading ? 'Создаём аккаунт...' : 'Создать аккаунт'}
            </Button>
          </form>
        )}

        {!success && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link 
                href="/login" 
                className="text-primary-foreground underline hover:text-primary transition-colors"
              >
                Войти
              </Link>
            </p>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground/60 mt-8">
          с любовью к вашим пушистым глупышам 🐱
        </p>
      </Card>
    </div>
  )
}