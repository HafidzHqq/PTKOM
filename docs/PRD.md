# PRD — Kuliner-In

## 1. Informasi Produk

| | |
|---|---|
| **Nama Produk** | Kuliner-In |
| **Tagline** | "Temukan rasa favoritmu di sekitarmu." |
| **Versi** | v1.0 (Hackathon MVP) |
| **Jenis Produk** | Platform web berbasis AI untuk membantu pengguna menemukan kuliner terdekat, mendapatkan rekomendasi makanan personal, dan menemukan resep sesuai preferensi mereka. |

---

## 2. Latar Belakang

Banyak pengguna mengalami beberapa masalah:

- Bingung menentukan makanan yang ingin dimakan.
- Kesulitan menemukan tempat makan yang sesuai dengan selera dan budget.
- Sulit menemukan resep yang sesuai dengan makanan yang mereka sukai.
- Aplikasi kuliner saat ini umumnya hanya menampilkan daftar restoran tanpa personalisasi.

Kuliner-In hadir sebagai platform yang menggabungkan pencarian kuliner terdekat, rekomendasi makanan berbasis AI, dan katalog resep makanan dalam satu aplikasi terintegrasi.

---

## 3. Tujuan Produk

**Tujuan Utama**
Membantu pengguna menemukan makanan yang sesuai dengan lokasi, selera, budget, dan preferensi kuliner.

**Tujuan Bisnis**
- Meningkatkan engagement pengguna
- Menjadi platform discovery kuliner berbasis AI
- Menjadi jembatan antara UMKM kuliner dan pelanggan

---

## 4. Target Pengguna

**Persona 1 — Mahasiswa**
Andi, 20 tahun. Budget terbatas, bingung mau makan apa, sering cari tempat makan murah. Butuh rekomendasi murah dan lokasi dekat kampus.

**Persona 2 — Pekerja**
Sarah, 27 tahun. Tidak punya waktu mencari makanan. Butuh rekomendasi cepat dan tempat makan dekat kantor.

**Persona 3 — Pecinta Kuliner**
Budi, 25 tahun. Ingin mencoba makanan baru. Butuh rekomendasi unik dan resep makanan.

---

## 5. Problem Statement

> Pengguna sering kesulitan menentukan makanan yang sesuai dengan preferensi mereka dan menemukan lokasi kuliner yang relevan tanpa harus mencoba banyak aplikasi berbeda.

---

## 6. Solusi

- Sistem rekomendasi makanan berbasis AI (content-based filtering)
- Peta kuliner terdekat
- Koleksi resep makanan
- Personalisasi berdasarkan preferensi pengguna

---

## 7. Ruang Lingkup MVP

### Authentication
Registrasi, Login, Logout, Edit profil.

### Preferensi Pengguna
Pengguna memilih:
- Tingkat kepedasan
- Budget
- Jenis makanan favorit (pedas, manis, gurih, dst.)
- Kategori makanan favorit — **many-to-many**, user bisa pilih lebih dari satu kategori (Nusantara, Jepang, Korea, Barat, Seafood, dst.)

### Kuliner Terdekat
Menampilkan nama tempat, alamat, rating, jam operasional, jarak dari pengguna. Filter: harga, rating, kategori.

### Detail Tempat Kuliner
Foto, menu, harga, lokasi, review.

### Resep Makanan
Nama resep, bahan, langkah memasak, waktu memasak, tingkat kesulitan. Kategori: sarapan, makan siang, makan malam, dessert.

### Sistem Favorit
User dapat menyimpan resep dan restoran favorit.

### Riwayat Pencarian
Sistem mencatat riwayat pencarian & interaksi user (pencarian kategori, tempat/resep yang dibuka) sebagai salah satu input recommendation engine.

### AI Recommendation Engine
**Input:** preferensi user, riwayat pencarian, riwayat favorit
**Output:** top rekomendasi makanan, top rekomendasi restoran

---

## 8. Fitur Machine Learning

**Tujuan:** Mempersonalisasi rekomendasi makanan.

**Metode:** Content-Based Filtering — menggunakan kategori makanan, harga, dan tingkat kepedasan untuk menghitung skor kemiripan (weighted scoring / cosine similarity) antara profil preferensi user dan katalog makanan/restoran.

**Contoh input (user preference):**

| Field | Contoh |
|---|---|
| Budget | 20000 |
| Pedas | Ya |
| Seafood | Tidak |
| Nusantara | Ya |

**Contoh input (activity):**

| Aktivitas | Suka? |
|---|---|
| Like Bakso | Ya |
| Like Soto | Ya |
| Like Seblak | Tidak |

**Contoh output:**
User suka Soto, Bakso, Rawon → direkomendasikan Sop Iga, Tongseng, Coto Makassar.

> **Catatan implementasi:** Karena metode yang dipakai adalah content-based filtering sederhana (bukan deep learning), logika ini ditulis langsung sebagai fungsi scoring di TypeScript, berjalan di dalam Next.js API Route — tidak memerlukan service Python/Scikit-learn terpisah. Ini menyederhanakan deployment untuk timeline hackathon 3 hari (satu codebase, satu platform deploy).

---

## 9. User Flow

**Registrasi:** Landing Page → Register → Pilih Preferensi → Dashboard

**Cari Kuliner:** Dashboard → Cari Kuliner → Filter → Pilih Tempat → Detail Tempat

**Cari Resep:** Dashboard → Cari Resep → Detail Resep → Simpan Favorit

**Recommendation:** Dashboard → Rekomendasi → Daftar Makanan → Detail Tempat / Resep

---

## 10. Sitemap

```
/
├── login
├── register
├── dashboard
│
├── nearby-food
│   └── detail
│
├── recipes
│   └── detail
│
├── recommendations
│
├── favorites
│
├── profile
│
└── settings
```

---

## 11. Database Design (PostgreSQL)

**users**
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| name | text |
| email | text, unique |
| password_hash | text |
| created_at | timestamp |
| updated_at | timestamp |

**preferences**
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| user_id | uuid, FK → users |
| budget | integer |
| spicy_level | text/enum |

**preference_categories** *(baru — many-to-many kategori favorit)*
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| user_id | uuid, FK → users |
| category | text |

**restaurants**
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| name | text |
| address | text |
| latitude | numeric |
| longitude | numeric |
| rating | numeric |
| price_range | text |

**recipes**
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| title | text |
| description | text |
| ingredients | jsonb |
| steps | jsonb |
| cooking_time | integer |
| difficulty | text |

**favorites**
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| user_id | uuid, FK → users |
| restaurant_id | uuid, FK → restaurants, nullable |
| recipe_id | uuid, FK → recipes, nullable |

> **Constraint:** `CHECK (restaurant_id IS NOT NULL OR recipe_id IS NOT NULL)` — salah satu wajib diisi, tidak boleh dua-duanya kosong.

**search_history** *(baru — input untuk recommendation engine)*
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| user_id | uuid, FK → users |
| query_type | text (category / restaurant / recipe) |
| query_value | text |
| created_at | timestamp |

**reviews**
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| user_id | uuid, FK → users |
| restaurant_id | uuid, FK → restaurants |
| rating | integer |
| comment | text |

---

## 12. API Endpoint

**Authentication**
- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`

**Restaurants**
- `GET /api/restaurants`
- `GET /api/restaurants/{id}`

**Recipes**
- `GET /api/recipes`
- `GET /api/recipes/{id}`

**Recommendations**
- `GET /api/recommendations`

**Favorites**
- `POST /api/favorites`
- `DELETE /api/favorites/{id}`

---

## 13. Tech Stack

| Layer | Pilihan |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript — fullstack (frontend & backend jadi satu) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Neon / Supabase) |
| ORM | Prisma atau Drizzle |
| Auth | Auth.js (NextAuth) credentials provider + bcrypt untuk hashing password |
| Recommendation Engine | TypeScript, dijalankan di Next.js API Route (content-based filtering manual) |
| Maps | OpenStreetMap + Leaflet.js |
| Deployment | Vercel (frontend + API routes), database di Neon/Supabase |

> **Perubahan dari draft sebelumnya:** backend terpisah (Laravel 12 + Sanctum) dan recommendation service Python/Scikit-learn dihapus, digabung menjadi satu codebase Next.js fullstack untuk mempercepat development dalam timeline 3 hari.

---

## 14. Non-Functional Requirements

**Performance:** Response < 2 detik, mobile-first.
**Security:** Password hashing (bcrypt), session/JWT via Auth.js, rate limiting pada API routes.
**Scalability:** REST API, arsitektur modular per domain (auth, restaurants, recipes, recommendations, favorites).

---

## 15. KPI Hackathon

**KPI Produk**
- 100 pengguna uji coba
- 70% pengguna mencoba rekomendasi AI
- 50% pengguna menyimpan favorit

**KPI Teknis**
- API uptime > 95%
- Error rate < 5%

---

## 16. Roadmap Pengerjaan Hackathon

**Hari 1**
- Setup project Next.js + Prisma/Drizzle + PostgreSQL
- Landing Page, Login/Register, Dashboard
- Schema database & authentication
- Dataset makanan awal + fungsi scoring recommendation engine (TS)

**Hari 2**
- Nearby Food page + integrasi Leaflet/OpenStreetMap
- Recipe page
- API routes: restaurants, recipes, favorites
- Integrasi recommendation engine ke UI

**Hari 3**
- Testing & bug fix
- Deployment ke Vercel + Neon/Supabase
- Pitch deck & demo video

---

## 17. Elevator Pitch

Kuliner-In adalah platform pencarian kuliner berbasis AI yang membantu pengguna menemukan makanan terbaik berdasarkan lokasi, preferensi, dan kebiasaan mereka. Dengan menggabungkan peta kuliner, resep makanan, dan sistem rekomendasi cerdas, Kuliner-In memberikan pengalaman menemukan makanan yang lebih personal, cepat, dan relevan dibandingkan platform kuliner tradisional.