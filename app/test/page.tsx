'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'

export default function TestPage() {
  const [status, setStatus] = useState('Проверяем подключение...')
  const [tables, setTables] = useState<string[]>([])

  useEffect(() => {
    async function checkConnection() {
      try {
        const supabase = createClient()
        
        // Проверяем, какие таблицы существуют
        const tablesToCheck = ['profiles', 'pets', 'family_members', 'action_templates', 'actions']
        const existingTables: string[] = []
        
        for (const tableName of tablesToCheck) {
          const { error } = await supabase.from(tableName).select('*').limit(1)
          if (!error || (error && error.message.includes('permission denied'))) {
            // Таблица существует (или есть доступ)
            existingTables.push(tableName)
          } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
            // Таблицы нет — пропускаем
            console.log(`Таблица ${tableName} не найдена`)
          }
        }
        
        if (existingTables.length > 0) {
          setStatus(`✅ Подключение работает! Найдены таблицы: ${existingTables.join(', ')}`)
          setTables(existingTables)
        } else {
          setStatus('⚠️ Подключение работает, но таблицы не найдены. Нужно создать таблицы через SQL Editor.')
        }
        
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setStatus(`❌ Ошибка: ${err.message}`)
        console.error('Supabase error:', err)
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading mb-4">Тест Supabase</h1>
      <div className="watercolor-card p-6 rounded-lg">
        <p className="text-lg mb-4">{status}</p>
        
        {tables.length > 0 ? (
          <div className="mt-4">
            <p className="font-heading mb-2">Найденные таблицы:</p>
            <ul className="list-disc list-inside space-y-1">
              {tables.map(table => (
                <li key={table} className="text-sm text-muted-foreground">
                  {table} ✅
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Таблицы не найдены. Нужно выполнить SQL из прошлого сообщения в Supabase SQL Editor.
            </p>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-4">
          URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
        </p>
      </div>
    </div>
  )
}