'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';
import { Boxes, KeyRound, Loader2, Mail, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error ?? 'Email atau password salah.');
      }
    });
  };

  return (
    <div className='min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans select-none'>
      {/* Decorative premium gradients */}
      <div className='absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none' />
      <div className='absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none' />

      <div className='w-full max-w-md flex flex-col gap-8 z-10 animate-in fade-in slide-in-from-bottom-6 duration-500'>
        {/* Brand Logo */}
        <div className='flex flex-col items-center gap-3 text-center'>
          <div className='p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/20'>
            <Boxes className='h-8 w-8 text-white' />
          </div>
          <h1 className='text-3xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent mt-1'>
            Gudang v2
          </h1>
          <p className='text-xs text-zinc-500 font-semibold tracking-wide uppercase'>
            Sistem Manajemen Inventori Internal
          </p>
        </div>

        {/* Login Box */}
        <div className='bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 relative'>
          <div className='flex flex-col gap-1.5 border-b border-zinc-800 pb-4'>
            <h2 className='text-xl font-bold text-white'>Masuk ke Akun</h2>
            <p className='text-xs text-zinc-400'>Masukkan kredensial petugas gudang Anda</p>
          </div>

          {error && (
            <div className='flex items-start gap-2.5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs leading-relaxed animate-in fade-in duration-200'>
              <ShieldAlert className='h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5' />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className='flex flex-col gap-5.5'>
            <div className='flex flex-col gap-2'>
              <label htmlFor='email' className='text-xs font-semibold text-zinc-500'>
                Alamat Email
              </label>
              <div className='relative'>
                <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500' />
                <input
                  type='email'
                  id='email'
                  name='email'
                  required
                  placeholder='petugas@gudang.com'
                  className='w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white'
                  disabled={isPending}
                />
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor='password' className='text-xs font-semibold text-zinc-500'>
                Kata Sandi
              </label>
              <div className='relative'>
                <KeyRound className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500' />
                <input
                  type='password'
                  id='password'
                  name='password'
                  required
                  placeholder='••••••••'
                  className='w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white'
                  disabled={isPending}
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={isPending}
              className='w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-750 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2'
            >
              {isPending ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Memproses...
                </>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className='text-center text-xs text-zinc-600 font-medium leading-relaxed'>
          <span>Gudang v2 &bull; Hak Cipta Dilindungi &bull; 2026</span>
        </div>
      </div>
    </div>
  );
}
