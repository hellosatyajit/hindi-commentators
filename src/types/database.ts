export type Commentator = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  created_at: string
  is_active: boolean
}

export type Vote = {
  id: string
  user_id: string
  commentator_id: string
  vote_type: 1 | -1
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      commentators: {
        Row: Commentator
        Insert: Omit<Commentator, 'id' | 'created_at'>
        Update: Partial<Omit<Commentator, 'id' | 'created_at'>>
      }
      votes: {
        Row: Vote
        Insert: Omit<Vote, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Pick<Vote, 'vote_type'>>
      }
    }
  }
} 