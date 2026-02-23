export type Profile = {
  id: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

export type Pet = {
  id: string
  name: string
  avatar_url: string | null
  user_id: string
  created_at: string
}

export type FamilyMember = {
  id: string
  pet_id: string
  user_id: string | null
  role: 'owner' | 'member'
  invited_by: string | null
  status: 'active' | 'pending'
  invited_email: string | null
  created_at: string
}

export type ActionTemplate = {
  id: string
  pet_id: string
  name: string
  icon: string
  created_by: string
  created_at: string
}

export type Action = {
  id: string
  pet_id: string
  user_id: string
  template_id: string | null
  timestamp: string
  created_at: string
  // joined fields (from queries)
  user_name?: string
  template_name?: string
  template_icon?: string
}