'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error("Supabase login error:", error);
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function signup(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  // Create the user and log them in immediately
  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error("Supabase signup error:", error);
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/admin/login')
}

export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? user.email : null
}
