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
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          store_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          store_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      order_request_items: {
        Row: {
          id: string
          order_request_id: string
          quantity: number
          unit_price_snapshot: number
          variant_id: string
        }
        Insert: {
          id?: string
          order_request_id: string
          quantity: number
          unit_price_snapshot: number
          variant_id: string
        }
        Update: {
          id?: string
          order_request_id?: string
          quantity?: number
          unit_price_snapshot?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_request_items_order_request_id_fkey"
            columns: ["order_request_id"]
            isOneToOne: false
            referencedRelation: "order_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_request_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_requests: {
        Row: {
          created_at: string
          customer_name: string
          customer_note: string | null
          customer_phone: string
          id: string
          requester_ip: unknown
          status: Database["public"]["Enums"]["order_request_status"]
          store_id: string
          total_estimate: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_note?: string | null
          customer_phone: string
          id?: string
          requester_ip?: unknown
          status?: Database["public"]["Enums"]["order_request_status"]
          store_id: string
          total_estimate: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_note?: string | null
          customer_phone?: string
          id?: string
          requester_ip?: unknown
          status?: Database["public"]["Enums"]["order_request_status"]
          store_id?: string
          total_estimate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_requests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          position: number
          product_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          product_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          price_override: number | null
          product_id: string
          size: string | null
          sku: string
          stock: number
          store_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          price_override?: number | null
          product_id: string
          size?: string | null
          sku: string
          stock?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          price_override?: number | null
          product_id?: string
          size?: string | null
          sku?: string
          stock?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          low_stock_threshold: number | null
          name: string
          slug: string
          store_id: string
          updated_at: string
        }
        Insert: {
          base_price: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          low_stock_threshold?: number | null
          name: string
          slug: string
          store_id: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          low_stock_threshold?: number | null
          name?: string
          slug?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          quantity: number
          sale_id: string
          subtotal: number
          unit_price: number
          variant_id: string
        }
        Insert: {
          id?: string
          quantity: number
          sale_id: string
          subtotal: number
          unit_price: number
          variant_id: string
        }
        Update: {
          id?: string
          quantity?: number
          sale_id?: string
          subtotal?: number
          unit_price?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          client_request_id: string
          created_at: string
          id: string
          notes: string | null
          sold_by: string
          store_id: string
          total_amount: number
        }
        Insert: {
          client_request_id: string
          created_at?: string
          id?: string
          notes?: string | null
          sold_by: string
          store_id: string
          total_amount: number
        }
        Update: {
          client_request_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          sold_by?: string
          store_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_sold_by_fkey"
            columns: ["sold_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          quantity: number
          reference_sale_id: string | null
          store_id: string
          type: Database["public"]["Enums"]["stock_movement_type"]
          variant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          quantity: number
          reference_sale_id?: string | null
          store_id: string
          type: Database["public"]["Enums"]["stock_movement_type"]
          variant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          quantity?: number
          reference_sale_id?: string | null
          store_id?: string
          type?: Database["public"]["Enums"]["stock_movement_type"]
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_stock_movements_sale"
            columns: ["reference_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      store_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["store_role"]
          status: Database["public"]["Enums"]["store_invitation_status"]
          store_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["store_role"]
          status?: Database["public"]["Enums"]["store_invitation_status"]
          store_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["store_role"]
          status?: Database["public"]["Enums"]["store_invitation_status"]
          store_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_invitations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["store_role"]
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["store_role"]
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["store_role"]
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_members_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          currency: string
          default_low_stock_threshold: number
          store_id: string
          updated_at: string
        }
        Insert: {
          currency?: string
          default_low_stock_threshold?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          currency?: string
          default_low_stock_threshold?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          plan: string
          slug: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          plan?: string
          slug: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          plan?: string
          slug?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: string
          status: string
          store_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          store_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_store_invitation: { Args: { p_token: string }; Returns: string }
      adjust_stock: {
        Args: {
          p_note?: string
          p_quantity: number
          p_type: Database["public"]["Enums"]["stock_movement_type"]
          p_variant_id: string
        }
        Returns: undefined
      }
      create_order_request: {
        Args: {
          p_customer_name: string
          p_customer_note: string
          p_customer_phone: string
          p_items: Json
          p_requester_ip?: unknown
          p_store_id: string
        }
        Returns: string
      }
      get_invitation_by_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          expires_at: string
          role: Database["public"]["Enums"]["store_role"]
          status: Database["public"]["Enums"]["store_invitation_status"]
          store_name: string
          store_slug: string
        }[]
      }
      get_store_role: {
        Args: { p_store_id: string; p_user_id?: string }
        Returns: Database["public"]["Enums"]["store_role"]
      }
      is_store_member: {
        Args: { p_store_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_store_owner: {
        Args: { p_store_id: string; p_user_id?: string }
        Returns: boolean
      }
      register_sale: {
        Args: {
          p_client_request_id: string
          p_items: Json
          p_notes?: string
          p_store_id: string
        }
        Returns: string
      }
    }
    Enums: {
      order_request_status: "pending" | "contacted" | "confirmed" | "cancelled"
      stock_movement_type: "purchase" | "adjustment" | "sale" | "return"
      store_invitation_status: "pending" | "accepted" | "revoked"
      store_role: "owner" | "employee"
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
      order_request_status: ["pending", "contacted", "confirmed", "cancelled"],
      stock_movement_type: ["purchase", "adjustment", "sale", "return"],
      store_invitation_status: ["pending", "accepted", "revoked"],
      store_role: ["owner", "employee"],
    },
  },
} as const
