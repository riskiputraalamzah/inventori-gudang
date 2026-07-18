'use client';

import { logoutAction } from '@/app/actions/auth';
import { LogOut } from 'lucide-react';
import { useTransition } from 'react';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    if (confirm('Keluar dari aplikasi?')) {
      startTransition(async () => {
        await logoutAction();
        window.location.href = '/login';
      });
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className='flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50 font-semibold text-xs focus:outline-none'
      title='Keluar'
    >
      <LogOut className='h-3.5 w-3.5' />
      <span>{isPending ? 'Keluar...' : 'Keluar'}</span>
    </button>
  );
}
