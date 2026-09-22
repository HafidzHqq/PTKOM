# 📝 Task List & Roadmap: Dompet Gizi

Dokumen ini berisi daftar tugas (backlog) komprehensif untuk pengembangan **Dompet Gizi**. Beri tanda `[x]` jika tugas sudah selesai.

---

## 🏗️ Phase 1: Inisialisasi & Setup Proyek (Minggu 1)

### 1.1. Repository & Environment
- [x] Inisialisasi Next.js 15 App Router (`frontend/`)
- [x] Setup Tailwind CSS & shadcn/ui
- [x] Konfigurasi ESLint & Prettier
- [x] Setup `.env.local` untuk API Keys (Gemini, Groq, Mistral)
- [x] Perbaikan CI/CD GitHub Actions untuk folder `frontend/`
- [x] Rebranding & Update README + PRD ke "Dompet Gizi"

### 1.2. Database & Auth (Supabase)
- [ ] Buat project baru di Supabase
- [ ] Setup koneksi Supabase di Next.js (`@supabase/ssr` atau `@supabase/supabase-js`)
- [ ] Buat skema tabel `users` (profil, budget, target gizi)
- [ ] Buat skema tabel `food_logs` (histori makanan & hasil scan)
- [ ] Buat skema tabel `local_foods` (seed data makanan warteg/kantin)
- [ ] Setup Supabase Storage bucket untuk upload foto (`food-images`)
- [ ] Setup Row Level Security (RLS) agar user hanya bisa melihat datanya sendiri
- [ ] Implementasi Login/Register (Google OAuth & Email)

---

## 🧠 Phase 2: Core AI Engine (Minggu 2)

### 2.1. Integrasi AI Providers
- [ ] Buat service adapter untuk **Gemini 3.5 Flash** (via `@google/generative-ai`)
- [ ] Buat service adapter untuk **Groq Qwen 3.8** (via OpenAI compatible SDK)
- [ ] Buat service adapter untuk **Mistral Small** (via `@mistralai/mistralai`)
- [ ] Susun *Unified System Prompt* agar semua AI merespon dengan format JSON yang identik
- [ ] Define tipe data/interface output dari AI (Kalori, Makro, Rekomendasi, Confidence Score)

### 2.2. AI Round-Robin Load Balancer
- [ ] Buat logika Load Balancer di API Route (`/api/analyze-food`)
- [ ] Buat sistem *failover*: jika AI 1 error/limit, otomatis pindah ke AI 2
- [ ] Parsing dan validasi output JSON dari AI menggunakan Zod

---

## 🎨 Phase 3: Frontend & UI Components (Minggu 2-3)

### 3.1. Halaman Autentikasi & Onboarding
- [ ] Buat UI halaman Login / Register
- [ ] Buat Wizard Onboarding (Input Usia, Gender, Berat, Tinggi)
- [ ] Buat komponen kalkulator BMR & AKG otomatis berdasarkan input user
- [ ] Simpan profil user ke Supabase

### 3.2. Halaman Dashboard (Home)
- [ ] Buat komponen Header (Sapaan user & Budget harian tersisa)
- [ ] Buat komponen *Nutrition Progress Bar* (Kalori, Protein, Lemak, Karbo, Serat)
- [ ] Tampilkan *Alert/Warning* jika ada makronutrisi yang masih jauh dari target
- [ ] Buat daftar "Makanan Hari Ini" (menampilkan riwayat `food_logs` hari ini)

### 3.3. Halaman Scan & Analisis (Core Feature)
- [ ] Buat UI Kamera bawaan web (menggunakan API HTML5 `getUserMedia`)
- [ ] Buat UI *Image Picker* (unggah dari Galeri)
- [ ] Buat *Loading State* menarik saat AI memproses gambar
- [ ] Buat UI "Kartu Hasil Analisis" (Menampilkan nama makanan, porsi, dan gizi)
- [ ] Sediakan form untuk user mengedit/mengoreksi hasil scan jika AI keliru
- [ ] Tombol "Simpan ke Riwayat"

### 3.4. Halaman Rekomendasi Makanan
- [ ] Integrasi *query* ke database `local_foods` berdasarkan nutrisi yang kurang
- [ ] Tampilkan daftar rekomendasi beserta perkiraan harga warteg
- [ ] Filter rekomendasi berdasarkan sisa *budget* harian user

### 3.5. Halaman Riwayat & Profil
- [ ] Tampilkan kalender / list log makanan di hari-hari sebelumnya
- [ ] Buat form edit profil (ubah target kalori atau budget)

---

## 🚀 Phase 4: Penyempurnaan & Launch (Minggu 4)

### 4.1. Fitur PWA (Progressive Web App)
- [ ] Install & konfigurasi `next-pwa`
- [ ] Buat `manifest.json` beserta icon/logo Dompet Gizi (ukuran 192x192, 512x512)
- [ ] Pastikan UI ramah *mobile* / *bottom safe-area*

### 4.2. Testing & Bugfix
- [ ] Test upload berbagai foto makanan Indonesia (Nasi Padang, Pecel Lele, dll)
- [ ] Evaluasi akurasi AI dan sesuaikan ulang (*tweak*) prompt jika perlu
- [ ] Pastikan UI responsif di layar HP kecil (320px)

### 4.3. Deployment
- [ ] Push ke GitHub branch `main`
- [ ] Hubungkan ke Vercel
- [ ] Set Environment Variables di dashboard Vercel
- [ ] Soft-launch dan bagikan ke beta tester (teman-teman mahasiswa)

---

## 🔮 Phase 5: Post-MVP / Backlog Masa Depan

- [ ] Integrasi Barcode Scanner (Open Food Facts) untuk makanan ringan/minuman kemasan
- [ ] Integrasi USDA FoodData Central untuk fallback data nutrisi yang lebih akurat
- [ ] Fitur berbagi resep/rekomendasi murah ke pengguna lain
- [ ] Gamifikasi (Streak berturut-turut mencatat makanan)
- [ ] Dark Mode
