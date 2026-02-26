import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function login(formData: FormData) {
  'use server'
  if (formData.get('password') === 'bos_sarung_123') {
    (await cookies()).set('admin_login', 'sukses', { httpOnly: true })
  }
  revalidatePath('/admin')
}

async function logout() {
  'use server'
  ;(await cookies()).delete('admin_login')
  redirect('/admin')
}

async function tambahSarung(formData: FormData) {
  'use server'
  const nama = formData.get('nama') as string
  const kategori = formData.get('kategori') as string
  const deskripsi = formData.get('deskripsi') as string
  const harga = Number(formData.get('harga'))
  const stok = Number(formData.get('stok'))
  const file = formData.get('gambar') as File

  let gambar_url = ''
  if (file && file.size > 0) {
    const namaFile = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { error } = await supabase.storage.from('gambar_produk').upload(namaFile, file)
    if (!error) {
      gambar_url = supabase.storage.from('gambar_produk').getPublicUrl(namaFile).data.publicUrl
    }
  }

  await supabase.from('sarung').insert([{ nama, kategori, deskripsi, harga, stok, gambar_url }])
  revalidatePath('/')
  redirect('/admin?pesan=tambah')
}

async function updateData(formData: FormData) {
  'use server'
  await supabase.from('sarung')
    .update({ stok: Number(formData.get('stok')), harga: Number(formData.get('harga')) })
    .eq('id', formData.get('id') as string)
  revalidatePath('/')
  redirect('/admin?pesan=update')
}

async function hapusSarung(formData: FormData) {
  'use server'
  await supabase.from('sarung').delete().eq('id', formData.get('id') as string)
  revalidatePath('/')
  redirect('/admin?pesan=hapus')
}

export default async function AdminPage(props: any) {
  const searchParams = await props.searchParams;
  const pesan = searchParams?.pesan;

  const cookieStore = await cookies()
  if (cookieStore.get('admin_login')?.value !== 'sukses') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-sm text-center border border-slate-100">
          <h1 className="text-3xl font-extrabold mb-2 text-slate-800">Admin Area</h1>
          <form action={login} className="flex flex-col gap-4 mt-8">
            <input type="password" name="password" placeholder="Masukkan Kata Sandi..." required className="border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none transition" />
            <button type="submit" className="w-full bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition">Masuk Panel</button>
          </form>
        </div>
      </div>
    )
  }

  const { data: sarung } = await supabase.from('sarung').select('*').order('id', { ascending: false })

  return (
    <main className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-20 relative">
      
      {/* ===== MODAL VERIFIKASI (TAMPIL DI TENGAH LAYAR) ===== */}
      {pesan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-slate-100">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${pesan === 'hapus' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {pesan === 'hapus' ? '🗑️' : '✅'}
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Verifikasi Sukses!</h3>
            <p className="text-slate-600 mb-6 font-medium">
              {pesan === 'tambah' && 'Produk baru telah berhasil ditambahkan ke katalog.'}
              {pesan === 'update' && 'Harga dan stok produk berhasil diperbarui.'}
              {pesan === 'hapus' && 'Produk tersebut telah dihapus dari sistem.'}
            </p>
            <a href="/admin" className="block w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold transition">
              Tutup & Lanjutkan
            </a>
          </div>
        </div>
      )}
      {/* =========================================== */}

      <nav className="bg-white border-b px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl md:text-2xl font-black text-slate-800">Sarungku <span className="text-emerald-600">Admin</span></h1>
        <div className="flex gap-2 md:gap-4 items-center">
          <a href="/" className="text-sm md:text-base text-slate-500 hover:text-emerald-600 font-medium py-2">Lihat Web</a>
          <form action={logout}>
            <button type="submit" className="bg-red-50 text-red-600 px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-bold hover:bg-red-100 transition">Logout</button>
          </form>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 p-4 lg:p-8">
        
        {/* FORM TAMBAH */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border shadow-sm h-fit lg:sticky lg:top-24">
          <h2 className="text-lg md:text-xl font-bold mb-4 border-b pb-4">Tambah Produk Baru</h2>
          <form action={tambahSarung} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Nama Produk</label>
              <input type="text" name="nama" placeholder="Cth: Sarung Wadimor Hitam" required className="w-full border p-2.5 rounded-lg mt-1 bg-slate-50" />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-slate-700">Merk / Kategori</label>
              <select name="kategori" required className="w-full border p-2.5 rounded-lg mt-1 bg-slate-50 cursor-pointer">
                <option value="">-- Pilih Merk Sarung --</option>
                <option value="Wadimor">Wadimor</option>
                <option value="BHS">BHS</option>
                <option value="Atlas">Atlas</option>
                <option value="Gajah Duduk">Gajah Duduk</option>
                <option value="Sapphire">Sapphire</option>
                <option value="Mangga">Mangga</option>
                <option value="Umum">Umum / Lain-lain</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700">Harga (Rp)</label>
                <input type="number" name="harga" placeholder="0" required className="w-full border p-2.5 rounded-lg mt-1 bg-slate-50" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Stok</label>
                <input type="number" name="stok" placeholder="0" required className="w-full border p-2.5 rounded-lg mt-1 bg-slate-50" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Deskripsi Singkat</label>
              <textarea name="deskripsi" required className="w-full border p-2.5 rounded-lg mt-1 bg-slate-50" rows={3}></textarea>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Foto Produk</label>
              <input type="file" name="gambar" accept="image/*" required className="w-full border p-2 rounded-lg mt-1 text-sm bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700" />
            </div>
            <button type="submit" className="bg-emerald-600 text-white font-bold py-3 mt-4 rounded-xl hover:bg-emerald-700 transition">Simpan Katalog</button>
          </form>
        </div>

        {/* LIST PRODUK (CRUD) */}
        <div className="lg:col-span-2">
          <h2 className="text-lg md:text-xl font-bold mb-4 lg:mb-6">Daftar Produk ({sarung?.length})</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {sarung?.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col gap-3">
                <div className="flex gap-4">
                  <img src={item.gambar_url || 'https://via.placeholder.com/150'} alt={item.nama} className="w-20 h-20 object-cover rounded-xl border" />
                  <div>
                    <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight">{item.nama}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-1 rounded-md mt-1 inline-block">{item.kategori}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                  <form action={updateData} className="flex gap-2 items-end">
                    <input type="hidden" name="id" value={item.id} />
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Stok</label>
                      <input type="number" name="stok" defaultValue={item.stok} className="w-full border p-1.5 text-sm rounded-md bg-white" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Harga (Rp)</label>
                      <input type="number" name="harga" defaultValue={item.harga} className="w-full border p-1.5 text-sm rounded-md bg-white" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-bold hover:bg-blue-700 transition">Simpan</button>
                  </form>
                </div>

                <form action={hapusSarung} className="mt-auto">
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="w-full text-red-500 bg-red-50 hover:bg-red-100 py-2 rounded-xl text-sm font-bold transition mt-2">Hapus Produk</button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}