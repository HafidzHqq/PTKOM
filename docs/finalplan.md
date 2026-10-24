# 🍲 KulinerKost: Rencana Produk & Eksekusi v2

> **Versi:** 2.0 (revisi dari Plan.md v1)
> **Status dokumen:** Rencana + pelacak status (satu sumber kebenaran)
> **Positioning:** Asisten kuliner anak kost: **enak, hemat, cerdas**. *Food-first, nutrition-second.*

**Legenda status:** ✅ Selesai (terverifikasi) · 🟡 Diklaim selesai di v1, **perlu verifikasi** · 🔧 Sedang dikerjakan · ⬜ Belum dimulai

---

## 0. Ringkasan Eksekutif

| Item | Isi |
| :--- | :--- |
| **Masalah** | Aplikasi terasa seperti aplikasi medis: tabel gram gizi, peringatan defisiensi, bahasa kaku. Anak kost tidak termotivasi memakainya. |
| **Solusi** | Pengalaman berpusat pada makanan: foto, rasa, harga, dan porsi realistis. Gizi menjadi pendamping ringkas. |
| **Pengguna utama** | Mahasiswa/anak kost, budget makan Rp15.000–Rp35.000/hari-makan, akses lewat HP dengan jaringan tidak selalu cepat. |
| **Pembeda** | (1) Rakit Piring Warteg, (2) AI Food Reviewer pada scan foto, (3) Resep Rice Cooker, (4) Diari Kuliner. |
| **Fokus v2** | Menutup celah **konten/data**, **validasi pengguna**, **aksesibilitas**, **akurasi AI**, dan **kepatuhan disclaimer**. Sebagian besar UI sudah ada. |

---

## 1. Prinsip Desain (Aturan Keputusan)

1. **Makanan dulu, angka kemudian.** Pada setiap kartu: foto → nama & harga → tag rasa → ringkasan gizi. Blok gizi tidak boleh lebih besar dari foto atau deskripsi.
2. **Harga selalu berlabel "perkiraan".** Tidak ada angka harga tanpa konteks (kota/rentang).
3. **Tidak pernah menghakimi.** Hindari kata "kurang", "buruk", "defisiensi" sebagai judul. Pakai framing saran: *"Tambah lauk X biar makin mantap"*.
4. **Aman secara hukum, ramah secara bahasa.** Disclaimer dilunakkan, bukan dihapus (lihat §7).
5. **Mobile-first, hemat kuota.** Semua keputusan UI diuji di layar 360px dan jaringan 3G lambat.
6. **Satu istilah per konsep.** Lihat glosarium di §9.

---

## 2. Baseline: Status Saat Ini

Semua item di bawah diklaim selesai pada v1. Karena v1 tidak memuat bukti, **Fase 0** (verifikasi) wajib dilakukan sebelum fase baru.

| ID | Item | Lokasi | Status |
| :--- | :--- | :--- | :---: |
| B1 | Penamaan menu: Scan Makanan, Jelajah Menu, Diari Kuliner, Profil & Porsi | `components/navbar.tsx` | 🟡 |
| B2 | Landing page dengan tagline & CTA baru | `src/app/page.tsx` | 🟡 |
| B3 | Banner medis dilunakkan | komponen banner/footer | 🟡 |
| B4 | Palet hangat amber/orange | `tailwind.config` / `globals.css` | 🟡 |
| B5 | Kartu kuliner + badge rasa | `food-recommendations.tsx`, `analyze/page.tsx` | 🟡 |
| B6 | Rakit Piring Warteg | `components/warteg-plate-builder.tsx` | 🟡 |
| B7 | AI Food Reviewer (`culinary_review`, `culinary_tips`, `flavor_tags`) | `src/lib/ai/prompts.ts`, `/api/analyze-food` | 🟡 |
| B8 | Resep Rice Cooker | `components/rice-cooker-hacks.tsx` | 🟡 |
| B9 | Diari Kuliner | `/history`, `nutrition-history.tsx` | 🟡 |
| B10 | **Foto nyata + tag rasa di database lokal (P4 v1)** | `src/lib/data/localFoods.ts` | ⬜ (tidak ada di checklist v1) |

---

## 3. Roadmap

### Fase 0: Verifikasi & Baseline (Minggu 1)
*Tujuan: memastikan klaim v1 benar dan memasang alat ukur sebelum mengubah apa pun.*

- [ ] **0.1 Audit checklist v1.** Jalankan aplikasi, centang B1–B9 satu per satu dengan tangkapan layar di `docs/audit/`. Item yang gagal dipindah ke Fase 1.
- [ ] **0.2 Pasang analitik.** Event minimum (nama event → kapan dikirim):
  - `landing_view`, `cta_explore_click`, `cta_budget_click`
  - `food_card_view`, `plate_builder_start`, `plate_builder_save_diary`
  - `scan_start`, `scan_success`, `scan_correction` (pengguna mengoreksi hasil AI)
  - `diary_entry_added`, `recipe_copy_shopping_list`
- [ ] **0.3 Ukur performa baseline.** Lighthouse mobile (profil "Slow 4G") untuk `/`, `/recommendations`, `/analyze`, `/history`. Simpan skor di `docs/audit/baseline.md`.
- [ ] **0.4 Uji "5 detik" baseline.** Tunjukkan landing page ke 5 anak kost, tanya: *"Aplikasi ini untuk apa?"* Catat jawaban.

**Selesai jika:** `docs/audit/` berisi tangkapan layar, skor Lighthouse, dan hasil uji 5 detik.

---

### Fase 1: Fondasi Data Kuliner (Minggu 2–3) 🔥 Prioritas tertinggi
*Alasan: UI sebagus apa pun terasa kosong tanpa data menu yang kaya. Ini menutup P4 v1 yang menggantung.*

#### 1.1 Skema data makanan (`src/lib/data/localFoods.ts`)

```ts
type FoodItem = {
  id: string;                    // "ayam-goreng-warteg"
  name: string;                  // "Ayam Goreng Warteg"
  category: "karbo" | "lauk-hewani" | "lauk-nabati" | "sayur" | "pelengkap" | "minuman" | "paket";
  venue: "warteg" | "warmindo" | "angkringan" | "kantin" | "rice-cooker";
  flavorTags: FlavorTag[];       // maks 3
  portion: { label: string; grams: number };   // "1 potong sedang", 80
  priceRange: { min: number; max: number; unit: "IDR" };  // estimasi nasional
  nutrition: { kcal: number; protein: number; carbs: number; fat: number; fiber?: number };
  image?: { src: string; alt: string; credit: string; license: string };
  pairWith?: string[];           // id makanan pelengkap
  source: "manual" | "tkpi" | "ai-estimate";
  updatedAt: string;             // ISO date
};

type FlavorTag = "pedas-gurih" | "berkuah-segar" | "gurih-renyah" | "wangi-rempah" | "manis-legit" | "asam-segar";
```

- [ ] **1.1a** Terapkan skema di atas dan tulis validator (zod) agar data cacat gagal saat build.
- [ ] **1.1b** Tambahkan field `source`. Data gizi diprioritaskan dari **TKPI (Tabel Komposisi Pangan Indonesia, Kemenkes)**; entri tanpa sumber ditandai `ai-estimate`.

#### 1.2 Cakupan konten minimum

| Kategori | Jumlah minimum | Contoh |
| :--- | :---: | :--- |
| Karbo | 6 | nasi putih, nasi uduk, mie instan, lontong, bihun, nasi kuning |
| Lauk hewani | 15 | ayam goreng, telur dadar, telur balado, ikan lele, tongkol, sate usus |
| Lauk nabati | 8 | tempe orek, tahu bacem, perkedel, sambal goreng tempe |
| Sayur | 8 | orek tauge, sayur asem, tumis kangkung, capcay, urap |
| Pelengkap | 6 | sambal, kerupuk, rempeyek, lalapan |
| Minuman | 5 | es teh, teh tawar, es jeruk, kopi hitam, susu jahe |
| Paket jadi (Warteg/Warmindo/Angkringan) | 12 | nasi + telur + orek tempe, Indomie telur + nasi, sega kucing 3 bungkus |
| **Total** | **≥ 60 item** | |

- [ ] **1.2a** Isi 60 item pertama dengan data gizi, rentang harga, dan 2–3 tag rasa.
- [ ] **1.2b** Tulis `pairWith` untuk minimal 30 item (dasar rekomendasi lauk pelengkap).

#### 1.3 Foto makanan
- [ ] **1.3a** Sumber foto: **foto sendiri/kontributor tim** atau stok berlisensi bebas (CC0/Unsplash/Pexels). **Dilarang** mengambil foto dari Google, restoran, atau media sosial tanpa izin.
- [ ] **1.3b** Format: WebP/AVIF, rasio 4:3, lebar 640px dan 320px (`srcset`), **maks 60 KB** untuk versi 640px.
- [ ] **1.3c** Wajib `alt` deskriptif dan `credit`/`license` per foto. Fallback: ilustrasi/emoji bila foto belum ada.
- [ ] **1.3d** Gunakan `next/image` dengan `loading="lazy"` dan blur placeholder.

#### 1.4 Harga
- [ ] **1.4a** Fase awal: harga = **rentang estimasi nasional** (misalnya telur dadar Rp3.000–Rp6.000), selalu berlabel *"perkiraan"*.
- [ ] **1.4b** Tambahkan pengaturan **kota/wilayah** di Profil (mulai dari: Bandar Lampung, Jakarta, Bandung, Yogyakarta, Surabaya, Malang) dengan pengali penyesuaian sederhana per kota.
- [ ] **1.4c** *(Opsional, Fase 5)* Pengguna dapat mengirim koreksi harga ("Di tempatku Rp7.000").

**Selesai jika:** ≥ 60 item lolos validator, ≥ 40 punya foto, semua punya tag rasa dan rentang harga.

---

### Fase 2: Branding, Palet & Aksesibilitas (Minggu 3–4)
*Memperbaiki B1–B5 dengan standar yang bisa diuji.*

#### 2.1 Token warna (cek kontras WCAG AA: teks normal ≥ 4.5:1, teks besar ≥ 3:1)

| Token | Hex | Penggunaan | Catatan kontras |
| :--- | :--- | :--- | :--- |
| `--amber-400` | `#fbbf24` | Latar badge, highlight | Pakai **teks gelap**, jangan putih |
| `--amber-500` | `#f59e0b` | Aksen, ikon, border | Teks putih di atasnya **gagal AA** |
| `--orange-700` | `#c2410c` | **Tombol CTA utama** (teks putih) | ≈ 5:1, lolos AA |
| `--terracotta-600` | `#b8512f` | Judul bagian, aksen sekunder | Verifikasi dengan alat kontras sebelum dipakai |
| `--cream-50` | `#fffbf5` | Latar halaman (mode terang) | |
| `--cocoa-900` | `#2b1d14` | Teks utama | Kontras tinggi di atas cream |
| `--chili-600` | `#dc2626` | Label pedas, error | |
| `--leaf-600` | `#16a34a` | Sayur/segar, sukses | |

- [ ] **2.1a** Definisikan token di CSS variables/Tailwind theme; hapus warna ungu/abu-abu hardcoded.
- [ ] **2.1b** Definisikan **versi dark mode** tiap token (latar `#1c1410`, teks `#f5ebe0`) dan uji ulang kontras.
- [ ] **2.1c** Jalankan audit kontras otomatis (axe/Lighthouse) tanpa pelanggaran "color-contrast".

#### 2.2 Copywriting (final)
- [ ] **2.2a** Landing:
  - Headline: **"Makan Enak ala Anak Kost, Dompet Aman, Badan Nyaman."**
  - Subtitle (revisi, hapus janji lokasi yang belum ada fiturnya dan klaim kesehatan): *"Temukan menu Warteg juara, resep rice cooker hemat, dan hitung budget makanmu. Lengkap dengan ringkasan gizi yang santai."*
  - CTA utama: **Jelajahi Menu** · CTA sekunder: **Hitung Budget Makan**
- [ ] **2.2b** Samakan istilah menu (lihat §9) di navbar, judul halaman, dan tombol.
- [ ] **2.2c** Hapus kata klinis di UI pengguna: "defisiensi", "asupan harian dianjurkan" sebagai judul. Ganti dengan *"Biar makin seimbang"*, *"Boleh tambah…"*.

#### 2.3 Kartu makanan (`food-recommendations.tsx`)
Urutan elemen **wajib**: foto → nama → harga (perkiraan) → ≤3 badge rasa → 1 baris gizi ringkas (kkal · protein) → tombol "Catat ke Diari".
- [ ] **2.3a** Detail gizi lengkap muncul di *expandable/drawer*, bukan di kartu.
- [ ] **2.3b** Target sentuh minimal 44×44px, fokus keyboard terlihat.

**Selesai jika:** 0 pelanggaran kontras di Lighthouse, kartu lolos uji urutan elemen, dark mode berfungsi.

---

### Fase 3: AI Food Reviewer yang Andal (Minggu 4–5)
*Memperbaiki B7. Risiko utama: salah kenali makanan dan salah taksir harga.*

#### 3.1 Kontrak output AI (JSON tervalidasi)

```json
{
  "foods": [{
    "name": "Nasi + Telur Balado + Orek Tempe",
    "confidence": 0.82,
    "portion_estimate": "1 piring nasi sedang, 1 butir telur, 3 sendok orek",
    "nutrition": { "kcal": 620, "protein": 22, "carbs": 80, "fat": 22 },
    "price_estimate": { "min": 12000, "max": 18000 }
  }],
  "culinary_review": "string, maks 280 karakter, nada ramah",
  "culinary_tips": ["maks 3 saran pelengkap"],
  "flavor_tags": ["pedas-gurih", "wangi-rempah"],
  "disclaimer_key": "estimate"
}
```

- [ ] **3.1a** Validasi dengan zod; jika gagal, ulangi 1× lalu tampilkan fallback ramah.
- [ ] **3.1b** `flavor_tags` dibatasi ke enum `FlavorTag` (tolak tag liar).
- [ ] **3.1c** Pencocokan hasil AI ke `localFoods.ts` agar gizi memakai data lokal bila ada kecocokan (prioritas data lokal di atas tebakan AI).

#### 3.2 Penanganan ketidakpastian
- [ ] **3.2a** Jika `confidence < 0.6`: tampilkan *"Sepertinya ini… (benar?)"* dengan 3 alternatif tombol cepat.
- [ ] **3.2b** Semua hasil bisa **dikoreksi manual** (ganti nama makanan, geser porsi S/M/L, ubah harga) sebelum disimpan ke Diari.
- [ ] **3.2c** Label tetap tampil: *"Perkiraan AI, bisa meleset."*
- [ ] **3.2d** Batasi ukuran unggahan (maks 4 MB; kompres di sisi klien ke ≤1280px sebelum kirim).
- [ ] **3.2e** Penanganan kegagalan: timeout 20 dtk, pesan *"Fotonya kurang jelas, coba foto dari atas dengan cahaya terang."*, tombol coba lagi, dan opsi pilih manual.

#### 3.3 Nada Food Reviewer
Panduan prompt (`src/lib/ai/prompts.ts`):
- Gaya: teman yang suka kulineran, bahasa santai, **tanpa klaim medis** dan **tanpa menghakimi**.
- Boleh: *"Kombinasi telur balado + orek tempe ini juara! Tambah lalapan biar makin segar."*
- Dilarang: *"Asupan seratmu buruk"*, *"Makanan ini menyebabkan…"*, saran diet ekstrem.
- Wajib menyisipkan 1 saran pelengkap berbasis `pairWith`.

#### 3.4 Evaluasi
- [ ] **3.4a** Siapkan **set uji 30 foto** makanan Indonesia (bervariasi cahaya/sudut) dengan label benar.
- [ ] **3.4b** Target: nama makanan benar ≥ 75% (top-1), ≥ 90% (top-3); kalori dalam ±30% dari data TKPI untuk ≥ 70% kasus.

**Selesai jika:** target evaluasi tercapai, alur koreksi manual berjalan, tidak ada output tanpa disclaimer.

---

### Fase 4: Fitur Inti Disempurnakan (Minggu 5–6)

#### 4.1 Rakit Piring Warteg (`warteg-plate-builder.tsx`)
- [ ] **4.1a** Alur: pilih karbo → lauk (hewani/nabati) → sayur → pelengkap → ringkasan.
- [ ] **4.1b** Tagihan kasir: tampilkan total sebagai **rentang** (misalnya "≈ Rp14.000–Rp19.000") sesuai kota di profil.
- [ ] **4.1c** Komentar "pelayan Warteg" dibuat dari aturan, bukan AI: contoh aturan:
  - tanpa sayur → *"Mas, orek tauge-nya sekalian biar nggak seret."*
  - total > budget pengguna → *"Wah, agak lewat budget. Ganti lauk jadi tempe, hemat Rp4.000."*
  - ada sambal + lauk berkuah → *"Siap-siap keringetan ya!"*
- [ ] **4.1d** Indikator budget: bar sisa budget harian/makan (dari Profil & Porsi).
- [ ] **4.1e** Satu klik "Catat ke Diari" + bagikan hasil piring sebagai gambar (untuk dibagikan ke teman kost).
- [ ] **4.1f** Template cepat: "Paket Hemat 10 Ribu", "Paket Tanggal Tua", "Paket Protein".

#### 4.2 Jelajah Menu & Budget (`src/app/recommendations/page.tsx`)
- [ ] **4.2a** Filter: **venue** (Warteg, Warmindo, Angkringan, Masak Sendiri), **budget** (≤10k, ≤15k, ≤25k), **rasa** (tag), **kategori**.
- [ ] **4.2b** Urutkan: Termurah · Terpopuler · Paling kenyang (protein+serat per rupiah).
- [ ] **4.2c** Mode "Sisa Budget": masukkan nominal → tampil kombinasi menu yang muat.
- [ ] **4.2d** State kosong ramah ("Belum ada menu di rentang ini, coba naikkan budget Rp2.000").

#### 4.3 Resep Rice Cooker (`rice-cooker-hacks.tsx`)
- [ ] **4.3a** Tiap resep wajib memuat: waktu total, **estimasi biaya per porsi**, alat minimum, bahan, langkah bernomor, tips gagal-dan-solusi, dan gizi ringkas.
- [ ] **4.3b** Tambahkan filter *"Pakai yang ada di kost"* (centang bahan di tangan → resep yang cocok).
- [ ] **4.3c** Tambah resep sampai **≥ 10** (saat ini 5): contoh tambahan: Bubur Ayam Magic Com, Nasi Tim Telur, Mie Kuah Sayur, Nasi Goreng Teflon-Free, Pepes Tahu Kukus.
- [ ] **4.3d** Keselamatan: peringatan singkat (jangan isi melebihi garis maks, hati-hati uap panas, masak telur/ayam hingga matang).

#### 4.4 Diari Kuliner (`/history`, `nutrition-history.tsx`)
- [ ] **4.4a** Tampilan mingguan: total pengeluaran makan, rata-rata per hari, menu favorit, streak hari mencatat.
- [ ] **4.4b** Badge pencapaian (contoh): "Jagoan 10 Ribu" (3 hari ≤ Rp10.000), "Sayur Nyempil" (sayur 5 hari berturut-turut), "Chef Magic Com".
- [ ] **4.4c** Data tersimpan lokal (IndexedDB/localStorage) dengan tombol **Ekspor CSV** dan **Hapus semua data**.
- [ ] **4.4d** Ringkasan gizi mingguan ditulis sebagai saran ramah, bukan rapor kekurangan.

**Selesai jika:** keempat fitur lolos kriteria penerimaan (§6) dan berfungsi di layar 360px.

---

### Fase 5: Lokasi & Komunitas (Opsional, Minggu 7+)
*Hanya dikerjakan jika Fase 1–4 selesai dan metrik (§5) menunjukkan engagement.*

- [ ] **5.1** Pilihan lokasi/kampus manual (tanpa GPS) untuk menampilkan rentang harga lokal.
- [ ] **5.2** Daftar "Spot Murah Dekat Kampus" (kurasi manual per kampus; mulai 3 kampus percontohan) dengan jam buka dan rentang harga.
- [ ] **5.3** Koreksi harga dari pengguna (crowdsourcing) dengan moderasi sederhana.
- [ ] **5.4** PWA: bisa dipasang di layar utama dan membaca katalog secara offline.

> Sampai Fase 5.1–5.2 selesai, **jangan** memakai klaim "sekitar kampus" di copywriting.

---

## 4. Tabel Prioritas & Status

| Prio | Tugas | File utama | Dampak | Usaha | Status |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **P0** | Audit klaim v1 & pasang analitik | `docs/audit/`, layer analitik | Tinggi | S | ⬜ |
| **P1** | Data kuliner ≥60 item + foto + tag + harga | `src/lib/data/localFoods.ts` | **Sangat tinggi** | L | ⬜ |
| **P2** | Token warna + audit kontras + dark mode | `globals.css`, tema Tailwind | Tinggi | M | ⬜ |
| **P3** | Kontrak output AI, koreksi manual, set uji 30 foto | `src/lib/ai/prompts.ts`, `/api/analyze-food`, `analyze/page.tsx` | Tinggi | M | ⬜ |
| **P4** | Filter & sort Jelajah Menu + mode Sisa Budget | `src/app/recommendations/page.tsx` | Tinggi | M | ⬜ |
| **P5** | Penyempurnaan Rakit Piring Warteg | `warteg-plate-builder.tsx` | Tinggi | M | ⬜ |
| **P6** | Resep rice cooker ≥10 + filter bahan | `rice-cooker-hacks.tsx` | Sedang | M | ⬜ |
| **P7** | Diari mingguan, badge, ekspor/hapus data | `nutrition-history.tsx`, `/history` | Sedang | M | ⬜ |
| **P8** | Copywriting final + glosarium | `page.tsx`, `navbar.tsx` | Sedang | S | ⬜ |
| **P9** | Uji pengguna & perbaikan | `docs/research/` | Tinggi | M | ⬜ |
| **P10** | Lokasi, spot kampus, PWA (opsional) | baru | Sedang | L | ⬜ |

*Usaha: S ≤ 1 hari · M = 2–4 hari · L = 5+ hari.*

---

## 5. Metrik Keberhasilan (Terukur)

Target diukur 4 minggu setelah rilis Fase 4, dibandingkan dengan baseline Fase 0.

| Metrik | Cara ukur | Target |
| :--- | :--- | :---: |
| Pemahaman 5 detik | 5–8 responden: "Aplikasi ini untuk apa?" | ≥ 80% menjawab "kuliner/makan hemat" |
| Klik CTA landing | `cta_explore_click` ÷ `landing_view` | ≥ 35% |
| Bounce rate landing | Analitik | Turun ≥ 20% dari baseline |
| Aktivasi | Pengguna baru melakukan ≥1 aksi (scan, rakit piring, atau catat diari) di sesi pertama | ≥ 50% |
| Retensi | Pengguna kembali dalam 7 hari | ≥ 25% |
| Kebiasaan | Rata-rata entri Diari per pengguna aktif per minggu | ≥ 4 |
| Adopsi Rakit Piring | `plate_builder_save_diary` ÷ pengguna `/recommendations` | ≥ 20% |
| Akurasi AI | Set uji 30 foto (§3.4) | top-1 ≥ 75%, top-3 ≥ 90% |
| Kualitas koreksi | `scan_correction` ÷ `scan_success` | < 30% (turun tiap iterasi) |
| Kecepatan | Lighthouse mobile (Slow 4G): LCP | ≤ 2,5 dtk |
| Aksesibilitas | Lighthouse Accessibility | ≥ 95, 0 pelanggaran kontras |
| Rasio gizi vs makanan | Uji tinjau: area foto+deskripsi vs area angka gizi per kartu | foto+deskripsi ≥ 2× area gizi |

---

## 6. Kriteria Penerimaan per Fitur (Definition of Done)

**Umum (semua fitur):**
- Berfungsi di 360×640px dan 412×915px; tanpa scroll horizontal.
- Navigasi keyboard dan label ARIA dasar tersedia.
- Tidak ada teks medis klinis di UI utama (cek daftar kata terlarang §7.3).
- Event analitik terkait terkirim.
- Tidak ada error di konsol pada alur utama.

**Rakit Piring Warteg:** total harga tampil sebagai rentang · bar budget berfungsi · tersimpan ke Diari dengan 1 klik · minimal 3 template.
**Scan Makanan:** foto >4 MB dikompres otomatis · output lolos validasi skema · koreksi manual bisa disimpan · label "perkiraan" tampil.
**Jelajah Menu:** filter venue/budget/rasa bekerja gabungan · state kosong ramah · LCP ≤ 2,5 dtk.
**Resep Rice Cooker:** tiap resep punya biaya/porsi, waktu, langkah, tips gagal · tombol salin belanjaan menghasilkan teks rapi.
**Diari:** ekspor CSV valid · hapus data meminta konfirmasi · ringkasan mingguan tampil.

---

## 7. Kepatuhan, Etika & Batas Disclaimer

### 7.1 Prinsip
Bahasa dilunakkan, **substansi disclaimer dipertahankan**.

### 7.2 Penempatan wajib
| Lokasi | Teks (contoh) | Bentuk |
| :--- | :--- | :--- |
| Hasil scan AI | *"Perkiraan AI, bisa meleset dari porsi aslinya."* | Teks kecil di bawah kartu |
| Hitungan kalori/BMR (Profil & Porsi) | *"Ini estimasi umum, bukan saran medis. Punya kondisi kesehatan khusus? Tanyakan ke ahli gizi atau dokter."* | Catatan tetap di halaman |
| Footer semua halaman | Link "Catatan & Ketentuan" | Tautan |
| Onboarding pertama | Persetujuan singkat 1 layar (bukan dinding teks) | Modal ringkas |

### 7.3 Daftar kata/klaim yang dihindari di UI utama
- Klaim hasil kesehatan: "menyembuhkan", "menurunkan berat badan X kg", "mencegah penyakit", "badan fit pasti".
- Judul menghakimi: "defisiensi", "kekurangan gizi", "makanan buruk".
- Saran ekstrem: puasa panjang, target kalori sangat rendah.

### 7.4 Pengguna rentan
- Hindari fitur yang mendorong **target kalori sangat rendah**; beri batas bawah aman pada kalkulator dan arahkan ke tenaga kesehatan bila input tidak wajar.
- Hindari gamifikasi yang memberi penghargaan untuk makan sedikit; badge fokus pada **hemat, variasi, dan konsistensi**, bukan pembatasan.

### 7.5 Privasi
- Data Diari disimpan lokal secara default; jelaskan di Catatan & Ketentuan.
- Foto yang dikirim ke penyedia AI: beri tahu pengguna, jangan simpan permanen di server, dan hapus metadata EXIF (termasuk lokasi) di sisi klien sebelum unggah.

### 7.6 Hak cipta
- Foto: hanya milik sendiri atau berlisensi; catat `credit` & `license`.
- Resep: tulis ulang dengan kata sendiri; jangan salin dari situs lain.
- Data gizi: cantumkan sumber (TKPI) di halaman "Tentang Data".

---

## 8. Risiko & Mitigasi

| Risiko | Kemungkinan | Dampak | Mitigasi |
| :--- | :---: | :---: | :--- |
| AI salah kenali makanan lokal | Tinggi | Tinggi | Confidence + alternatif, koreksi manual, cocokkan ke data lokal, set uji 30 foto |
| Harga tidak sesuai kota pengguna | Tinggi | Sedang | Rentang + label "perkiraan", pengaturan kota, koreksi pengguna (Fase 5) |
| Foto makan memperlambat halaman | Sedang | Tinggi | WebP/AVIF, ≤60 KB, lazy load, `srcset`, anggaran performa LCP ≤ 2,5 dtk |
| Biaya API AI membengkak | Sedang | Sedang | Kompres gambar, cache hasil per hash foto, batasi scan per hari |
| Klaim hukum/kesehatan | Rendah | Tinggi | §7, tinjau copywriting sebelum rilis |
| Pelanggaran hak cipta foto | Sedang | Tinggi | Aturan sumber foto §1.3, kolom `license` wajib |
| Estetika hangat mengurangi keterbacaan | Sedang | Sedang | Audit kontras otomatis, dark mode, uji pengguna |
| Data harga cepat usang (inflasi) | Sedang | Sedang | `updatedAt` per item, tinjau tiap kuartal |
| Cakupan membengkak (fitur lokasi) | Tinggi | Sedang | Fase 5 opsional dengan gerbang metrik |

---

## 9. Glosarium & Aturan Bahasa

| Konsep | Istilah resmi | Jangan pakai |
| :--- | :--- | :--- |
| Halaman scan foto | **Scan Makanan** | Analisis Gizi, Analyze |
| Katalog + budget | **Jelajah Menu** (fitur hitung: **Cek Budget**) | "Jelajah Menu & Budget" dan "Cek Budget Makan" bergantian |
| Riwayat | **Diari Kuliner** | Riwayat Nutrisi |
| Profil | **Profil & Porsi** | Kalkulator BMR |
| Fitur piring | **Rakit Piring Warteg** | Plate Builder (hanya untuk nama file/kode) |
| Hasil AI | **Ulasan Rasa** | AI Review, Food Reviewer (hanya untuk kode) |
| Kartu menu | **Kartu Menu** | Culinary Card |

**Gaya bahasa:** Indonesia santai-sopan (aku/kamu boleh, hindari slang berlebihan), kalimat ≤ 18 kata, emoji maksimal 1 per judul, hindari istilah medis di antarmuka utama.

---

## 10. Rencana Pengujian

| Jenis | Cara | Waktu | Lolos jika |
| :--- | :--- | :--- | :--- |
| Uji 5 detik | 5–8 anak kost, landing page | Fase 0 & akhir Fase 2 | ≥ 80% benar |
| Uji tugas | Tugas: "Cari makan malam ≤ Rp15.000", "Catat makan siangmu dengan foto", "Rakit piring Rp12.000" | Akhir Fase 4 | ≥ 80% selesai tanpa bantuan, median < 90 dtk/tugas |
| Aksesibilitas | Lighthouse + axe + uji keyboard | Tiap rilis | Skor ≥ 95, 0 pelanggaran kontras |
| Performa | Lighthouse "Slow 4G" + uji nyata di HP Android entry-level | Tiap rilis | LCP ≤ 2,5 dtk |
| Akurasi AI | 30 foto berlabel | Fase 3, ulangi tiap ubah prompt/model | Sesuai §3.4 |
| Regresi | Skenario utama (scan → koreksi → catat diari) | Tiap rilis | 0 error kritis |
| Konten | Tinjau tata bahasa, kata terlarang §7.3, kredit foto | Sebelum rilis | Tanpa temuan |

---

## 11. Jadwal Ringkas

| Minggu | Fokus | Keluaran |
| :---: | :--- | :--- |
| 1 | Fase 0: audit & baseline | `docs/audit/*`, analitik aktif |
| 2–3 | Fase 1: data kuliner | ≥60 item, ≥40 foto, validator |
| 3–4 | Fase 2: palet, kontras, copywriting | Token warna, dark mode, landing final |
| 4–5 | Fase 3: AI Reviewer andal | Skema output, koreksi manual, hasil evaluasi |
| 5–6 | Fase 4: penyempurnaan 4 fitur inti | Kriteria §6 terpenuhi |
| 6 | Uji pengguna & perbaikan (P9) | Laporan di `docs/research/` |
| 7+ | Fase 5 (opsional, bila metrik mendukung) | Lokasi, spot kampus, PWA |

---

## 12. Pertanyaan Terbuka (Putuskan Sebelum Fase 1)

1. Sumber data harga awal: input manual tim atau survei ke berapa warung per kota?
2. Siapa yang memotret/menyediakan foto makanan, dan siapa penanggung jawab lisensinya?
3. Penyedia AI mana yang jadi default, dan berapa batas biaya bulanan?
4. Apakah akun pengguna dibutuhkan, atau cukup data lokal di perangkat pada tahap ini?
5. Kota/kampus mana yang jadi target percontohan?

---

*Dokumen ini diperbarui setiap akhir minggu: ubah kolom Status di §4, catat keputusan pada §12, dan pindahkan hal selesai ke `CHANGELOG.md`.*