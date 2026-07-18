export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Boxes, MapPin, ArrowLeft, History, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type BalItem = { quantity: number; location: { code: string } | null };
type MoveItem = { id: number; type: string; quantity: number; createdAt: Date; note: string | null; sourceLocation: { code: string } | null; destinationLocation: { code: string } | null };
type ItemDetail = { id: number; sku: string; name: string; unit: string; stockBalances: BalItem[]; stockMovements: MoveItem[] };

const MOCK_ITEMS: Record<string, ItemDetail> = {
  '1': {
    id: 1,
    sku: 'KRS-A12',
    name: 'Kursi Kantor Ergonomis',
    unit: 'pcs',
    stockBalances: [
      { quantity: 25, location: { code: 'A-02' } },
      { quantity: 12, location: { code: 'B-01' } },
    ],
    stockMovements: [
      { id: 101, type: 'IN', quantity: 25, createdAt: new Date(Date.now() - 600000), note: 'Barang masuk dari supplier', sourceLocation: null, destinationLocation: { code: 'A-02' } },
      { id: 102, type: 'IN', quantity: 12, createdAt: new Date(Date.now() - 3600000), note: 'Stok tambahan', sourceLocation: null, destinationLocation: { code: 'B-01' } },
    ],
  },
  '2': {
    id: 2,
    sku: 'MJA-B04',
    name: 'Meja Lipat Kayu',
    unit: 'pcs',
    stockBalances: [
      { quantity: 15, location: { code: 'B-04' } },
    ],
    stockMovements: [
      { id: 201, type: 'IN', quantity: 25, createdAt: new Date(Date.now() - 7200000), note: 'Penerimaan awal', sourceLocation: null, destinationLocation: { code: 'B-04' } },
      { id: 202, type: 'OUT', quantity: 10, createdAt: new Date(Date.now() - 2700000), note: 'Pengeluaran proyek A', sourceLocation: { code: 'B-04' }, destinationLocation: null },
    ],
  },
};

const RACK_COORDINATES: Record<string, { x: number; y: number }> = {
  'A-01': { x: 17, y: 12.5 }, 'A-02': { x: 17, y: 37.5 }, 'A-03': { x: 17, y: 62.5 }, 'A-04': { x: 17, y: 87.5 },
  'B-01': { x: 50, y: 12.5 }, 'B-02': { x: 50, y: 37.5 }, 'B-03': { x: 50, y: 62.5 }, 'B-04': { x: 50, y: 87.5 },
  'C-01': { x: 83, y: 12.5 }, 'C-02': { x: 83, y: 37.5 }, 'C-03': { x: 83, y: 62.5 }, 'C-04': { x: 83, y: 87.5 },
};

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: ItemDetail | null = null;
  let dbOnline = true;

  try {
    const dbItem = await prisma.item.findUnique({
      where: { id: Number(id) },
      include: {
        stockBalances: { include: { location: true } },
        stockMovements: {
          include: { sourceLocation: true, destinationLocation: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (dbItem) {
      item = {
        id: dbItem.id,
        sku: dbItem.sku,
        name: dbItem.name,
        unit: dbItem.unit,
        stockBalances: dbItem.stockBalances.map(b => ({
          quantity: b.quantity,
          location: b.location ? { code: b.location.code } : null,
        })),
        stockMovements: dbItem.stockMovements.map(m => ({
          id: m.id,
          type: m.type,
          quantity: m.quantity,
          createdAt: m.createdAt,
          note: m.note,
          sourceLocation: m.sourceLocation ? { code: m.sourceLocation.code } : null,
          destinationLocation: m.destinationLocation ? { code: m.destinationLocation.code } : null,
        })),
      };
    }
  } catch {
    dbOnline = false;
    item = MOCK_ITEMS[id] || null;
  }

  if (!item) {
    notFound();
  }

  const totalStock = item.stockBalances.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className='flex flex-col gap-8 animate-in fade-in duration-300'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Link href='/items' className='p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 transition-all shadow-sm'>
          <ArrowLeft className='h-4 w-4' />
        </Link>
        <div>
          <span className='font-mono text-xs font-bold text-indigo-500 uppercase tracking-wider'>{item.sku}</span>
          <h1 className='text-3xl font-extrabold tracking-tight text-white mt-0.5'>{item.name}</h1>
        </div>
      </div>

      {!dbOnline && (
        <div className='flex items-start gap-3 p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-amber-800 dark:text-amber-400 shadow-sm animate-in fade-in duration-200'>
          <AlertCircle className='h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5' />
          <div className='flex flex-col gap-0.5'>
            <span className='font-bold text-sm'>Mode Demo (Database Offline)</span>
            <span className='text-xs text-amber-700/90 dark:text-amber-400/90 leading-relaxed'>Menampilkan detail barang simulasi lokal karena koneksi database tidak terdeteksi.</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Info & Peta */}
        <div className='lg:col-span-2 flex flex-col gap-8'>
          {/* Stock Balances */}
          <div className='bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-lg flex flex-col gap-4'>
            <h2 className='font-bold text-lg text-white flex items-center gap-2'><Boxes className='h-5 w-5 text-indigo-400' /> Saldo & Lokasi Penyimpanan</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>
              <div className='p-4.5 rounded-xl bg-zinc-850 border border-zinc-800 flex flex-col justify-between min-h-24'>
                <span className='text-xs font-semibold text-zinc-500 uppercase tracking-wider'>Total Seluruh Stok</span>
                <span className='text-3xl font-black text-white mt-2'>{totalStock} <span className='text-sm font-medium text-zinc-400'>{item.unit}</span></span>
              </div>
              <div className='p-4.5 rounded-xl bg-zinc-850 border border-zinc-800 flex flex-col gap-2'>
                <span className='text-xs font-semibold text-zinc-500 uppercase tracking-wider'>Distribusi per Rak</span>
                <div className='flex flex-col gap-1.5 mt-1 overflow-y-auto max-h-24'>
                  {item.stockBalances.map((bal, idx) => (
                    <div key={idx} className='flex items-center justify-between text-xs font-semibold'>
                      <span className='text-zinc-400'>Rak {bal.location?.code}</span>
                      <span className='text-white'>{bal.quantity} {item.unit}</span>
                    </div>
                  ))}
                  {item.stockBalances.length === 0 && (
                    <span className='text-xs text-zinc-500 italic'>Tidak ada stok tersedia</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Denah Gudang */}
          <div className='bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-lg flex flex-col gap-4'>
            <div className='flex items-center gap-2 border-b border-zinc-800 pb-3'>
              <MapPin className='h-4 w-4 text-indigo-500' />
              <span className='font-bold text-sm text-white'>Pinpoint Lokasi Barang</span>
            </div>
            <div className='relative w-full bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 shadow-sm' style={{ aspectRatio: '3 / 1.63' }}>
              <div className='absolute inset-0 grid grid-cols-3 grid-rows-4'>
                {Object.keys(RACK_COORDINATES).map((code) => {
                  const hasThisItem = item!.stockBalances.some(b => b.location?.code === code);
                  return (
                    <div key={code} className={'border border-zinc-650/20 flex items-center justify-center text-[10px] font-mono font-bold transition-all ' + (hasThisItem ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-600')}>
                      {code}
                    </div>
                  );
                })}
              </div>
              {item.stockBalances.map((bal, idx) => {
                if (!bal.location) return null;
                const coords = RACK_COORDINATES[bal.location.code];
                if (!coords) return null;
                return (
                  <div
                    key={idx}
                    className='absolute w-4 h-4 bg-indigo-500 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg animate-pulse z-10'
                    style={{ top: coords.y + '%', left: coords.x + '%' }}
                    title={'Rak ' + bal.location.code + ': ' + bal.quantity + ' ' + item!.unit}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Riwayat Mutasi */}
        <div className='bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-lg flex flex-col gap-5'>
          <h2 className='font-bold text-lg text-white flex items-center gap-2'><History className='h-5 w-5 text-indigo-400' /> Riwayat Mutasi</h2>
          <div className='flex flex-col gap-4.5 overflow-y-auto max-h-[420px] pr-1'>
            {item.stockMovements.map((move) => {
              const formattedDate = new Date(move.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
              });
              return (
                <div key={move.id} className='p-3.5 rounded-xl border border-zinc-800 bg-zinc-850 flex flex-col gap-2 hover:border-zinc-700 transition-all'>
                  <div className='flex items-center justify-between'>
                    <span className={'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ' + (
                      move.type === 'IN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      move.type === 'OUT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    )}>
                      {move.type}
                    </span>
                    <span className='text-[10px] text-zinc-500 font-bold'>{formattedDate}</span>
                  </div>
                  <div className='flex items-baseline justify-between'>
                    <span className='text-xs font-semibold text-zinc-400'>
                      {move.type === 'IN' ? 'Masuk ke ' + (move.destinationLocation?.code ?? '?') :
                       move.type === 'OUT' ? 'Keluar dari ' + (move.sourceLocation?.code ?? '?') :
                       'Pindah: ' + (move.sourceLocation?.code ?? '?') + ' -> ' + (move.destinationLocation?.code ?? '?')}
                    </span>
                    <span className='font-bold text-xs text-white'>
                      {move.type === 'IN' ? '+' : move.type === 'OUT' ? '-' : ''}{move.quantity} {item!.unit}
                    </span>
                  </div>
                  {move.note && (
                    <span className='text-[10px] text-zinc-500 bg-zinc-900/50 p-2 rounded-lg italic'>{move.note}</span>
                  )}
                </div>
              );
            })}
            {item.stockMovements.length === 0 && (
              <span className='text-xs text-zinc-500 italic text-center py-6'>Belum ada riwayat mutasi</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}