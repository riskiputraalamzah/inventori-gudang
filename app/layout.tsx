import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, Boxes, MapPin, Tag, User } from 'lucide-react';
import { getSession } from '@/lib/auth';
import LogoutButton from './logout-button';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inventori Gudang v2',
  description: 'Pencatatan barang gudang dengan denah lokasi',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const fontClasses = geistSans.variable + ' ' + geistMono.variable + ' h-full antialiased';

  // Render only clean children for login page to keep full screen dark theme
  if (!session) {
    return (
      <html lang='id' className={fontClasses}>
        <body className='min-h-full bg-zinc-950 text-zinc-50 font-sans'>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang='id' className={fontClasses}>
      <body className='min-h-full bg-zinc-950 text-zinc-50 flex flex-col md:flex-row font-sans'>
        {/* Sidebar Desktop - Deep Space Dark Theme */}
        <aside className='hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 p-6 gap-6 h-screen sticky top-0 shrink-0'>
          <div className='flex items-center gap-2.5 px-2'>
            <div className='p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25'>
              <Boxes className='h-5 w-5 text-white' />
            </div>
            <span className='font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent'>Gudang v2</span>
          </div>
          <nav className='flex flex-col gap-1.5 flex-1'>
            <Link href='/' className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all font-semibold text-sm'>
              <LayoutDashboard className='h-4 w-4' />
              Dashboard
            </Link>
            <Link href='/items/new' className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all font-semibold text-sm'>
              <PlusCircle className='h-4 w-4' />
              Mutasi Barang
            </Link>
            <Link href='/items' className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all font-semibold text-sm'>
              <Boxes className='h-4 w-4' />
              Daftar Barang
            </Link>
            {session.role === 'admin' && (
              <>
                <Link href='/locations' className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all font-semibold text-sm'>
                  <MapPin className='h-4 w-4' />
                  Denah Lokasi
                </Link>
                <Link href='/categories' className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all font-semibold text-sm'>
                  <Tag className='h-4 w-4' />
                  Kategori
                </Link>
              </>
            )}
          </nav>
          <div className='border-t border-zinc-800 pt-4 px-2 flex flex-col gap-3'>
            <div className='flex items-center gap-2 text-xs text-zinc-300 font-semibold'>
              <User className='h-3.5 w-3.5 text-indigo-400' />
              <span className='truncate max-w-[140px]'>{session.name}</span>
              <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-auto' />
            </div>
            <LogoutButton />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className='flex-1 flex flex-col min-h-screen pb-20 md:pb-0'>
          {/* Header Mobile - Premium Gradient Style */}
          <header className='flex md:hidden items-center justify-between px-6 py-4.5 bg-zinc-900 border-b border-zinc-800 shadow-md'>
            <div className='flex items-center gap-2.5'>
              <div className='p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-sm'>
                <Boxes className='h-4 w-4 text-white' />
              </div>
              <span className='font-bold text-base bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent'>Gudang v2</span>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-[10px] bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider'>
                {session.role}
              </span>
              <LogoutButton />
            </div>
          </header>

          <main className='flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto'>
            {children}
          </main>
        </div>

        {/* Bottom Navigation Mobile - Glassmorphism Style */}
        <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800/80 py-2.5 px-4 flex justify-around items-center z-50 shadow-2xl'>
          <Link href='/' className='flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-all'>
            <LayoutDashboard className='h-5 w-5' />
            <span className='text-[9px] font-bold tracking-tight'>Dashboard</span>
          </Link>
          <Link href='/items/new' className='flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-all'>
            <PlusCircle className='h-5 w-5' />
            <span className='text-[9px] font-bold tracking-tight'>Mutasi</span>
          </Link>
          <Link href='/items' className='flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-all'>
            <Boxes className='h-5 w-5' />
            <span className='text-[9px] font-bold tracking-tight'>Barang</span>
          </Link>
          {session.role === 'admin' && (
            <>
              <Link href='/locations' className='flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-all'>
                <MapPin className='h-5 w-5' />
                <span className='text-[9px] font-bold tracking-tight'>Denah</span>
              </Link>
              <Link href='/categories' className='flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-all'>
                <Tag className='h-5 w-5' />
                <span className='text-[9px] font-bold tracking-tight'>Kategori</span>
              </Link>
            </>
          )}
        </nav>
      </body>
    </html>
  );
}
