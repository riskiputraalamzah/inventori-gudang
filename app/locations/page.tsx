export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { MapPin, Boxes, Info, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { ToggleLocationButton, DeleteLocationButton, EditLocationLink } from './actions-client';
import { requireSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

type BalItem = { quantity: number; item: { sku: string; name: string; unit: string } | null };
type LocRow = {
  id: number;
  code: string;
  name: string;
  xPercent: number | null;
  yPercent: number | null;
  isActive: boolean;
  stockBalancesHere: BalItem[];
};

const RACKS = [
  'A-01', 'A-02', 'A-03', 'A-04',
  'B-01', 'B-02', 'B-03', 'B-04',
  'C-01', 'C-02', 'C-03', 'C-04',
];

const MOCK: LocRow[] = [
  { id: 1, code: 'A-02', name: 'Rak A-02', xPercent: 17, yPercent: 40, isActive: true, stockBalancesHere: [{ quantity: 25, item: { sku: 'KRS-A12', name: 'Kursi Kantor Ergonomis', unit: 'pcs' } }] },
  { id: 2, code: 'B-01', name: 'Rak B-01', xPercent: 50, yPercent: 15, isActive: true, stockBalancesHere: [{ quantity: 12, item: { sku: 'KRS-A12', name: 'Kursi Kantor Ergonomis', unit: 'pcs' } }] },
  { id: 3, code: 'B-04', name: 'Rak B-04', xPercent: 50, yPercent: 90, isActive: true, stockBalancesHere: [{ quantity: 15, item: { sku: 'MJA-B04', name: 'Meja Lipat Kayu', unit: 'pcs' } }] },
  { id: 4, code: 'C-01', name: 'Rak C-01', xPercent: 83, yPercent: 15, isActive: true, stockBalancesHere: [{ quantity: 80, item: { sku: 'LMP-C01', name: 'Lampu LED Phillips', unit: 'box' } }] },
];

export default async function LocationsPage() {
  const session = await requireSession();
  if (session.role !== 'admin') {
    redirect('/');
  }

  let locations: LocRow[] = [];
  let dbOnline = true;
  try {
    locations = (await prisma.warehouseLocation.findMany({
      include: { stockBalancesHere: { include: { item: true } } },
      orderBy: { code: 'asc' },
    })) as LocRow[];
  } catch {
    dbOnline = false;
    locations = MOCK;
  }

  return (
    <div className='flex flex-col gap-8 animate-in fade-in duration-300'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-white'>Denah & Lokasi Gudang</h1>
          <p className='text-zinc-500 text-sm mt-1'>Visualisasi tata letak barang secara real-time</p>
        </div>
        <Link
          href='/locations/new'
          className='px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm hover:shadow-md transition-all'
        >
          <Plus className='h-4 w-4' />
          Tambah Lokasi
        </Link>
      </div>

      {!dbOnline && (
        <div className='flex items-start gap-3 p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-amber-850 dark:text-amber-400 shadow-sm animate-in fade-in duration-200'>
          <AlertCircle className='h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5' />
          <div className='flex flex-col gap-0.5'>
            <span className='font-bold text-sm'>Mode Demo (Database Offline)</span>
            <span className='text-xs text-amber-700/90 dark:text-amber-400/90 leading-relaxed'>
              Koneksi database tidak terdeteksi. Sistem secara otomatis menggunakan mock data lokal.
            </span>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Visual Map */}
        <div className='lg:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-sm flex flex-col gap-4'>
          <div className='flex items-center justify-between border-b border-zinc-800 pb-3'>
            <div className='flex items-center gap-2 font-semibold text-sm'>
              <MapPin className='h-4 w-4 text-indigo-500' />
              <span className='text-white'>Visual Peta Rak</span>
            </div>
            <span className='text-xs text-zinc-400'>Denah Koordinat Aktif</span>
          </div>
          <div
            className='relative w-full bg-zinc-950 rounded-xl overflow-hidden select-none border border-zinc-800'
            style={{ aspectRatio: '756 / 411' }}
          >
            <div className='absolute inset-0 grid grid-cols-3 grid-rows-4'>
              {RACKS.map((code) => {
                const loc = locations.find((l) => l.code === code);
                const hasStock = (loc?.stockBalancesHere.length ?? 0) > 0;
                return (
                  <div
                    key={code}
                    className={
                      'border border-zinc-900/40 flex items-center justify-center text-[10px] font-mono font-semibold transition-all ' +
                      (hasStock
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-zinc-700')
                    }
                  >
                    {code}
                  </div>
                );
              })}
            </div>
            {locations.map((loc) => {
              if (!loc.xPercent || !loc.yPercent || !loc.isActive) return null;
              const hasStock = loc.stockBalancesHere.length > 0;
              return (
                <div
                  key={loc.id}
                  className={
                    'absolute w-3.5 h-3.5 rounded-full border-2 border-zinc-900 shadow-md -translate-x-1/2 -translate-y-1/2 z-10 transition-all ' +
                    (hasStock ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-650')
                  }
                  style={{ top: loc.yPercent + '%', left: loc.xPercent + '%' }}
                  title={
                    'Rak ' +
                    loc.code +
                    ': ' +
                    (hasStock ? loc.stockBalancesHere.map((s) => s.item?.name).join(', ') : 'Kosong')
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Locations List */}
        <div className='bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-sm flex flex-col gap-6'>
          <div className='flex items-center gap-2 font-semibold text-sm border-b border-zinc-800 pb-3'>
            <Boxes className='h-4 w-4 text-indigo-500' />
            <span className='text-white'>Daftar Rak & Lokasi ({locations.length})</span>
          </div>
          <div className='flex flex-col gap-3 flex-1 overflow-y-auto max-h-[400px] pr-1'>
            {locations.map((loc) => {
              const hasStock = loc.stockBalancesHere.length > 0;
              return (
                <div
                  key={loc.id}
                  className='p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/40 flex flex-col gap-2.5 hover:border-indigo-500/30 transition-all'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='font-bold text-xs bg-zinc-800 px-2 py-0.5 rounded-md font-mono text-zinc-300'>
                        {loc.code}
                      </span>
                      <span
                        className={
                          'text-[9px] font-bold px-2 py-0.5 rounded-full border ' +
                          (loc.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700/50')
                        }
                      >
                        {loc.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <EditLocationLink id={loc.id} />
                      <ToggleLocationButton id={loc.id} isActive={loc.isActive} />
                      <DeleteLocationButton id={loc.id} code={loc.code} />
                    </div>
                  </div>
                  <div className='text-xs font-semibold text-zinc-400'>{loc.name}</div>
                  {hasStock ? (
                    <div className='flex flex-col gap-1.5 text-xs pt-1 border-t border-zinc-800/60'>
                      {loc.stockBalancesHere.map((b, i) => (
                        <div
                          key={i}
                          className='flex items-center justify-between font-medium text-zinc-400'
                        >
                          <span className='truncate max-w-28'>{b.item?.name}</span>
                          <span className='font-bold text-white shrink-0'>
                            {b.quantity} {b.item?.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className='text-[10px] text-zinc-400 italic flex items-center gap-1'>
                      <Info className='h-3 w-3 shrink-0' /> Belum ada barang
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
