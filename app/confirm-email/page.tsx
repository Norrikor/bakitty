'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ConfirmEmailPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md watercolor-card p-8 text-center">
        <div className="text-6xl mb-4">📧</div>
        <h1 className="text-2xl font-heading mb-2">Проверьте почту</h1>
        <p className="text-muted-foreground mb-6">
          Мы отправили письмо с подтверждением. После подтверждения вы сможете добавить питомца.
        </p>
        
        <Button
          onClick={() => router.push('/login')}
          className="rounded-full bg-primary hover:bg-primary/80"
        >
          Вернуться на вход
        </Button>
        
        <p className="text-xs text-muted-foreground/60 mt-6">
          Письмо может прийти в течение нескольких минут
        </p>
      </div>
    </div>
  )
}