# 🍲 Rencana Transformasi Tema Kuliner: DompetKost

> **Dokumen Perencanaan (Plan.md)**  
> **Tujuan:** Menggeser fokus platform dari kalkulator gizi klinis/kaku menjadi **Asisten Kuliner Anak Kost yang Lezat, Hemat, dan Cerdas** *(Food-First, Nutrition-Smart Companion)*.  
> **Target Pengguna:** Mahasiswa & anak kost pencinta kuliner hemat, pelanggan setia Warteg/Warmindo/Angkringan, serta pejuang masak simpel di kost.

---

## 1. Filosofi & Visi Perubahan (*Core Concept*)

### Prinsip Utama: *"Food-First, Nutrition-Second"*
Saat ini aplikasi terkesan seperti aplikasi medis rumah sakit (fokus berlebihan pada defisiensi gizi, gram makronutrien dingin, dan disclaimer medis).  
**Arah Baru:** Makanan lezat, sensasi rasa, dan kearifan kuliner lokal anak kost menjadi **bintang utama**. Angka gizi hadir sebagai **pendamping pintar** agar makan enak tetap seimbang.

```
Sebelumnya:
[Foto Makanan] → [Tabel Gram Gizi] → [Peringatan Defisiensi / Kekurangan Gizi]

Arah Baru:
[Foto Makanan] → [Review Kuliner & Cita Rasa] → [Rekomendasi Lauk Pelengkap Lezat] → [Ringkasan Gizi Santai]
```

---

## 2. Rencana Tahapan Eksekusi (Actionable Roadmap)

### Fase 1: Perombakan Copywriting, Navigasi & Identitas (Branding)
*Fokus: Mengubah bahasa kaku klinis menjadi bahasa anak muda & penikmat kuliner nusantara.*

- [x] **1.1. Penyesuaian Nama Menu & Navigasi:**
  - `Analisis Gizi` $\rightarrow$ **Scan Makanan**
  - `Rekomendasi` $\rightarrow$ **Jelajah Menu & Budget**
  - `Riwayat` $\rightarrow$ **Diari Kuliner**
  - `Kalkulator BMR / Profil` $\rightarrow$ **Profil & Porsi**
- [x] **1.2. Reframing Landing Page (`src/app/page.tsx`):**
  - Ubah tagline utama: dari *"Budget Minimal, Sehat Maksimal"* menjadi:
    > **"Makan Enak ala Anak Kost, Dompet Aman, Badan Nyaman."**
  - Subtitle: *"Eksplorasi kuliner murah sekitar kampus, resep rice cooker hemat, dan rekomendasi menu Warteg juara yang tetap bikin badan fit."*
  - Tombol CTA: *"Jelajahi Menu Sekarang"* dan *"Cek Budget Makan"*.
- [x] **1.3. Reduksi Bahasa Medis yang Mengintimidasi:**
  - Lembutkan banner *"Pernyataan & Ketentuan Medis"* agar lebih bersahabat tanpa menghilangkan kepatuhan hukum.

---

### Fase 2: Transformasi Visual & UI/UX (Membangkitkan Selera Makan)
*Fokus: Memperbaiki estetika visual dari palet warna teknologi dingin ke nuansa hangat kuliner.*

- [x] **2.1. Palet Warna Hangat (*Appetite-Inducing Palette*):**
  - Hadirkan aksen **Warm Amber / Sunset Orange (`#f59e0b` / `#ea580c`)** dan **Warm Terracotta** yang secara psikologis memicu selera makan (menggantikan dominasi ungu/abu-abu netral).
- [x] **2.2. Penyegaran Kartu Makanan (*Culinary Cards*):**
  - Desain kartu kuliner hangat dengan badge rasa, porsi realistis anak kost, dan visualisasi selera di `food-recommendations.tsx`, `analyze/page.tsx`, serta builder piring.
- [x] **2.3. Label Karakteristik Rasa & Tempat (*Food Badges*):**
  - Tambahkan badge visual pada setiap hidangan:
    - `🌶️ Pedas Gurih` / `🍲 Berkuah Segar` / `🍗 Gurih Renyah` / `🌿 Wangi Rempah`
    - `🏪 Khas Warteg` / `☕ Ala Warmindo & Burjo` / `🍚 Trik Rice Cooker`

---

### Fase 3: Fitur Utama Penguat Tema Kuliner

#### 🍽️ [x] 3.1. Fitur "Rakit Piring Warteg" (Interactive Plate Builder)
*Konsep:* Mengadaptasi pengalaman memesan di etalase kaca Warteg.
- **Komponen:** `src/components/warteg-plate-builder.tsx` terintegrasi langsung di `/recommendations`.
- Pilihan Karbo, Lauk Hewani & Nabati, Sayuran segar, dan Sambal/Krupuk.
- Live billing kasir Warteg + komentar rasa ala pelayan Warteg + pencatatan satu klik ke Diari Kuliner.

#### 🤖 [x] 3.2. AI Food Reviewer pada Fitur Scan Foto (`/analyze`)
*Konsep:* AI bertindak layaknya *food vlogger / reviewer kuliner*, bukan sekadar mesin timbang gizi laboratorium.
- Multi-provider multimodal AI prompts diperkaya dengan `culinary_review`, `culinary_tips`, dan `flavor_tags`.
- Tampilan kartu Food Reviewer hangat di `/analyze` lengkap dengan estimasi harga wajar & tips pendamping makanan.

#### 🍳 [x] 3.3. Koleksi Resep "Kosan Hacks & Rice Cooker"
*Konsep:* Khusus tab *Masak Sendiri*, berikan inspirasi masakan praktis tanpa kompor rumit.
- **Komponen:** `src/components/rice-cooker-hacks.tsx` terintegrasi langsung di `/recommendations`.
- Resep: Nasi Liwet Teri Magic Com, Sup Telur Tomat Kilat, Omelet Mie Telur, Nasi Kuning Harum, Ayam Kecap Magic Com.
- Langkah masak bertahap, tombol salin belanjaan bahan, dan tombol catat ke Diari Kuliner.

---

### Fase 4: Pengayaan Konten Kuliner Lokal & Diari Makan

- [x] **4.1. Reframing Riwayat Nutrisi Menjadi "Diari Petualangan Kuliner":**
  - Tampilan di `/history` dan `nutrition-history.tsx` disulap menjadi diari pencapaian santapan harian dengan badge kalori hangat dan statistik menu porsi makan.

---

### Fase 5: Jadwal & Prioritas Pengerjaan

| Prioritas | Item Tugas | Lokasi File | Estimasi Dampak |
| :---: | :--- | :--- | :--- |
| **P1** | Perbarui Landing Page (`/`) dengan copywriting & visual kuliner yang menggoda | `src/app/page.tsx`, `components/navbar.tsx` | Tinggi (Kesan pertama langsung terasa food-themed) |
| **P2** | Perbarui Halaman Rekomendasi (`/recommendations`) menjadi katalog menu & filter kuliner (Warteg, Warmindo, Masak) | `src/app/recommendations/page.tsx` | Tinggi (Pusat eksplorasi menu) |
| **P3** | Ubah prompt dan formatting hasil scan AI (`/api/analyze-food` & `/analyze`) agar bergaya *Food Reviewer* | `src/lib/ai/prompts.ts`, `src/app/analyze/page.tsx` | Tinggi (Interaksi pengguna terasa lebih hangat dan asyik) |
| **P4** | Tambahkan foto makanan nyata dan tag rasa pada database lokal | `src/lib/data/localFoods.ts` | Sedang |
| **P5** | Buat fitur interaktif "Rakit Piring Warteg" | Halaman baru atau sub-komponen rekomendasi | Tinggi (Diferensiasi unik) |

---

## 3. Indikator Keberhasilan (Success Metric)
1. **Pengguna Pertama Kali Membuka Web:** Langsung mengenali bahwa ini adalah web panduan kuliner & makan enak anak kost, bukan portal rekam medis.
2. **Keterbacaan Informasi:** Angka gizi tetap mudah diakses, namun tidak lagi mendominasi porsi tampilan melebihi foto dan deskripsi makanan.
3. **Engagement:** Pengguna lebih tertarik menjelajahi berbagai rekomendasi menu karena fotonya menggugah selera dan harganya realistis sesuai kantong kost.
