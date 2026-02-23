'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pet, ActionTemplate, Action } from '@/lib/types'

type PetContextType = {
  // Питомцы
  pets: Pet[]
  currentPet: Pet | null
  setCurrentPet: (pet: Pet | null) => void
  loading: boolean
  
  // Пользователь
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null
  userLoading: boolean
  userName: string
  
  // Шаблоны для текущего питомца
  templates: ActionTemplate[]
  loadTemplates: (petId: string) => Promise<void>
  
  // Действия для текущего питомца
  todayActions: Action[]
  loadTodayActions: (petId: string) => Promise<void>
  
  // Действия
  addAction: (templateId: string) => Promise<void>
  
  // функции удаления
  deleteAction: (actionId: string) => Promise<void>
  deleteTemplate: (templateId: string) => Promise<void>
  
  // Обновление данных
  refreshPets: () => Promise<void>
  refreshCurrentPetData: () => Promise<void>
  refreshUser: () => Promise<void>
  
  // Проверка на первого питомца
  hasPets: boolean
}

const PetContext = createContext<PetContextType | undefined>(undefined)

export function PetProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  
  const [pets, setPets] = useState<Pet[]>([])
  const [currentPet, setCurrentPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  
  const [templates, setTemplates] = useState<ActionTemplate[]>([])
  const [todayActions, setTodayActions] = useState<Action[]>([])
  
  const hasPets = pets.length > 0
  const userName = user?.user_metadata?.name || user?.email || 'Пользователь'

  // Загрузка пользователя
  const refreshUser = useCallback(async () => {
    setUserLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setUserLoading(false)
    }
  }, [supabase])

  // Загрузка списка питомцев
  const refreshPets = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        return
      }
      
      if (!userData.user) {
        console.log('No user found')
        return
      }

      const { data: ownedPets, error: ownedError } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userData.user.id)

      if (ownedError) throw ownedError

      const { data: memberPets, error: memberError } = await supabase
        .from('family_members')
        .select('pet_id, pets(*)')
        .eq('user_id', userData.user.id)
        .eq('status', 'active')

      if (memberError) throw memberError

      const memberPetsList = memberPets
        .map(m => m.pets)
        .filter((pet): pet is NonNullable<typeof pet> => pet !== null)

      const allPets = [...(ownedPets || []), ...memberPetsList]
      const uniquePets = allPets.filter((pet, index, self) => 
        index === self.findIndex(p => p.id === pet.id)
      )

      setPets(uniquePets)
    } catch (error) {
      console.error('Error loading pets:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Загрузка шаблонов для питомца
  const loadTemplates = useCallback(async (petId: string) => {
    try {
      const { data, error } = await supabase
        .from('action_templates')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }, [supabase])

  // Загрузка действий за сегодня
  const loadTodayActions = useCallback(async (petId: string) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: actions, error } = await supabase
        .from('actions')
        .select(`
          *,
          action_templates:template_id (name, icon)
        `)
        .eq('pet_id', petId)
        .gte('timestamp', today.toISOString())
        .order('timestamp', { ascending: false })

      if (error) throw error

      if (!actions || actions.length === 0) {
        setTodayActions([])
        return
      }

      const userIds = [...new Set(actions.map(a => a.user_id))]
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, name')
        .in('id', userIds)

      const userMap = new Map(profiles?.map(p => [p.id, p.name]) || [])

      const actionsWithDetails = actions.map(action => ({
        ...action,
        user_name: userMap.get(action.user_id) || 'Неизвестно',
        template_name: action.action_templates?.name,
        template_icon: action.action_templates?.icon
      }))

      setTodayActions(actionsWithDetails)
    } catch (error) {
      console.error('Error loading today actions:', error)
    }
  }, [supabase])

  // Добавить новое действие
  const addAction = useCallback(async (templateId: string) => {
    if (!currentPet) return

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { error } = await supabase
        .from('actions')
        .insert({
          pet_id: currentPet.id,
          user_id: userData.user.id,
          template_id: templateId,
          timestamp: new Date().toISOString(),
        })

      if (error) throw error

      await loadTodayActions(currentPet.id)
    } catch (error) {
      console.error('Error adding action:', error)
    }
  }, [currentPet, supabase, loadTodayActions])

  // Удалить действие
  const deleteAction = useCallback(async (actionId: string) => {
    if (!currentPet) return

    try {
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', actionId)

      if (error) throw error

      // Обновляем ленту
      await loadTodayActions(currentPet.id)
    } catch (error) {
      console.error('Error deleting action:', error)
    }
  }, [currentPet, supabase, loadTodayActions])

  // Удалить шаблон
  const deleteTemplate = useCallback(async (templateId: string) => {
    if (!currentPet) return

    try {
      const { error } = await supabase
        .from('action_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error

      // Обновляем шаблоны и ленту
      await loadTemplates(currentPet.id)
      await loadTodayActions(currentPet.id)
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }, [currentPet, supabase, loadTemplates, loadTodayActions])

  // Обновить данные текущего питомца
  const refreshCurrentPetData = useCallback(async () => {
    if (currentPet) {
      await loadTemplates(currentPet.id)
      await loadTodayActions(currentPet.id)
    }
  }, [currentPet, loadTemplates, loadTodayActions])

  // Загружаем пользователя при монтировании
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Загружаем питомцев при монтировании
  useEffect(() => {
    refreshPets()
  }, [refreshPets])

  // Когда питомцы загрузились, устанавливаем первого как текущего
  useEffect(() => {
    if (pets.length > 0 && !currentPet) {
      setCurrentPet(pets[0])
    } else if (pets.length === 0) {
      setCurrentPet(null)
      setTemplates([])
      setTodayActions([])
    }
  }, [pets, currentPet])

  // Когда сменился текущий питомец, загружаем его данные
  useEffect(() => {
    if (currentPet) {
      loadTemplates(currentPet.id)
      loadTodayActions(currentPet.id)
    }
  }, [currentPet, loadTemplates, loadTodayActions])

  return (
    <PetContext.Provider value={{
      pets,
      currentPet,
      setCurrentPet,
      loading,
      user,
      userLoading,
      userName,
      templates,
      loadTemplates,
      todayActions,
      loadTodayActions,
      addAction,
      deleteAction,
      deleteTemplate,
      refreshPets,
      refreshCurrentPetData,
      refreshUser,
      hasPets,
    }}>
      {children}
    </PetContext.Provider>
  )
}

export function usePets() {
  const context = useContext(PetContext)
  if (context === undefined) {
    throw new Error('usePets must be used within a PetProvider')
  }
  return context
}