import { supabase } from './supabase';

export async function signUp({ email, password, fullName, yearLevel }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        year_level: yearLevel,
      },
    },
  });

  if (error) {
    console.error('Signup error:', error);
    throw error;
  }
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error);
    throw error;
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Listen to auth state changes (call once in your App root)
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}