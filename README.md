# Kuliner-In

> "Temukan rasa favoritmu di sekitarmu."

Kuliner-In adalah platform web berbasis AI untuk membantu pengguna menemukan kuliner terdekat, mendapatkan rekomendasi makanan personal, dan menemukan resep sesuai preferensi mereka.

## Ringkasan

Kuliner-In menggabungkan pencarian kuliner terdekat, rekomendasi makanan berbasis AI, dan katalog resep makanan dalam satu aplikasi terintegrasi. Sistem rekomendasi menggunakan **content-based filtering** yang menghitung skor kemiripan antara profil preferensi user dengan katalog makanan/restoran.

Dokumentasi lengkap produk tersedia di [`docs/PRD.md`](docs/PRD.md) dan prosedur kerja tim di [`docs/SOP.md`](docs/SOP.md).

## Fitur

- ✅ Autentikasi (registrasi, login, logout, edit profil)
- ✅ Preferensi pengguna (tingkat kepedasan, budget, kategori makanan favorit — many-to-many)
- ✅ Kuliner terdekat dengan peta (OpenStreetMap + Leaflet) & filter harga, rating, kategori
- ✅ Detail tempat kuliner (foto, menu, harga, lokasi, review)
- ✅ Katalog resep makanan (bahan, langkah, waktu masak, tingkat kesulitan)
- ✅ Sistem favorit untuk resep & restoran
- ✅ Riwayat pencarian sebagai input recommendation engine
- ✅ AI Recommendation Engine (content-based filtering via TypeScript)
- ✅ Mobile-first & responsif

## Tech Stack

| Layer | Pilihan |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript — fullstack |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Neon / Supabase) |
| ORM | Prisma atau Drizzle |
| Auth | Auth.js (NextAuth) credentials + bcrypt |
| Recommendation Engine | TypeScript di Next.js API Route (content-based filtering) |
| Maps | OpenStreetMap + Leaflet.js |
| Deployment | Vercel + database Neon/Supabase |

## Mulai Cepat

### Prasyarat

- Node.js 20.x LTS
- pnpm atau npm
- PostgreSQL (Neon / Supabase) — lihat `ENV.example.md`

### Instalasi

```bash
# Install dependensi
npm install

# Salin file environment & isi variabel yang dibutuhkan
cp ENV.example.md .env.local

# Jalankan server pengembangan
npm run dev

# Build untuk produksi
npm run build

# Jalankan server produksi
npm start
```

> Jangan commit `.env*` ke repository — pastikan terdaftar di `.gitignore`.

### Script yang Tersedia

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan server pengembangan dengan Turbopack |
| `npm run build` | Build untuk produksi |
| `npm run start` | Jalankan server produksi |
| `npm run lint` | Jalankan ESLint |
| `npm run format` | Format dengan Prettier |
| `npm run format:check` | Periksa format tanpa mengubah file |

## Struktur Proyek

```
src/
├── app/                    # Halaman App Router
│   ├── (auth)/             # Login, register
│   ├── dashboard/          # Dashboard
│   ├── nearby-food/        # Kuliner terdekat + detail
│   ├── recipes/            # Resep + detail
│   ├── recommendations/    # Rekomendasi AI
│   ├── favorites/          # Favorit
│   ├── profile/            # Profil & edit profil
│   └── settings/           # Pengaturan
├── components/             # Komponen yang dapat digunakan ulang
├── lib/                    # Fungsi utilitas & recommendation engine
├── services/               # Layanan API / database
├── hooks/                  # Custom hooks
├── types/                  # Tipe TypeScript
└── utils/                  # Helper functions

docs/
├── PRD.md                  # Product Requirements Document
└── SOP.md                  # Standard Operating Procedure

package.json              # Konfigurasi proyek
next.config.ts            # Konfigurasi Next.js
tsconfig.json             # Konfigurasi TypeScript
eslint.config.mjs         # Konfigurasi ESLint
postcss.config.mjs        # Konfigurasi PostCSS
.prettierrc               # Konfigurasi Prettier
.gitignore                # File Git ignore
```

Arsitektur modular per domain: `auth`, `restaurants`, `recipes`, `recommendations`, `favorites`.

## API Standard

Semua endpoint API wajib mengikuti format response berikut agar konsisten:

**Success response**

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

**Error response**

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

**Endpoint utama:**

- Auth: `POST /api/register`, `POST /api/login`, `POST /api/logout`
- Restaurants: `GET /api/restaurants`, `GET /api/restaurants/{id}`
- Recipes: `GET /api/recipes`, `GET /api/recipes/{id}`
- Recommendations: `GET /api/recommendations`
- Favorites: `POST /api/favorites`, `DELETE /api/favorites/{id}`

## Konvensi Kode

| Elemen | Konvensi | Contoh |
|---|---|---|
| Komponen | PascalCase | `RecipeCard.tsx`, `RestaurantCard.tsx` |
| Fungsi | camelCase | `getRecipes()`, `getNearbyRestaurants()` |
| Konstanta | UPPER_CASE | `MAX_DISTANCE`, `DEFAULT_RADIUS`, `API_TIMEOUT` |

- Gunakan mode strict di `tsconfig.json`
- Jalankan `npm run lint` dan `npm run format` sebelum commit
- Gunakan alias `@/` untuk import dari `src/`

## Alur Kerja Tim (Git)

### Branch Strategy

| Branch | Fungsi |
|---|---|
| `main` | Production branch. Tidak boleh commit langsung. |
| `develop` | Branch integrasi seluruh fitur. |
| `feature/*` | Branch fitur, dibuat dari `develop`. |

Contoh: `feature/auth`, `feature/recipes`, `feature/maps`, `feature/recommendation-ai`

### Git Flow

```bash
# Ambil update terbaru
git checkout develop
git pull origin develop

# Buat branch fitur
git checkout -b feature/nama-fitur

# Commit dengan Conventional Commits
git add .
git commit -m "feat(recipes): add recipe detail page"

# Push & buka PR ke develop
git push origin feature/nama-fitur
```

Alur merge: `feature/*` → `develop` → `main`

### Commit Convention

Mengikuti [Conventional Commits](https://www.conventionalcommits.org/):

| Tipe | Contoh |
|---|---|
| Feature | `feat(recipes): add recipe detail page` |
| Fix | `fix(auth): login validation error` |
| Documentation | `docs: update setup guide` |
| Refactor | `refactor(map): optimize location query` |

### Pull Request Rules

Setiap PR wajib berisi: deskripsi perubahan, detail perubahan, hasil testing (desktop & mobile), dan screenshot. Minimal **1 reviewer** wajib approve sebelum di-merge ke `develop`.

## Definition of Done

Sebuah task dianggap selesai jika:

- ✅ Fitur berjalan sesuai PRD
- ✅ Tidak ada error build
- ✅ Sudah diuji manual (desktop & mobile)
- ✅ Sudah direview tim
- ✅ Sudah merge ke `develop`
- ✅ Dokumentasi diperbarui

## Deployment

Proyek dioptimalkan untuk deployment di **Vercel**:

1. Push ke GitHub/GitLab/Bitbucket
2. Import proyek di Vercel
3. Vercel otomatis mendeteksi pengaturan Next.js
4. Konfigurasi environment variables (database, auth) di dashboard Vercel
5. Deploy!

Database PostgreSQL menggunakan Neon / Supabase. Untuk platform lain, jalankan `npm run build` dan `npm start`.

## Dukungan

Untuk pertanyaan atau dukungan, silakan hubungi tim pengembangan.
