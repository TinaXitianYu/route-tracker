import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import {Platform, StyleSheet} from 'react-native';
const supabaseUrl = "https://khqsvghxlbmwnfcekqbv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocXN2Z2h4bGJtd25mY2VrcWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzNzgzOTcsImV4cCI6MjA0NDk1NDM5N30.QkuagsbAQVpQSOw5UUIrLhtpknVOuhV4g_wyPcJASMU";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        // https://github.com/supabase/supabase-js/issues/870
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});