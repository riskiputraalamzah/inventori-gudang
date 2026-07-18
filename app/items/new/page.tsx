"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveItemMutasi } from "@/app/actions/inventory";
import { generateNextSku, getActiveCategories, getActiveLocations } from "@/app/actions/sku";
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  MapPin,
  AlertCircle,
  ArrowRightLeft,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import Link from "next/link";
import { warehouseRacks } from "@/lib/warehouse";
export default function NewItemPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"IN" | "OUT" | "TRANSFER">("IN");
  const [error, setError] = useState<string | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [selectedDestLoc, setSelectedDestLoc] = useState<string | null>(null);
  const [pickingTarget, setPickingTarget] = useState<"source" | "dest">(
    "source",
  );
  const [skuMode, setSkuMode] = useState<"auto" | "manual">("auto");
  const [categories, setCategories] = useState<Array<{ code: string; name: string }>>([]);
  const [locations, setLocations] = useState<
    Array<{ code: string; name: string; xPercent: number | null; yPercent: number | null; isActive: boolean }>
  >([]);
  const [category, setCategory] = useState<string>("");
  const [generatedSku, setGeneratedSku] = useState("");
  const [isLoadingSku, setIsLoadingSku] = useState(false);

  useEffect(() => {
    getActiveCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) {
        setCategory(cats[0].code);
      }
    });
    getActiveLocations().then(setLocations);
  }, []);

  useEffect(() => {
    if (skuMode === "auto" && activeTab === "IN" && category) {
      let active = true;
      const fetchSku = async () => {
        setIsLoadingSku(true);
        try {
          const nextSku = await generateNextSku(category);
          if (active) {
            setGeneratedSku(nextSku);
          }
        } catch {
          if (active) {
            setGeneratedSku(`${category}-001`);
          }
        } finally {
          if (active) {
            setIsLoadingSku(false);
          }
        }
      };
      fetchSku();
      return () => {
        active = false;
      };
    }
  }, [category, skuMode, activeTab]);

  const handleRackClick = (code: string) => {
    // Cek apakah rak dinonaktifkan di database
    const dbLoc = locations.find((l) => l.code === code);
    if (dbLoc && dbLoc.isActive === false) {
      return; // rak tidak aktif tidak dapat dipilih
    }

    if (activeTab === "TRANSFER") {
      if (pickingTarget === "source") {
        setSelectedLoc(code);
        setPickingTarget("dest");
      } else {
        setSelectedDestLoc(code);
        setPickingTarget("source");
      }
    } else {
      setSelectedLoc(code);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!selectedLoc) {
      setError("Tentukan lokasi asal / rak penyimpanan terlebih dahulu.");
      return;
    }
    if (activeTab === "TRANSFER" && !selectedDestLoc) {
      setError("Tentukan lokasi tujuan pemindahan barang.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.set("type", activeTab);
    formData.set("location", selectedLoc);
    if (activeTab === "TRANSFER" && selectedDestLoc) {
      formData.set("destLocation", selectedDestLoc);
    }
    startTransition(async () => {
      const res = await saveItemMutasi(formData);
      if (res.success) router.push("/");
      else setError(res.error ?? "Terjadi kesalahan sistem");
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 transition-all shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Transaksi Mutasi Gudang
          </h1>
          <p className="text-xs text-zinc-500">
            Pencatatan barang masuk, keluar, atau pindah rak secara real-time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 p-1 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/80 max-w-md w-full shadow-inner">
        <button
          type="button"
          onClick={() => {
            setActiveTab("IN");
            setError(null);
          }}
          className={
            "py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 " +
            (activeTab === "IN"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
              : "text-zinc-500 hover:text-zinc-850")
          }
        >
          <ArrowDown className="h-3.5 w-3.5" /> Barang Masuk
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("OUT");
            setError(null);
          }}
          className={
            "py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 " +
            (activeTab === "OUT"
              ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md"
              : "text-zinc-500 hover:text-zinc-850")
          }
        >
          <ArrowUp className="h-3.5 w-3.5" /> Barang Keluar
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("TRANSFER");
            setError(null);
          }}
          className={
            "py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 " +
            (activeTab === "TRANSFER"
              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md"
              : "text-zinc-500 hover:text-zinc-850")
          }
        >
          <ArrowRightLeft className="h-3.5 w-3.5" /> Pindah Rak
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-800 dark:text-rose-400 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-sm">Kesalahan Transaksi</span>
            <span className="text-xs leading-relaxed">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5 shadow-sm"
        >
          <div
            className={
              "flex items-center gap-2 font-semibold text-sm border-b border-zinc-100 pb-3 " +
              (activeTab === "IN"
                ? "text-emerald-600"
                : activeTab === "OUT"
                  ? "text-rose-600"
                  : "text-indigo-600")
            }
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {activeTab === "IN"
                ? "Informasi Barang Masuk"
                : activeTab === "OUT"
                  ? "Informasi Barang Keluar"
                  : "Informasi Pemindahan Rak"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeTab === "IN" ? (
              <>
                <div className="sm:col-span-2 flex items-center gap-4 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="skuModeToggle"
                      value="auto"
                      checked={skuMode === "auto"}
                      onChange={() => setSkuMode("auto")}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      SKU Otomatis (Recommended)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="skuModeToggle"
                      value="manual"
                      checked={skuMode === "manual"}
                      onChange={() => setSkuMode("manual")}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      Input Manual
                    </span>
                  </label>
                </div>

                {skuMode === "auto" ? (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="category" className="text-xs font-semibold text-zinc-500">
                        Kategori Barang
                      </label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        disabled={isPending}
                      >
                        {categories.map((cat) => (
                          <option key={cat.code} value={cat.code} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                            {cat.code} - {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="sku" className="text-xs font-semibold text-zinc-500">
                        SKU / Kode Barang
                      </label>
                      <input
                        type="text"
                        id="sku"
                        name="sku"
                        value={generatedSku}
                        onChange={(e) => setGeneratedSku(e.target.value)}
                        placeholder={isLoadingSku ? "Generating..." : "KRS-001"}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                        required
                        disabled={isPending || isLoadingSku}
                      />
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label htmlFor="sku" className="text-xs font-semibold text-zinc-500">
                      SKU / Kode Barang
                    </label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      placeholder="Contoh: KRS-A12 atau CUSTOM-001"
                      className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                      required
                      disabled={isPending}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sku" className="text-xs font-semibold text-zinc-500">
                  SKU / Kode Barang
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  required
                  placeholder="KRS-A12"
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  disabled={isPending}
                />
              </div>
            )}

            {activeTab === "IN" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-semibold text-zinc-500"
                >
                  Nama Barang
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Kursi Kantor Ergonomis"
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="qty"
                className="text-xs font-semibold text-zinc-500"
              >
                Jumlah Mutasi
              </label>
              <input
                type="number"
                id="qty"
                name="qty"
                required
                min="1"
                defaultValue="1"
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            {activeTab === "IN" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="unit"
                  className="text-xs font-semibold text-zinc-500"
                >
                  Satuan
                </label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  required
                  placeholder="pcs / box"
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="note"
              className="text-xs font-semibold text-zinc-500"
            >
              Catatan Transaksi (Opsional)
            </label>
            <textarea
              id="note"
              name="note"
              rows={2}
              placeholder="Isi alasan / detail mutasi..."
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            {activeTab !== "TRANSFER" ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500">
                  {activeTab === "IN"
                    ? "Lokasi Penyimpanan"
                    : "Lokasi Asal Barang"}
                </label>
                <div className="px-4 py-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-sm bg-zinc-50 dark:bg-zinc-900 shadow-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {selectedLoc
                      ? "Rak " + selectedLoc
                      : "Pilih di denah sebelah kanan"}
                  </span>
                  {selectedLoc && (
                    <MapPin className="h-4 w-4 text-indigo-500" />
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPickingTarget("source")}
                  aria-pressed={pickingTarget === "source"}
                  className={
                    "flex flex-col gap-1.5 cursor-pointer p-3 rounded-xl border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 " +
                    (pickingTarget === "source"
                      ? "border-rose-500 bg-rose-50/10"
                      : "border-zinc-200 dark:border-zinc-800")
                  }
                >
                  <span className="text-[10px] font-semibold text-zinc-500">
                    1. Rak Asal
                  </span>
                  <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                    {selectedLoc ? "Rak " + selectedLoc : "Pilih rak asal"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPickingTarget("dest")}
                  aria-pressed={pickingTarget === "dest"}
                  className={
                    "flex flex-col gap-1.5 cursor-pointer p-3 rounded-xl border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 " +
                    (pickingTarget === "dest"
                      ? "border-emerald-500 bg-emerald-50/10"
                      : "border-zinc-200 dark:border-zinc-800")
                  }
                >
                  <span className="text-[10px] font-semibold text-zinc-500">
                    2. Rak Tujuan
                  </span>
                  <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                    {selectedDestLoc
                      ? "Rak " + selectedDestLoc
                      : "Pilih rak tujuan"}
                  </span>
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={
              "w-full py-3 text-white rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 " +
              (activeTab === "IN"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/10"
                : activeTab === "OUT"
                  ? "bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-rose-500/10"
                  : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-indigo-500/10")
            }
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Simpan Transaksi
              </>
            )}
          </button>
        </form>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <MapPin className="h-4 w-4 text-indigo-500" />
              <span>Peta Gudang</span>
            </div>
            {activeTab === "TRANSFER" && (
              <span className="text-xs text-black font-bold px-2 py-0.5 bg-indigo-50 rounded-full">
                {pickingTarget === "source"
                  ? "Pilih Asal (Merah)"
                  : "Pilih Tujuan (Hijau)"}
              </span>
            )}
          </div>
          <div
            className="relative w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-pointer select-none"
            style={{ aspectRatio: "3 / 1.63" }}
          >
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-4">
              {warehouseRacks.map((rack) => {
                const isSource = selectedLoc === rack.code;
                const isDest = selectedDestLoc === rack.code;
                const dbLoc = locations.find((l) => l.code === rack.code);
                const isInactive = dbLoc ? dbLoc.isActive === false : false;

                return (
                  <button
                    key={rack.code}
                    type="button"
                    onClick={() => !isInactive && handleRackClick(rack.code)}
                    aria-label={
                      activeTab === "TRANSFER"
                        ? `Pilih Rak ${rack.code} sebagai ${pickingTarget === "source" ? "asal" : "tujuan"}`
                        : `Pilih Rak ${rack.code}`
                    }
                    disabled={isInactive}
                    className={
                      "border border-zinc-300/30 dark:border-zinc-650/30 flex items-center justify-center text-[10px] font-mono font-bold transition-all cursor-pointer focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-inset " +
                      (isInactive
                        ? "bg-zinc-200/50 dark:bg-zinc-900/50 text-zinc-400/30 dark:text-zinc-700 cursor-not-allowed"
                        : isSource
                          ? "bg-rose-600 text-white"
                          : isDest
                            ? "bg-emerald-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-950/20")
                    }
                  >
                    {rack.code}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
            {activeTab === "TRANSFER"
              ? "Klik rak untuk menetapkan rak asal (merah) dan rak tujuan (hijau)"
              : "Klik pada rak untuk menentukan lokasi penyimpanan"}
          </p>
        </div>
      </div>
    </div>
  );
}
