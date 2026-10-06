<div align="center">

# 🥗 DOMPET GIZI

### Asisten Gizi Cerdas untuk Anak Kost 💡

Platform web berbasis AI yang membantu anak kost menghitung kandungan gizi makanan cukup dengan memfoto makanan mereka, disertai rekomendasi alternatif makanan murah dan bergizi.

![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge)

</div>

---

## 📖 Daftar Isi

- [Tentang](#-tentang)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#️-tech-stack-100-gratis)
- [Mulai Cepat](#-mulai-cepat)
- [Struktur Proyek](#-struktur-proyek)
- [Alur Kerja Tim](#-alur-kerja-tim)

---

## 🍽️ Tentang

**GiziKost** hadir untuk memecahkan masalah anak kost yang memiliki budget makan terbatas namun ingin tetap menjaga asupan gizi.

Cukup dengan memfoto makanan, GiziKost akan mengenali jenis makanan, menghitung kalori & makronutrisi, serta mencocokkannya dengan kebutuhan harianmu. Jika ada nutrisi yang kurang, GiziKost akan merekomendasikan tambahan makanan murah (seperti tempe/tahu) yang bisa dibeli di warteg/kantin sekitar!

Aplikasi ini 100% menggunakan teknologi **Gratis** (Free Tier) dan mengandalkan sistem **AI Round-Robin Load Balancer** yang mendistribusikan request pemindaian gambar ke **3 provider AI** (Gemini, Groq, Mistral) agar tetap berada di batas gratis tiap provider. Rekomendasi makanan menggunakan algoritma lokal berbasis aturan (rule-based) yang cepat dan tanpa biaya API.

📄 Dokumentasi lengkap: [PRD](docs/PRD.md) | [Tasks](docs/TASKS.md) | [SOP](docs/SOP.md)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 📸 **Scan Makanan AI** | Deteksi otomatis makanan, estimasi porsi, dan hitung makronutrisi lewat foto. |
| 🎯 **Dashboard Gizi Harian** | Pantau kecukupan kalori, protein, lemak, karbohidrat, dan serat hari ini. |
| 💡 **Rekomendasi Murah** | Saran alternatif makanan bergizi sesuai budget (misal: "Tambah tempe goreng Rp3.000 untuk penuhi protein"). |
| 👤 **Profil Personal** | Kalkulasi target nutrisi harian (AKG) otomatis berdasarkan usia, berat, dan tingkat aktivitas. |
| 🗄️ **Riwayat Makan** | Catat dan pantau seluruh histori makanan kamu dalam 7 hari terakhir. |

---

## 🛠️ Tech Stack (100% Gratis)

<div align="center">

| Layer | Teknologi |
|---|---|
| 🏗️ **Fullstack** | Next.js 15 (App Router) + React 19 + TypeScript |
| 🎨 **Styling** | Tailwind CSS + shadcn/ui |
| 🤖 **AI Engine (Scan)** | Gemini (1.5 Flash), Groq (Llama 3.2 Vision), Mistral (Pixtral 12B) — via Round-Robin |
| 🧠 **Recommendation** | Local Rule-Based Scoring Algorithm |
| 🗄️ **Database & Auth** | Supabase (PostgreSQL) + Supabase Storage |
| 🚀 **Deployment** | Vercel / Netlify |

</div>

---

## 🚀 Mulai Cepat

### Prasyarat

| Tool | Versi | Keterangan |
|---|---|---|
| [Node.js](https://nodejs.org) | 20.x LTS+ | Untuk menjalankan aplikasi |
| npm / pnpm | terbaru | Package manager |
| Git | terbaru | Version control |

### Jalankan Aplikasi (Next.js)

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Install dependensi
npm install

# 3. Siapkan environment variables
cp ENV.example.md .env.local
# Edit .env.local → isi Supabase URL, Anon Key, dan API Keys AI

# 4. Jalankan development server
npm run dev
```

Aplikasi berjalan di [http://localhost:3000](http://localhost:3000) 🎉

### Environment Variables (`frontend/.env.local`)

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000/
NEXT_PUBLIC_APP_NAME="GiziKost"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=       # dari dashboard Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # dari dashboard Supabase

# AI Providers (isi minimal 1 agar bisa scan makanan)
GEMINI_API_KEY=           # dari https://aistudio.google.com
GROQ_API_KEY=             # dari https://console.groq.com
MISTRAL_API_KEY=          # dari https://console.mistral.ai
```

#### Mengaktifkan Login Google

1. Di Supabase Dashboard, buka **Authentication → Providers → Google** dan aktifkan provider dengan OAuth Client ID dan Client Secret dari Google Cloud Console.
2. Salin callback URI yang ditampilkan Supabase (format `https://<project-ref>.supabase.co/auth/v1/callback`) ke **Authorized redirect URIs** pada OAuth Client di Google Cloud Console.
3. Di **Authentication → URL Configuration** Supabase, tambahkan `http://localhost:3000/auth/callback` ke daftar redirect URLs. Untuk produksi, tambahkan juga callback URL pada domain HTTPS aplikasi.
4. Buka aplikasi dan pilih **Lanjutkan dengan Google**. Halaman utama dan endpoint analisis hanya dapat digunakan setelah login.

#### Riwayat Gizi Harian

Jalankan `supabase/migrations/00002_nutrition_history.sql` melalui Supabase SQL Editor setelah skema awal tersedia. Migrasi ini membuat penyimpanan hasil scan per akun dan mengaktifkan kebijakan RLS; setiap analisis baru akan tersimpan otomatis dan ditampilkan sebagai total harian untuk 7 hari terakhir.

---

## 📁 Struktur Proyek

```text
PTKOM/
├── frontend/                       # ⚡ Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                    # Halaman App Router
│   │   │   ├── api/analyze-food/   # Next.js API Route (AI round-robin)
│   │   │   └── api/recommendations/# Next.js API Route (Local Rule-Based)
│   │   ├── lib/
│   │   │   ├── ai/                 # AI service layer (round-robin + prompt)
│   │   │   └── supabase/           # Supabase client & server helpers
│   │   └── components/             # UI Components (Tailwind + shadcn)
│   ├── public/                     # Assets statis
│   ├── ENV.example.md              # Template environment variables
│   └── .env.local                  # Environment variables (JANGAN DI-COMMIT)
│
├── supabase/
│   └── migrations/
│       └── 00001_init.sql          # Schema: users, food_logs, local_foods + RLS + seed data
│
└── docs/
    ├── PRD.md                      # Product Requirements Document
    ├── TASKS.md                    # Task list & roadmap
    └── SOP.md                      # Standard Operating Procedure
```

---

## 🤝 Alur Kerja Tim

> **⚠️ ATURAN WAJIB**
> 1. **Pull dulu** sebelum mulai kerja (`git pull origin develop`)
> 2. **DILARANG** push langsung ke `main` — kerja di branch fitur masing-masing.
> 3. **Wajib buat Pull Request** untuk menggabungkan kode.

### Branch Strategy

| Branch | Fungsi |
|---|---|
| `main` | Production — **dilarang** commit/push langsung. |
| `develop` | Integrasi fitur — merge via PR dari `feature/*`. |
| `feature/*` | Branch fitur masing-masing (contoh: `feature/ai-scanner`). |

### Git Flow

```bash
# 1. Ambil update terbaru
git checkout develop
git pull origin develop

# 2. Buat branch fitur
git checkout -b feature/nama-fitur

# 3. Kerjakan, commit, push
git add .
git commit -m "feat(scope): deskripsi perubahan"
git push origin feature/nama-fitur

# 4. Buat Pull Request di GitHub: feature/nama-fitur → develop
```

---

<div align="center">

**GiziKost** — Makan Sehat, Sesuai Budget Kost! 🥗

</div>
