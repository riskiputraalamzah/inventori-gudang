'use client';

import { toggleLocationStatus, deleteLocation } from '@/app/actions/location';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Trash2, Power, Edit } from 'lucide-react';
import Link from 'next/link';

export function ToggleLocationButton({ id, isActive }: { id: number; isActive: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleLocationStatus(id, !isActive);
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

export function DeleteLocationButton({ id, code }: { id: number; code: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!confirm(`Hapus lokasi ${code}? Aksi ini tidak dapat dibatalkan.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteLocation(id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? 'Gagal menghapus lokasi.');
        setTimeout(() => setError(null), 5000);
      }
    });
  };

  return (
    <div className='relative inline-block'>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className='p-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50'
        title='Hapus'
      >
        <Trash2 className='h-4 w-4 text-red-400' />
      </button>
      {error && (
        <div className='absolute right-0 bottom-full mb-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-red-850 dark:text-red-400 text-xs w-64 z-50 shadow-lg leading-relaxed'>
          {error}
        </div>
      )}
    </div>
  );
}

export function EditLocationLink({ id }: { id: number }) {
  return (
    <Link
      href={`/locations/${id}/edit`}
      className='p-2 rounded-lg hover:bg-zinc-800 transition-colors inline-block'
      title='Edit Lokasi'
    >
      <Edit className='h-4 w-4 text-indigo-400' />
    </Link>
  );
}
