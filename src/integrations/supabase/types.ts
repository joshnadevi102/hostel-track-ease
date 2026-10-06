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
      app_settings: {
        Row: {
          allow_student_priority: boolean
          campus_name: string
          high_priority_sla_hours: number
          id: number
          support_email: string
          updated_at: string
        }
        Insert: {
          allow_student_priority?: boolean
          campus_name?: string
          high_priority_sla_hours?: number
          id?: number
          support_email?: string
          updated_at?: string
        }
        Update: {
          allow_student_priority?: boolean
          campus_name?: string
          high_priority_sla_hours?: number
          id?: number
          support_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      complaint_history: {
        Row: {
          complaint_id: string
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["complaint_status"] | null
          note: string | null
          old_status: Database["public"]["Enums"]["complaint_status"] | null
          user_id: string | null
        }
        Insert: {
          complaint_id: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["complaint_status"] | null
          note?: string | null
          old_status?: Database["public"]["Enums"]["complaint_status"] | null
          user_id?: string | null
        }
        Update: {
          complaint_id?: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["complaint_status"] | null
          note?: string | null
          old_status?: Database["public"]["Enums"]["complaint_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_history_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_images: {
        Row: {
          complaint_id: string
          created_at: string
          id: string
          image_type: string
          image_url: string
          uploaded_by: string | null
        }
        Insert: {
          complaint_id: string
          created_at?: string
          id?: string
          image_type?: string
          image_url: string
          uploaded_by?: string | null
        }
        Update: {
          complaint_id?: string
          created_at?: string
          id?: string
          image_type?: string
          image_url?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_images_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_team_id: string | null
          assigned_to: string | null
          category_id: string | null
          closed_at: string | null
          complaint_number: string
          created_at: string
          description: string
          hostel_id: string
          id: string
          location_name: string | null
          priority: Database["public"]["Enums"]["complaint_priority"]
          resolution_notes: string | null
          resolved_at: string | null
          room_number: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          student_id: string
          title: string
          updated_at: string
          verification_notes: string | null
        }
        Insert: {
          assigned_team_id?: string | null
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          complaint_number?: string
          created_at?: string
          description?: string
          hostel_id: string
          id?: string
          location_name?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolution_notes?: string | null
          resolved_at?: string | null
          room_number?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id: string
          title: string
          updated_at?: string
          verification_notes?: string | null
        }
        Update: {
          assigned_team_id?: string | null
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          complaint_number?: string
          created_at?: string
          description?: string
          hostel_id?: string
          id?: string
          location_name?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolution_notes?: string | null
          resolved_at?: string | null
          room_number?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id?: string
          title?: string
          updated_at?: string
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          complaint_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          user_id: string
        }
        Insert: {
          complaint_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          user_id: string
        }
        Update: {
          complaint_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          hostel_id: string | null
          id: string
          name: string
          phone: string | null
          room_number: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          hostel_id?: string | null
          id: string
          name?: string
          phone?: string | null
          room_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          hostel_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          room_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_locations: {
        Row: {
          created_at: string
          hostel_id: string
          id: string
          location_name: string
          qr_code: string
          room_number: string | null
        }
        Insert: {
          created_at?: string
          hostel_id: string
          id?: string
          location_name: string
          qr_code?: string
          room_number?: string | null
        }
        Update: {
          created_at?: string
          hostel_id?: string
          id?: string
          location_name?: string
          qr_code?: string
          room_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_locations_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          team_id: string
          user_id: string
        }
        Insert: {
          team_id: string
          user_id: string
        }
        Update: {
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_complaint_note: {
        Args: { _complaint_id: string; _note: string }
        Returns: undefined
      }
      can_view_complaint: {
        Args: { _complaint_id: string; _user_id: string }
        Returns: boolean
      }
      ensure_profile: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff_user: { Args: { _user_id: string }; Returns: boolean }
      notify: {
        Args: {
          _complaint: string
          _msg: string
          _title: string
          _user: string
        }
        Returns: undefined
      }
      set_complaint_priority: {
        Args: {
          _complaint_id: string
          _priority: Database["public"]["Enums"]["complaint_priority"]
        }
        Returns: undefined
      }
      set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      update_complaint_status: {
        Args: {
          _assigned_to?: string
          _complaint_id: string
          _new_status: Database["public"]["Enums"]["complaint_status"]
          _note?: string
          _team_id?: string
        }
        Returns: undefined
      }
      user_hostel: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "student" | "volunteer" | "warden" | "staff" | "admin"
      complaint_priority: "high" | "medium" | "low"
      complaint_status:
        | "submitted"
        | "verified"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "closed"
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
      app_role: ["student", "volunteer", "warden", "staff", "admin"],
      complaint_priority: ["high", "medium", "low"],
      complaint_status: [
        "submitted",
        "verified",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
      ],
    },
  },
} as const
