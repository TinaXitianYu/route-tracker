import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://luntgtvusbzggijtpzgj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bnRndHZ1c2J6Z2dpanRwemdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzNjIxNjQsImV4cCI6MjA0NDkzODE2NH0.Mhf6etZ7CFb-Qv4fui5qHRPnx66HprjeNM4pEPrJa7M"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})