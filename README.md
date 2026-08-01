<div align="center">

# 🍜 Kuliner-In

### ✨ Temukan rasa favoritmu di sekitarmu ✨

Platform web berbasis AI untuk menemukan kuliner terdekat, rekomendasi makanan personal, dan resep sesuai preferensi kamu.

![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-6466F1?style=for-the-badge&logo=auth0&logoColor=white)

</div>

---

## 📖 Daftar Isi

- [Tentang](#-tentang)
- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Mulai Cepat](#-mulai-cepat)
- [Struktur Proyek](#-struktur-proyek)
- [API](#-api)
- [Alur Kerja Tim](#-alur-kerja-tim-git)
- [Definition of Done](#-definition-of-done)
- [Deployment](#-deployment)

---

## 🍽️ Tentang

> **Masalah:** Pengguna sering kesulitan menentukan makanan yang sesuai preferensi mereka dan menemukan lokasi kuliner yang relevan tanpa harus mencoba banyak aplikasi berbeda.

Kuliner-In menggabungkan **3 hal dalam satu aplikasi**:

| | | |
|---|---|---|
| 📍 **Kuliner Terdekat** | 🤖 **Rekomendasi AI** | 📖 **Katalog Resep** |
| Temukan tempat makan di sekitarmu lewat peta | Skor kemiripan berbasis preferensi & riwayatmu | Lengkap dengan bahan, langkah, dan waktu masak |

Sistem rekomendasi menggunakan **content-based filtering** — menghitung skor kemiripan (weighted scoring / cosine similarity) antara profil preferensi user dengan katalog makanan & restoran. Semua berjalan langsung di **TypeScript API Route**, tanpa service ML terpisah. 🚀

📄 Dokumentasi lengkap: [PRD](docs/PRD.md) · [SOP](docs/SOP.md)

---

## ✨ Fitur

| Fitur | Deskripsi |
|---|---|
| 🔐 **Autentikasi** | Registrasi, login, logout, dan edit profil dengan Auth.js + bcrypt |
| 🎯 **Preferensi Pengguna** | Tingkat kepedasan, budget, dan kategori makanan favorit (many-to-many) |
| 📍 **Kuliner Terdekat** | Peta OpenStreetMap + Leaflet, filter harga/rating/kategori, tampilkan jarak |
| 🏪 **Detail Tempat** | Foto, menu, harga, lokasi, dan review |
| 📖 **Resep Makanan** | Bahan, langkah memasak, waktu, tingkat kesulitan, kategori (sarapan/makan siang/makan malam/dessert) |
| ⭐ **Sistem Favorit** | Simpan resep & restoran favorit |
| 🕵️ **Riwayat Pencarian** | Mencatat interaksi user sebagai input recommendation engine |
| 🧠 **AI Recommendation** | Top rekomendasi makanan & restoran dipersonalisasi |
| 📱 **Mobile-First** | Responsif di semua perangkat |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Teknologi |
|---|---|
| 🏗️ **Framework** | Next.js 15 (App Router) + TypeScript — fullstack |
| 🎨 **Styling** | Tailwind CSS + shadcn/ui |
| 🗄️ **Database** | PostgreSQL (Neon / Supabase) |
| 📝 **ORM** | Prisma / Drizzle |
| 🔐 **Auth** | Auth.js (NextAuth) credentials + bcrypt |
| 🤖 **Recommendation** | TypeScript content-based filtering (API Route) |
| 🗺️ **Maps** | OpenStreetMap + Leaflet.js |
| 🚀 **Deployment** | Vercel + Neon/Supabase |

</div>

---

## 🚀 Mulai Cepat

### Prasyarat

- [Node.js](https://nodejs.org) 20.x LTS+
- npm / pnpm
- PostgreSQL (Neon / Supabase) — lihat [`ENV.example.md`](ENV.example.md)

### Instalasi

```bash
# 1. Install dependensi
npm install

# 2. Siapkan environment
cp ENV.example.md .env.local   # lalu isi variabel yang dibutuhkan

# 3. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) 🎉

### Script

| Command | Deskripsi |
|---|---|
| `npm run dev` | 🛠️ Development server (Turbopack) |
| `npm run build` | 📦 Build produksi |
| `npm start` | ▶️ Jalankan server produksi |
| `npm run lint` | 🔍 ESLint |
| `npm run format` | ✨ Format dengan Prettier |
| `npm run format:check` | ✅ Cek format |

---

## 📁 Struktur Proyek

```
src/
├── app/                    # 📄 Halaman App Router
│   ├── (auth)/             #    Login & register
│   ├── dashboard/          #    Dashboard
│   ├── nearby-food/        #    Kuliner terdekat + detail
│   ├── recipes/            #    Resep + detail
│   ├── recommendations/    #    Rekomendasi AI
│   ├── favorites/          #    Favorit
│   ├── profile/            #    Profil
│   └── settings/           #    Pengaturan
├── components/             # 🧩 Komponen reusable
├── lib/                    # ⚙️ Utilitas & recommendation engine
├── services/               # 🔌 Layanan API / database
├── hooks/                  # 🪝 Custom hooks
├── types/                  # 🏷️ Tipe TypeScript
└── utils/                  # 🛠️ Helper functions

docs/
├── PRD.md                  # 📋 Product Requirements Document
└── SOP.md                  # 📏 Standard Operating Procedure
```

---

## 🔌 API

**Standard response** — semua endpoint konsisten:

```json
{ "success": true, "message": "Success", "data": {} }
```

```json
{ "success": false, "message": "Something went wrong" }
```

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/register` | 🔐 Registrasi |
| `POST` | `/api/login` | 🔐 Login |
| `POST` | `/api/logout` | 🔐 Logout |
| `GET` | `/api/restaurants` | 📍 Daftar restoran |
| `GET` | `/api/restaurants/{id}` | 📍 Detail restoran |
| `GET` | `/api/recipes` | 📖 Daftar resep |
| `GET` | `/api/recipes/{id}` | 📖 Detail resep |
| `GET` | `/api/recommendations` | 🤖 Rekomendasi AI |
| `POST` | `/api/favorites` | ⭐ Tambah favorit |
| `DELETE` | `/api/favorites/{id}` | ⭐ Hapus favorit |

---

## 🤝 Alur Kerja Tim (Git)

> **⚠️ ATURAN WAJIB**
> 1. **Pull dulu** sebelum mulai kerja
> 2. **DILARANG** push/commit langsung ke `main` — kerja di branch sendiri
> 3. **Wajib buat Pull Request** — minimal 1 reviewer

### Branch Strategy

| Branch | Fungsi |
|---|---|
| `main` | Production. **Dilarang commit/push langsung** — hanya lewat PR |
| `develop` | Integrasi fitur. Perubahan masuk hanya lewat PR |
| `feature/*` | Branch fitur kamu, dibuat dari `develop` |

### Git Flow

```bash
# 1. WAJIB: ambil update terbaru
git checkout develop
git pull origin develop

# 2. Buat branch sendiri (JANGAN pernah di main)
git checkout -b feature/nama-fitur

# 3. Kerjakan & commit (Conventional Commits)
git add .
git commit -m "feat(recipes): add recipe detail page"

# 4. Push ke branch sendiri
git push origin feature/nama-fitur

# 5. Buka Pull Request di GitHub: feature/nama-fitur → develop
```

### Commit Convention

| Tipe | Contoh |
|---|---|
| 🚀 `feat` | `feat(recipes): add recipe detail page` |
| 🐛 `fix` | `fix(auth): login validation error` |
| 📝 `docs` | `docs: update setup guide` |
| ♻️ `refactor` | `refactor(map): optimize location query` |

Mengikuti [Conventional Commits](https://www.conventionalcommits.org/).

---

## ✅ Definition of Done

Sebuah task selesai jika:

- [x] Fitur berjalan sesuai PRD
- [x] Tidak ada error build
- [x] Sudah diuji manual (desktop & mobile)
- [x] Sudah direview tim (PR + 1 reviewer)
- [x] Sudah merge ke `develop`
- [x] Dokumentasi diperbarui

---

## 🚀 Deployment

Proyek dioptimalkan untuk **Vercel**:

1. Push ke GitHub/GitLab/Bitbucket
2. Import proyek di Vercel
3. Vercel otomatis mendeteksi pengaturan Next.js
4. Konfigurasi environment variables (database, auth) di dashboard
5. **Deploy!** 🎉

> Database PostgreSQL menggunakan **Neon / Supabase**. Untuk platform lain: `npm run build` && `npm start`

---

<div align="center">

**Kuliner-In** · Hackathon MVP v1.0 · dibuat dengan ❤️

Temukan rasa favoritmu di sekitarmu. 🍜

</div>
