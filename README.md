<div align="center">

# 🥗 GiziKost

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
- [Tech Stack](#-tech-stack)
- [Mulai Cepat](#-mulai-cepat)
- [Struktur Proyek](#-struktur-proyek)
- [Alur Kerja Tim](#-alur-kerja-tim)

---

## 🍽️ Tentang

**GiziKost** hadir untuk memecahkan masalah anak kost yang memiliki budget makan terbatas namun ingin tetap menjaga asupan gizi. 

Cukup dengan memfoto makanan, GiziKost akan mengenali jenis makanan, menghitung kalori & makronutrisi, serta mencocokkannya dengan kebutuhan harianmu. Jika ada nutrisi yang kurang, GiziKost akan merekomendasikan tambahan makanan murah (seperti tempe/tahu) yang bisa dibeli di warteg/kantin sekitar!

Aplikasi ini 100% menggunakan teknologi **Gratis** (Free Tier) dan mengandalkan sistem **AI Round-Robin Load Balancer** (mendistribusikan *request* pemindaian gambar ke berbagai *provider* seperti Gemini, Groq, dan Mistral agar tetap berada di batas gratis tiap *provider*).

📄 Dokumentasi lengkap: [PRD](docs/PRD.md)

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
| 🏗️ **Frontend** | Next.js 15 (App Router) + React 19 |
| 🎨 **Styling** | Tailwind CSS + shadcn/ui |
| 🤖 **AI Engine** | Gemini (3.5 Flash), Groq (Qwen 3.8), Mistral (Small) via Round-Robin |
| 🗄️ **Database & Auth** | Supabase (PostgreSQL) + Supabase Storage |
| 🚀 **Deployment** | Vercel / Netlify |

</div>

---

## 🚀 Mulai Cepat

### Prasyarat

- [Node.js](https://nodejs.org) 20.x LTS+
- npm / pnpm

### Instalasi

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Install dependensi
npm install

# 3. Siapkan environment variables
cp .env.example .env.local

# 4. Tambahkan API Keys di .env.local (Supabase, Gemini, Groq, Mistral)

# 5. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Struktur Proyek

```text
frontend/
├── src/
│   ├── app/                    # Halaman App Router (Home, Scan, Riwayat)
│   ├── components/             # UI Components (Tailwind + shadcn)
│   ├── lib/                    # Service layer (AI Round-Robin, Utils)
│   └── types/                  # TypeScript Types
├── public/                     # Assets statis
└── .env.local                  # Environment variables (JANGAN DI-COMMIT)
docs/
└── PRD.md                      # Product Requirements Document GiziKost
```

---

## 🤝 Alur Kerja Tim

> **⚠️ ATURAN WAJIB**
> 1. **Pull dulu** sebelum mulai kerja (`git pull origin develop`)
> 2. **DILARANG** push langsung ke `main` — kerja di branch fitur masing-masing.
> 3. **Wajib buat Pull Request** untuk menggabungkan kode.

### Branch Strategy

- `main` : Production. Dilarang commit/push langsung.
- `develop` : Integrasi fitur.
- `feature/*` : Branch fitur dari develop (contoh: `feature/ai-scanner`).

---

<div align="center">

**GiziKost** — Makan Sehat, Sesuai Budget Kost! 🥗

</div>
