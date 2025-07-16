export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      game_players: {
        Row: {
          color: string
          created_at: string
          id: string
          in_jail: boolean
          jail_turns: number
          lobby_id: string
          money: number
          name: string
          player_id: string
          position: number
          properties: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          in_jail?: boolean
          jail_turns?: number
          lobby_id: string
          money?: number
          name: string
          player_id: string
          position?: number
          properties?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          in_jail?: boolean
          jail_turns?: number
          lobby_id?: string
          money?: number
          name?: string
          player_id?: string
          position?: number
          properties?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      game_state: {
        Row: {
          created_at: string
          current_player_id: string
          game_phase: string
          id: string
          last_dice_roll: Json | null
          lobby_id: string
          round_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_player_id: string
          game_phase?: string
          id?: string
          last_dice_roll?: Json | null
          lobby_id: string
          round_number?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_player_id?: string
          game_phase?: string
          id?: string
          last_dice_roll?: Json | null
          lobby_id?: string
          round_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_state_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      lobbies: {
        Row: {
          code: string
          created_at: string
          game_mode: string
          host_id: string | null
          id: string
          is_private: boolean | null
          max_players: number
          max_players_setting: number | null
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          game_mode: string
          host_id?: string | null
          id?: string
          is_private?: boolean | null
          max_players?: number
          max_players_setting?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          game_mode?: string
          host_id?: string | null
          id?: string
          is_private?: boolean | null
          max_players?: number
          max_players_setting?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      lobby_players: {
        Row: {
          avatar: string
          color: string
          id: string
          is_host: boolean
          joined_at: string
          lobby_id: string
          name: string
          player_id: string
        }
        Insert: {
          avatar: string
          color: string
          id?: string
          is_host?: boolean
          joined_at?: string
          lobby_id: string
          name: string
          player_id: string
        }
        Update: {
          avatar?: string
          color?: string
          id?: string
          is_host?: boolean
          joined_at?: string
          lobby_id?: string
          name?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_players_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          gold: number | null
          id: string
          is_banned: boolean | null
          language: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          gold?: number | null
          id?: string
          is_banned?: boolean | null
          language?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          gold?: number | null
          id?: string
          is_banned?: boolean | null
          language?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_ownership: {
        Row: {
          created_at: string
          houses: number | null
          id: string
          is_mortgaged: boolean | null
          lobby_id: string
          owner_player_id: string | null
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          houses?: number | null
          id?: string
          is_mortgaged?: boolean | null
          lobby_id: string
          owner_player_id?: string | null
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          houses?: number | null
          id?: string
          is_mortgaged?: boolean | null
          lobby_id?: string
          owner_player_id?: string | null
          property_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          available: boolean | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          item_id: string
          purchase_type: string | null
          quantity: number | null
          total_price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          item_id: string
          purchase_type?: string | null
          quantity?: number | null
          total_price: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          item_id?: string
          purchase_type?: string | null
          quantity?: number | null
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "vip" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      user_role: ["admin", "vip", "user"],
    },
  },
} as const
