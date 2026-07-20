'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashPassword, encryptSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function loginAction(payload: Record<string, string>): Promise<{ success: boolean; error?: string }> {
  try {
    const email = payload.email?.trim().toLowerCase() ?? '';
    const password = payload.password ?? '';

    if (!email || !password) {
      return { success: false, error: 'Email dan password wajib diisi.' };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Email atau password salah.' };
    }

    const passHash = hashPassword(password);
    if (user.passwordHash !== passHash) {
      return { success: false, error: 'Email atau password salah.' };
    }

    const sessionToken = encryptSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24h
      path: '/',
    });

    return { success: true };
  } catch (error) {
    // Log detailed error to server console for debugging
    console.error('LOGIN_ERROR_DETAIL:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      constructor: error?.constructor?.name,
    });

    // Additional detailed logging for debugging
    if (error && typeof error === 'object') {
      console.dir(error, { depth: null });
    }

    // Return safe error message to client
    return { 
      success: false, 
      error: 'Login gagal. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.' 
    };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  revalidatePath('/');
}

export async function checkAdminRole(): Promise<boolean> {
  const { getSession } = await import('@/lib/auth');
  const session = await getSession();
  return session?.role === 'admin';
}
