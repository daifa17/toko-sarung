'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [sarung, setSarung] = useState<any[]>([])
  const [merkAktif, setMerkAktif] = useState('Semua')
  const [hargaAktif, setHargaAktif] = useState('Semua')
  const [loading, setLoading] = useState(true)

  const nomorWA = "6285136527668"; // GANTI DENGAN NOMOR WA-MU

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('sarung').select('*').order('id', { ascending: false })
      if (data) setSarung(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  // 1. Ambil daftar Merk unik dari database secara otomatis
  const daftarMerk = ['Semua', ...Array.from(new Set(sarung.map(s => s.kategori).filter(Boolean)))]
  
  // 2. Opsi Filter Harga
  const daftarHarga = [
    { label: 'Semua Harga', value: 'Semua' },
    { label: 'Di bawah Rp 100 Ribu', value: '<100k' },
    { label: 'Rp 100 Ribu - Rp 300 Ribu', value: '100k-300k' },
    { label: 'Di atas Rp 300 Ribu', value: '>300k' }
  ]

  // 3. Logika Filter Ganda (Merk + Harga)
  let produkTampil = sarung;
  
  if (merkAktif !== 'Semua') {
    produkTampil = produkTampil.filter(s => s.kategori === merkAktif)
  }
  
  if (hargaAktif === '<100k') {
    produkTampil = produkTampil.filter(s => s.harga < 100000)
  } else if (hargaAktif === '100k-300k') {
    produkTampil = produkTampil.filter(s => s.harga >= 100000 && s.harga <= 300000)
  } else if (hargaAktif === '>300k') {
    produkTampil = produkTampil.filter(s => s.harga > 300000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <main className="bg-gray-50 min-h-screen text-slate-800 font-sans pb-20">
      
      {/* HEADER & HERO SECTION */}
      <header className="bg-emerald-900 text-white rounded-b-[3rem] shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 relative z-10">
          <div className="flex justify-between items-center mb-16">
            <h1 className="text-3xl font-black tracking-tight">Sarungku<span className="text-emerald-400">.</span></h1>
            <a href="/admin" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm transition">Masuk Admin &rarr;</a>
          </div>
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">Temukan Sarung Terbaik Untukmu.</h2>
            <p className="text-emerald-100 text-lg md:text-xl opacity-90">Koleksi terlengkap dari berbagai merk ternama dengan harga bersahabat. Langsung pesan via WhatsApp.</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        
        {/* KOTAK FILTER */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-10 flex flex-col md:flex-row gap-6 justify-between items-center">
          
          {/* Filter Merk */}
          <div className="w-full md:w-auto">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pilih Merk</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {daftarMerk.map(merk => (
                <button 
                  key={merk as string} onClick={() => setMerkAktif(merk as string)}
                  className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition ${
                    merkAktif === merk ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {merk as string}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Harga */}
          <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Rentang Harga</p>
             <select 
               value={hargaAktif} 
               onChange={(e) => setHargaAktif(e.target.value)}
               className="w-full bg-gray-100 border-none px-4 py-3 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
             >
               {daftarHarga.map(harga => (
                 <option key={harga.value} value={harga.value}>{harga.label}</option>
               ))}
             </select>
          </div>
        </div>

        {/* DAFTAR PRODUK GRID */}
        {produkTampil.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-5xl mb-4">🥲</p>
            <h3 className="text-xl font-bold text-gray-700">Sarung tidak ditemukan</h3>
            <p className="text-gray-500 mt-2">Coba ganti filter merk atau harga yang lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {produkTampil.map((item) => {
              const stokHabis = item.stok === null || item.stok <= 0;
              const linkWA = `https://wa.me/${nomorWA}?text=${encodeURIComponent(`Halo, saya mau beli ${item.nama} (Merk: ${item.kategori}) harga Rp ${item.harga.toLocaleString('id-ID')}. Apakah stoknya masih ada?`)}`;

              return (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition group flex flex-col">
                  
                  {/* Bagian Gambar */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img 
                      src={item.gambar_url || 'https://via.placeholder.com/400x400'} 
                      alt={item.nama} 
                      className={`w-full h-full object-cover transition duration-500 group-hover:scale-110 ${stokHabis ? 'grayscale opacity-50' : ''}`} 
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {item.kategori}
                    </div>
                    {stokHabis && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white font-black px-4 py-2 rounded-xl rotate-12 text-sm md:text-lg border-2 border-white shadow-xl">HABIS</span>
                      </div>
                    )}
                  </div>

                  {/* Bagian Info */}
                  <div className="p-4 md:p-5 flex flex-col flex-grow">
                    <h2 className="text-sm md:text-base font-bold text-gray-800 mb-1 line-clamp-2 leading-tight">{item.nama}</h2>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-grow">{item.deskripsi}</p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-3">
                        <p className="text-lg md:text-xl font-black text-emerald-600">Rp {item.harga.toLocaleString('id-ID')}</p>
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Stok: {item.stok}</p>
                      </div>
                      
                      {stokHabis ? (
                        <button disabled className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl text-sm font-bold cursor-not-allowed border border-gray-200">
                          Stok Kosong
                        </button>
                      ) : (
                        <a href={linkWA} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-slate-800 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition shadow-md">
                          Beli via WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}