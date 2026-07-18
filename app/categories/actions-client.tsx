'use client';

import { toggleCategoryStatus, deleteCategory } from '@/app/actions/category';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Trash2, Power } from 'lucide-react';

export function ToggleCategoryButton({ id, isActive }: { id: number; isActive: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleCategoryStatus(id, !isActive);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className='p-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50'
      title={isActive ? 'Nonaktifkan' : 'Aktifkan'}
    >
      <Power className={'h-4 w-4 ' + (isActive ? 'text-emerald-400' : 'text-zinc-500')} />
    </button>
  );
}

export function DeleteCategoryButton({ id, code }: { id: number; code: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!confirm(`Hapus kategori ${code}? Aksi ini tidak dapat dibatalkan.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? 'Gagal menghapus kategori.');
        setTimeout(() => setError(null), 5000);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className='p-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50'
        title='Hapus'
      >
        <Trash2 className='h-4 w-4 text-red-400' />
      </button>
      {error && (
        <div className='absolute mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-red-800 dark:text-red-400 text-xs max-w-xs'>
          {error}
        </div>
      )}
    </>
  );
}
