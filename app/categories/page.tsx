export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { ToggleCategoryButton, DeleteCategoryButton } from './actions-client';
import { requireSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function CategoriesPage() {
  const session = await requireSession();
  if (session.role !== 'admin') {
    redirect('/');
  }

  const categories = await prisma.itemCategory.findMany({
    orderBy: { code: 'asc' },
  });

  return (
    <div className='flex flex-col gap-8 animate-in fade-in duration-300'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-white'>Kategori Barang</h1>
          <p className='text-zinc-500 text-sm mt-1'>Kelola kategori untuk auto-generate SKU</p>
        </div>
        <Link
          href='/categories/new'
          className='px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm hover:shadow-md transition-all'
        >
          <Plus className='h-4 w-4' />
          Tambah Kategori
        </Link>
      </div>

      <div className='bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='bg-zinc-950/50 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                <th className='px-6 py-4'>Kode</th>
                <th className='px-6 py-4'>Nama Kategori</th>
                <th className='px-6 py-4'>Status</th>
                <th className='px-6 py-4 text-right'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-zinc-800 text-sm text-zinc-300'>
              {categories.map((cat) => (
                <tr key={cat.id} className='hover:bg-zinc-800/30 transition-colors'>
                  <td className='px-6 py-4 font-mono text-xs font-bold text-indigo-400'>{cat.code}</td>
                  <td className='px-6 py-4 font-bold text-white'>{cat.name}</td>
                  <td className='px-6 py-4'>
                    <span
                      className={
                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ' +
                        (cat.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-700/30 text-zinc-500 border border-zinc-700/50')
                      }
                    >
                      {cat.isActive ? (
                        <>
                          <CheckCircle className='h-3 w-3' /> Aktif
                        </>
                      ) : (
                        <>
                          <XCircle className='h-3 w-3' /> Nonaktif
                        </>
                      )}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <ToggleCategoryButton id={cat.id} isActive={cat.isActive} />
                      <DeleteCategoryButton id={cat.id} code={cat.code} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
