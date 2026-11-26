/*
 * Generated from the Supabase schema (project "mcesta"). Do not edit by hand.
 * Regenerate after a schema change (Supabase MCP generate_typescript_types, or
 * `supabase gen types typescript --project-id oupaazlibvgursijgizf`).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          author_email: string
          author_name: string
          created_at: string
          id: string
          product_handle: string
          product_id: string
          question: string
          status: Database["public"]["Enums"]["moderation_status"]
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          author_email: string
          author_name: string
          created_at?: string
          id?: string
          product_handle: string
          product_id: string
          question: string
          status?: Database["public"]["Enums"]["moderation_status"]
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          author_email?: string
          author_name?: string
          created_at?: string
          id?: string
          product_handle?: string
          product_id?: string
          question?: string
          status?: Database["public"]["Enums"]["moderation_status"]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_email: string
          author_name: string
          body: string
          created_at: string
          customer_id: string | null
          id: string
          moderated_at: string | null
          photos: string[]
          product_handle: string
          product_id: string
          rating: number
          status: Database["public"]["Enums"]["moderation_status"]
          title: string | null
          verified_buyer: boolean
        }
        Insert: {
          author_email: string
          author_name: string
          body: string
          created_at?: string
          customer_id?: string | null
          id?: string
          moderated_at?: string | null
          photos?: string[]
          product_handle: string
          product_id: string
          rating: number
          status?: Database["public"]["Enums"]["moderation_status"]
          title?: string | null
          verified_buyer?: boolean
        }
        Update: {
          author_email?: string
          author_name?: string
          body?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          moderated_at?: string | null
          photos?: string[]
          product_handle?: string
          product_id?: string
          rating?: number
          status?: Database["public"]["Enums"]["moderation_status"]
          title?: string | null
          verified_buyer?: boolean
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          owner_key: string
          product_handle: string
          product_id: string
          saved_currency: string
          saved_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          owner_key: string
          product_handle: string
          product_id: string
          saved_currency: string
          saved_price: number
        }
        Update: {
          created_at?: string
          id?: string
          owner_key?: string
          product_handle?: string
          product_id?: string
          saved_currency?: string
          saved_price?: number
        }
        Relationships: []
      }
    }
    Views: {
      product_review_stats: {
        Row: {
          average_rating: number | null
          product_id: string | null
          review_count: number | null
          stars_1: number | null
          stars_2: number | null
          stars_3: number | null
          stars_4: number | null
          stars_5: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      moderation_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      moderation_status: ["pending", "approved", "rejected"],
    },
  },
} as const
