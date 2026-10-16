'use server';

import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'bazar_admin_session';

export async function loginAdminAction(password: string) {
  const correctPassword = process.env.ADMIN_PASSWORD || 'adminairsoft2026';

  if (password === correctPassword) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });
    return { success: true };
  }

  return { error: 'Palavra-passe incorreta.' };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return { success: true };
}

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  return session?.value === 'authenticated';
}