export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_user_id: string | null
          first_name: string
          last_name: string
          email: string
          phone_number: string
          country: string
          referral_code: string
          referred_by: string | null
          profile_photo_url: string | null
          wallet_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone_number: string
          country: string
          referral_code: string
          referred_by?: string | null
          profile_photo_url?: string | null
          wallet_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone_number?: string
          country?: string
          referral_code?: string
          referred_by?: string | null
          profile_photo_url?: string | null
          wallet_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      draws: {
        Row: {
          id: string
          draw_date: string
          draw_time: string
          status: string
          total_tickets: number
          minimum_tickets: number
          prize_pool: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          draw_date: string
          draw_time: string
          status?: string
          total_tickets?: number
          minimum_tickets?: number
          prize_pool?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          draw_date?: string
          draw_time?: string
          status?: string
          total_tickets?: number
          minimum_tickets?: number
          prize_pool?: number
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          user_id: string | null
          draw_id: string | null
          ticket_number: string
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          draw_id?: string | null
          ticket_number: string
          source: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          draw_id?: string | null
          ticket_number?: string
          source?: string
          created_at?: string
        }
      }
      winners: {
        Row: {
          id: string
          draw_id: string | null
          user_id: string | null
          ticket_id: string | null
          prize_amount: number
          prize_tier: string
          created_at: string
        }
        Insert: {
          id?: string
          draw_id?: string | null
          user_id?: string | null
          ticket_id?: string | null
          prize_amount: number
          prize_tier: string
          created_at?: string
        }
        Update: {
          id?: string
          draw_id?: string | null
          user_id?: string | null
          ticket_id?: string | null
          prize_amount?: number
          prize_tier?: string
          created_at?: string
        }
      }
      ad_watches: {
        Row: {
          id: string
          user_id: string | null
          watched_at: string
          ticket_earned: boolean
          session_count: number
        }
        Insert: {
          id?: string
          user_id?: string | null
          watched_at?: string
          ticket_earned?: boolean
          session_count?: number
        }
        Update: {
          id?: string
          user_id?: string | null
          watched_at?: string
          ticket_earned?: boolean
          session_count?: number
        }
      }
      withdrawals: {
        Row: {
          id: string
          user_id: string | null
          amount: number
          method: string
          details: Json
          status: string
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          amount: number
          method: string
          details: Json
          status?: string
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          amount?: number
          method?: string
          details?: Json
          status?: string
          created_at?: string
          processed_at?: string | null
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string | null
          email: string
          subject: string
          message: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          subject: string
          message: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          subject?: string
          message?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
