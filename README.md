<div align="center">

# 🥗 DOMPET GIZI

### Asisten Gizi Cerdas untuk Anak Kost 💡

Platform web berbasis AI yang membantu anak kost menghitung kandungan gizi makanan cukup dengan memfoto makanan mereka, disertai rekomendasi alternatif makanan murah dan bergizi.

![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
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

Aplikasi ini 100% menggunakan teknologi **Gratis** (Free Tier) dan mengandalkan sistem **AI Round-Robin Load Balancer** yang mendistribusikan request pemindaian gambar ke **4 provider AI** (Gemini, Groq, Mistral, OpenRouter) agar tetap berada di batas gratis tiap provider (~4.000+ request/hari).

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
| 🔍 **Nutrition Lookup** | Cari data nutrisi makanan dari Open Food Facts & USDA FoodData Central. |

---

## 🛠️ Tech Stack (100% Gratis)

<div align="center">

| Layer | Teknologi |
|---|---|
| 🏗️ **Frontend** | Next.js 15 (App Router) + React 19 |
| 🎨 **Styling** | Tailwind CSS + shadcn/ui |
| 🐍 **Backend API** | Python 3.11+ + FastAPI |
| 🤖 **AI Engine** | Gemini 2.5 Flash, Groq (Llama 4 Scout), Mistral Vision, OpenRouter — via Round-Robin |
| 🗄️ **Database & Auth** | Supabase (PostgreSQL) + Supabase Storage |
| 🥗 **Nutrition API** | Open Food Facts + USDA FoodData Central |
| 🚀 **Deployment** | Vercel / Netlify |

</div>

---

## 🚀 Mulai Cepat

### Prasyarat

| Tool | Versi | Keterangan |
|---|---|---|
| [Node.js](https://nodejs.org) | 20.x LTS+ | Untuk frontend |
| [Python](https://python.org) | 3.11+ | Untuk backend |
| npm / pnpm | terbaru | Package manager |
| Git | terbaru | Version control |

### 1️⃣ Jalankan Backend (FastAPI)

```bash
# 1. Masuk ke folder backend
cd backend

# 2. Buat virtual environment (pertama kali saja)
python -m venv venv

# 3. Aktifkan virtual environment
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# 4. Install dependensi
pip install -r requirements.txt

# 5. Siapkan environment variables
cp .env.example .env
# Edit .env → isi API Keys (minimal satu AI provider sudah cukup)

# 6. Jalankan server
uvicorn main:app --reload
```

Backend berjalan di [http://localhost:8000](http://localhost:8000) 🚀

Buka [http://localhost:8000/docs](http://localhost:8000/docs) untuk **Swagger UI** (dokumentasi API interaktif).

#### API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/health` | Health check + status AI providers |
| `POST` | `/api/analyze-food` | Analisis foto makanan via AI round-robin |
| `POST` | `/api/recommendations` | Rekomendasi makanan murah berdasarkan defisiensi gizi |
| `POST` | `/api/profile/calculate-bmr` | Hitung BMR & target AKG harian |
| `GET` | `/api/local-foods` | List makanan lokal (filter: category, max_price, availability) |
| `GET` | `/api/nutrition/search` | Cari data nutrisi dari Open Food Facts / USDA |

### 2️⃣ Jalankan Frontend (Next.js)

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Install dependensi
npm install

# 3. Siapkan environment variables
cp .env.example .env.local
# Edit .env.local → isi Supabase URL, Anon Key, dan API Keys AI

# 4. Jalankan development server
npm run dev
```

Frontend berjalan di [http://localhost:3000](http://localhost:3000) 🎉

### Environment Variables

#### Backend (`backend/.env`)

```env
# AI Providers (isi minimal 1 agar bisa scan makanan)
GEMINI_API_KEY=           # dari https://aistudio.google.com
GROQ_API_KEY=             # dari https://console.groq.com
MISTRAL_API_KEY=          # dari https://console.mistral.ai
OPENROUTER_API_KEY=       # dari https://openrouter.ai

# Optional AI Models Override
GEMINI_MODEL="models/gemini-3.5-flash"
GROQ_MODEL="qwen/qwen3.8-27b"
MISTRAL_MODEL="mistral-small-latest"

# Nutrition API
USDA_API_KEY=             # dari https://fdc.nal.usda.gov/api-key-signup

# App
CORS_ORIGINS=http://localhost:3000,http://localhost:3000/
```

#### Frontend (`frontend/.env.local`)

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000/
NEXT_PUBLIC_APP_NAME="GiziKost"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=       # dari dashboard Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # dari dashboard Supabase

# AI Providers (sama seperti backend)
GEMINI_API_KEY=
GROQ_API_KEY=
MISTRAL_API_KEY=
OPENROUTER_API_KEY=

# Optional AI Models Override
GEMINI_MODEL="models/gemini-3.5-flash"
GROQ_MODEL="qwen/qwen3.8-27b"
MISTRAL_MODEL="mistral-small-latest"

# Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 📁 Struktur Proyek

```text
PTKOM/
├── backend/                        # 🐍 FastAPI Backend
│   ├── main.py                     # Entry point (uvicorn main:app --reload)
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Template environment variables
│   └── app/
│       ├── core/config.py          # Settings & env vars
│       ├── models/schemas.py       # Pydantic request/response models
│       ├── data/seed_foods.py      # Seed data makanan lokal (18 item)
│       ├── services/
│       │   ├── ai_providers/       # 4 AI adapters (Gemini, Groq, Mistral, OpenRouter)
│       │   ├── round_robin.py      # AI round-robin load balancer + failover
│       │   ├── bmr.py              # Kalkulator BMR & AKG (PMK No. 28/2019)
│       │   ├── recommendation.py   # Engine rekomendasi makanan murah & bergizi
│       │   └── nutrition.py        # Open Food Facts + USDA FoodData Central lookup
│       └── api/routes/             # 6 API endpoint handlers
│
├── frontend/                       # ⚡ Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                    # Halaman App Router
│   │   │   └── api/analyze-food/   # Next.js API Route (AI round-robin)
│   │   ├── lib/
│   │   │   ├── ai/                 # AI service layer (round-robin + prompt)
│   │   │   └── supabase/           # Supabase client & server helpers
│   │   └── components/             # UI Components (Tailwind + shadcn)
│   ├── public/                     # Assets statis
│   ├── .env.example                # Template environment variables
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
