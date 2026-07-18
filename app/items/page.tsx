export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Boxes, Search, PlusCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type StockBal = { quantity: number; location: { code: string } | null };
type ItemRow = { id: number; sku: string; name: string; unit: string; stockBalances: StockBal[] };

const MOCK: ItemRow[] = [
  { id: 1, sku: 'KRS-A12', name: 'Kursi Kantor Ergonomis', unit: 'pcs', stockBalances: [{ quantity: 25, location: { code: 'A-02' } }, { quantity: 12, location: { code: 'B-01' } }] },
  { id: 2, sku: 'MJA-B04', name: 'Meja Lipat Kayu', unit: 'pcs', stockBalances: [{ quantity: 15, location: { code: 'B-04' } }] },
  { id: 3, sku: 'LMP-C01', name: 'Lampu LED Phillips', unit: 'box', stockBalances: [{ quantity: 80, location: { code: 'C-01' } }] },
];

export default async function ItemsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q ?? '';
  let items: ItemRow[] = [];
  let dbOnline = true;
  try {
    items = await prisma.item.findMany({
      where: query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { sku: { contains: query, mode: 'insensitive' } }] } : undefined,
      include: { stockBalances: { include: { location: true } } },
      orderBy: { createdAt: 'desc' },
    }) as ItemRow[];
  } catch {
    dbOnline = false;
    const q = query.toLowerCase();
    items = MOCK.filter(i => !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
  }
  return (
    <div className='flex flex-col gap-8 animate-in fade-in duration-300'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div><h1 className='text-3xl font-bold tracking-tight text-white'>Daftar Barang</h1><p className='text-zinc-500 text-sm mt-1'>Mengelola master barang dan stok real-time</p></div>
        <Link href='/items/new' className='px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm hover:shadow-md transition-all'>
          <PlusCircle className='h-4 w-4' />Barang Masuk
        </Link>
      </div>

      {!dbOnline && (
        <div className='flex items-start gap-3 p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-amber-800 dark:text-amber-400 shadow-sm animate-in fade-in duration-200'>
          <AlertCircle className='h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5' />
          <div className='flex flex-col gap-0.5'>
            <span className='font-bold text-sm'>Mode Demo (Database Offline)</span>
            <span className='text-xs text-amber-700/90 dark:text-amber-400/90 leading-relaxed'>Koneksi database tidak terdeteksi. Sistem secara otomatis menggunakan mock data lokal agar Anda tetap dapat melakukan pengujian fitur.</span>
          </div>
        </div>
      )}

      <form method='GET' className='relative max-w-md w-full'>
        <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400' />
        <input type='text' name='q' defaultValue={query} placeholder='Cari SKU atau nama barang...' className='w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-white' />
      </form>

      {items.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 gap-3 shadow-sm'>
          <Boxes className='h-12 w-12 text-zinc-300' /><span className='font-medium text-sm'>Barang tidak ditemukan</span>
        </div>
      ) : (
        <div className='bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='bg-zinc-950/50 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                  <th className='px-6 py-4'>SKU</th><th className='px-6 py-4'>Nama Barang</th><th className='px-6 py-4'>Lokasi & Stok</th><th className='px-6 py-4 text-right'>Total</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-zinc-800 text-sm text-zinc-300'>
                {items.map((item) => {
                  const total = item.stockBalances?.reduce((s, b) => s + b.quantity, 0) ?? 0;
                  return (
                    <tr key={item.id} className='hover:bg-zinc-800/30 transition-colors'>
                      <td className='px-6 py-4 font-mono text-xs font-bold text-indigo-400'>
                        <Link href={'/items/' + item.id} className='hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded px-1' aria-label={'Detail barang ' + item.sku}>
                          {item.sku}
                        </Link>
                      </td>
                      <td className='px-6 py-4 font-bold text-white'>
                        <Link href={'/items/' + item.id} className='hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded px-1'>
                          {item.name}
                        </Link>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-wrap gap-1.5'>
                          {item.stockBalances?.map((b, i) => (
                            <span key={i} className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/50'>
                              Rak {b.location?.code ?? '?'} <span className='font-bold text-white'>({b.quantity})</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-right font-bold text-white'>{total} <span className='text-xs font-medium text-zinc-500'>{item.unit}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
