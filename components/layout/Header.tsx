'use client'

import { usePets } from '@/lib/context/PetContext'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Settings, LogOut, User, Users } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  // Вызываем хук на верхнем уровне
  const { userName, hasPets, currentPet } = usePets()

  // Получаем первые буквы имени для аватара
  const getInitials = () => {
    if (!userName) return '?'
    
    const names = userName.split(' ')
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase()
    }
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full watercolor-card backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Левая часть - аватар */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full bg-accent/80 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-soft"
            onClick={() => router.push('/settings/profile')}
          >
            <span className="text-foreground font-heading font-medium">
              {getInitials()}
            </span>
          </div>
        </div>

        {/* Центр - название */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <h1 className="text-xl font-heading text-foreground/90 tracking-wide">
            Bakitty
          </h1>
          <div className="h-0.5 w-12 bg-gradient-to-r from-primary/40 via-secondary/40 to-accent/40 mx-auto rounded-full" />
        </div>

        {/* Правая часть - меню */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-white/30 transition-all"
              >
                <span className="sr-only">Открыть меню</span>
                <div className="w-5 h-5 flex flex-col gap-1 justify-center items-center">
                  <span className="w-5 h-0.5 bg-foreground/60 rounded-full" />
                  <span className="w-5 h-0.5 bg-foreground/60 rounded-full" />
                  <span className="w-5 h-0.5 bg-foreground/60 rounded-full" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-56 watercolor-card border-white/30 mt-2"
            >
              <DropdownMenuLabel className="font-heading">
                {userName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/30" />
              
              <DropdownMenuItem 
                onClick={() => router.push('/settings/profile')}
                className="cursor-pointer hover:bg-white/30 transition-colors"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Профиль</span>
              </DropdownMenuItem>
              
              {hasPets && currentPet && (
                <DropdownMenuItem 
                  onClick={() => router.push(`/settings/pet/${currentPet.id}`)}
                  className="cursor-pointer hover:bg-white/30 transition-colors"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Управление питомцем</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                onClick={() => router.push('/family')}
                className="cursor-pointer hover:bg-white/30 transition-colors"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Семья</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-white/30" />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer text-destructive-foreground hover:bg-destructive/20 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}