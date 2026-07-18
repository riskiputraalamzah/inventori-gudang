'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateLocation } from '@/app/actions/location';
import { ArrowLeft, Save, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';

type LocationDetail = {
  id: number;
  code: string;
  name: string;
  xPercent: number | null;
  yPercent: number | null;
  isActive: boolean;
};

export default function EditLocationForm({ location }: { location: LocationDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateLocation(location.id, formData);
      if (result.success) {
        router.push('/locations');
      } else {
        setError(result.error ?? 'Terjadi kesalahan sistem');
      }
    });
  };

  return (
    <div className='flex flex-col gap-6 animate-in fade-in duration-300'>
      <div className='flex items-center gap-3'>
        <Link
          href='/locations'
          className='p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 transition-all shadow-sm'
        >
          <ArrowLeft className='h-4 w-4' />
        </Link>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-white'>Edit Lokasi: {location.code}</h1>
          <p className='text-xs text-zinc-500'>
            Edit nama, koordinat denah, atau nonaktifkan rak gudang
          </p>
        </div>
      </div>

      {error && (
        <div className='flex items-start gap-3 p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-400 shadow-sm'>
          <span className='text-sm'>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className='max-w-2xl'>
        <div className='bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-sm flex flex-col gap-6'>
          <div className='flex items-center gap-2 pb-3 border-b border-zinc-800'>
            <MapPin className='h-5 w-5 text-indigo-500' />
            <h2 className='font-bold text-lg text-white'>Detail Lokasi</h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-1.5 opacity-60'>
              <label className='text-xs font-semibold text-zinc-500'>
                Kode Lokasi (Tidak Dapat Diubah)
              </label>
              <input
                type='text'
                value={location.code}
                disabled
                className='px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-sm font-mono text-zinc-400 cursor-not-allowed'
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label htmlFor='name' className='text-xs font-semibold text-zinc-500'>
                Nama Lokasi
              </label>
              <input
                type='text'
                id='name'
                name='name'
                required
                defaultValue={location.name}
                maxLength={100}
                className='px-4 py-2.5 rounded-xl border border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white'
                disabled={isPending}
              />
            </div>
          </div>

          <div className='flex items-center gap-2.5 py-1'>
            <label className='text-xs font-semibold text-zinc-500'>Status Rak:</label>
            <div className='flex items-center gap-4'>
              <label className='flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-300'>
                <input
                  type='radio'
                  name='isActive'
                  value='true'
                  defaultChecked={location.isActive}
                  className='text-indigo-600'
                  disabled={isPending}
                />
                Aktif
              </label>
              <label className='flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-300'>
                <input
                  type='radio'
                  name='isActive'
                  value='false'
                  defaultChecked={!location.isActive}
                  className='text-indigo-600'
                  disabled={isPending}
                />
                Nonaktif (Sembunyikan dari pilihan form)
              </label>
            </div>
          </div>

          <div className='pb-3 border-b border-zinc-800'>
            <h3 className='text-xs font-bold text-zinc-400 mb-1'>Koordinat Denah (Opsional)</h3>
            <p className='text-[10px] text-zinc-500'>
              Sesuaikan posisi rak pada peta denah gudang (persen 0-100)
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='xPercent' className='text-xs font-semibold text-zinc-500'>
                Koordinat X (%)
              </label>
              <input
                type='number'
                id='xPercent'
                name='xPercent'
                min={0}
                max={100}
                step='any'
                defaultValue={location.xPercent ?? ''}
                placeholder='Horizontal (misal: 17)'
                className='px-4 py-2.5 rounded-xl border border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white'
                disabled={isPending}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label htmlFor='yPercent' className='text-xs font-semibold text-zinc-500'>
                Koordinat Y (%)
              </label>
              <input
                type='number'
                id='yPercent'
                name='yPercent'
                min={0}
                max={100}
                step='any'
                defaultValue={location.yPercent ?? ''}
                placeholder='Vertikal (misal: 37.5)'
                className='px-4 py-2.5 rounded-xl border border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white'
                disabled={isPending}
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={isPending}
            className='w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-750 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50'
          >
            {isPending ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className='h-4 w-4' />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}