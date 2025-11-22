// lib/types.ts
export type Tx = {
  id: string
  user_id: string
  amount: number
  category?: string | null
  purpose?: string | null
  merchant?: string | null
  type?: string | null
  created_at?: string | null
}