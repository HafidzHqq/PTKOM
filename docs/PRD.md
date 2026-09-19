# PRD — Kuliner-In
**Sistem Rekomendasi Kuliner Terpersonalisasi Berbasis Preferensi, Lokasi, dan Nilai Gizi Menggunakan Machine Learning**

## 1. Informasi Produk

| | |
|---|---|
| **Nama Produk** | Kuliner-In |
| **Tagline** | "Temukan rasa favoritmu dan penuhi gizi harianmu." |
| **Versi** | v1.0 (MVP) |
| **Jenis Produk** | Platform web berbasis Machine Learning (ML) untuk membantu pengguna menemukan kuliner terdekat, mendapatkan rekomendasi makanan personal dengan informasi nilai gizi, dan menemukan resep sesuai preferensi mereka. |

---

## 2. Latar Belakang

Banyak pengguna mengalami beberapa masalah:

- Bingung menentukan makanan yang ingin dimakan.
- Kesulitan menemukan tempat makan yang sesuai dengan selera dan budget.
- Kesadaran akan kesehatan meningkat, namun sulit mengetahui estimasi nilai gizi (kalori, protein, dll) dari makanan yang akan dibeli atau dimasak.
- Aplikasi kuliner saat ini umumnya hanya menampilkan daftar restoran tanpa personalisasi berbasis AI/ML yang kuat dan kurang memperhatikan aspek gizi.

Kuliner-In hadir sebagai platform yang menggabungkan pencarian kuliner terdekat (termasuk fokus area spesifik seperti Bekasi/sekitarnya), rekomendasi makanan cerdas berbasis Machine Learning, serta sajian informasi nilai gizi dalam satu aplikasi terintegrasi.

---

## 3. Tujuan Produk

**Tujuan Utama**
Membantu pengguna menemukan makanan yang sesuai dengan lokasi, selera, budget, preferensi kuliner, serta memberikan informasi terkait nilai gizi dari makanan tersebut.

**Tujuan Bisnis**
- Meningkatkan engagement pengguna yang peduli dengan gaya hidup sehat maupun pencarian kuliner praktis.
- Menjadi platform discovery kuliner utama berbasis Machine Learning.
- Menjadi jembatan antara UMKM kuliner dan pelanggan.

---

## 4. Target Pengguna & Peran (User Roles)

Sistem ini memiliki tiga peran (role) utama untuk mendukung ekosistem aplikasi:

**1. Regular User (Pengguna / Pelanggan)**
- **Deskripsi:** Pengguna akhir yang mencari makanan atau resep.
- **Aktivitas Utama:** Mencari tempat makan, melihat rekomendasi makanan dan nilai gizi, menyimpan restoran/resep favorit, serta memberikan ulasan (review).
- **Persona:** Mahasiswa (fokus budget), Pekerja Kantoran (fokus gizi/kecepatan), Pecinta Kuliner (fokus eksplorasi).

**2. Mitra (Pemilik Kedai / Restoran)**
- **Deskripsi:** Pemilik usaha kuliner yang mendaftarkan usahanya ke platform.
- **Aktivitas Utama:** Mengelola profil restoran, menambahkan menu makanan beserta harganya, dan menginput/memperbarui estimasi nilai gizi dari menu mereka.

**3. Admin Utama**
- **Deskripsi:** Pengelola sistem internal aplikasi.
- **Aktivitas Utama:** Memverifikasi pendaftaran restoran mitra, mengelola database resep makanan standar, serta memonitor aktivitas pengguna dan performa sistem.

---

## 5. Problem Statement

> Pengguna sering kesulitan menentukan makanan yang sesuai dengan preferensi, budget, dan kebutuhan gizi mereka, serta butuh sistem yang cerdas untuk memberikan rekomendasi makanan dan lokasi terdekat tanpa harus repot mencari secara manual.

---

## 6. Solusi

- Sistem rekomendasi makanan menggunakan model Machine Learning.
- Informasi estimasi nilai gizi (kalori, makronutrien) untuk setiap makanan dan resep.
- Peta kuliner terdekat untuk menemukan rekomendasi di lokasi pengguna.
- Personalisasi yang mempertimbangkan preferensi rasa, budget, kebutuhan gizi, dan riwayat aktivitas.

---

## 7. Ruang Lingkup MVP

### Authentication & Role Management
Registrasi, Login, Logout, Edit profil dengan sistem otorisasi berdasarkan *role* (User, Mitra, Admin).

### Preferensi Pengguna
Pengguna (Regular User) memilih:
- Tingkat kepedasan
- Budget maksimal
- Kategori makanan favorit (Nusantara, Jepang, Korea, Barat, Seafood, dll.)
- Preferensi gizi / diet (misal: batasan kalori harian) - *opsional*

### Kuliner Terdekat
Menampilkan nama tempat, alamat, rating, jam operasional, jarak dari pengguna. Filter: harga, rating, kategori, dan kalori.

### Detail Makanan & Tempat Kuliner
Foto, menu, harga, lokasi, review, serta **Estimasi Nilai Gizi** (Kalori, Karbohidrat, Protein, Lemak) pada menu yang direkomendasikan. Mitra dapat mengelola data ini untuk restorannya sendiri.

### Resep Makanan
Nama resep, bahan, langkah memasak, waktu memasak, tingkat kesulitan, dan **Kandungan Gizi per porsi**. (Dikelola oleh Admin).

### Sistem Favorit
User dapat menyimpan resep dan restoran/menu favorit.

### User Activity Tracking
Sistem secara aktif mencatat interaksi pengguna sebagai data latih ML, meliputi:
- **Search:** Kata kunci yang dicari.
- **View:** Melihat detail menu, resep, atau restoran.
- **Interaction:** Like (simpan ke favorit), Review, atau Skip (mengabaikan rekomendasi).

### Recommendation Engine (Machine Learning)
**Input:** preferensi user, data *User Activity Tracking* (riwayat pencarian, view, favorit), dan filter gizi.
**Output:** top rekomendasi makanan/menu, top rekomendasi restoran yang relevan.

---

## 8. Fitur Machine Learning

**Tujuan:** Mempersonalisasi rekomendasi makanan dan menyortir menu berdasarkan kecocokan preferensi, lokasi, dan kebutuhan gizi.

**Metode:** Content-Based Filtering dan/atau Collaborative Filtering menggunakan model Machine Learning (misalnya menggunakan Scikit-learn atau TensorFlow di Python). Model akan mempelajari pola kesukaan pengguna berdasarkan fitur makanan (kategori, harga, gizi, kepedasan) dan data historis aktivitas (User Activity).

**Contoh input (user profile & preference):**

| Field | Contoh |
|---|---|
| Budget | 20000 |
| Pedas | Ya |
| Kalori Maksimal | 600 kcal |
| Nusantara | Ya |

**Contoh input (User Activity Tracking):**

| Aktivitas | Suka/Interaksi? |
|---|---|
| View & Like Ayam Bakar (400 kcal) | Ya |
| Skip Seblak Jeletot (700 kcal) | Ya (Di-skip) |

**Contoh output:**
Sistem memprediksi pengguna menyukai makanan Nusantara berkalori sedang-rendah, sehingga merekomendasikan: *Soto Ayam (350 kcal)*, *Gado-Gado (400 kcal)*, atau *Ikan Bakar (300 kcal)* di restoran/kedai terdekat.

---

## 9. User Flow

**1. Regular User:** Landing Page → Register/Login → Pilih Preferensi → Dashboard → Cari Kuliner / Resep → Sistem mencatat *User Activity* → Dashboard menampilkan Rekomendasi ML hasil pemrosesan aktivitas.

**2. Mitra Restoran:** Landing Page → Register/Login sebagai Mitra → Verifikasi Admin → Dashboard Mitra → Tambah/Kelola Restoran → Tambah Menu & Nilai Gizi.

**3. Admin:** Login Admin → Dashboard Admin → Approve Mitra Baru / Kelola Resep Makanan → Pantau Metrik Sistem.

---

## 10. Struktur Proyek & Sitemap

Pengembangan sistem dipisah secara struktur folder antara Frontend dan Backend untuk modularitas dan skalabilitas (*Decoupled Architecture*).

**Struktur Direktori:**
```
/kuliner-in
├── /frontend         # Aplikasi Web (Next.js / React)
│   ├── /src/app      # UI, Pages, Components
│   └── ...
└── /backend          # API Server & Machine Learning
    ├── /api          # Endpoint CRUD (Node.js/Express atau Python/FastAPI)
    └── /ml-service   # Recommendation Engine (Python)
```

**Sitemap (Frontend):**
```
/
├── auth
│   ├── login
│   └── register
│
├── user-dashboard (Regular User)
│   ├── nearby-food (detail, menu, nilai gizi)
│   ├── recipes
│   ├── recommendations (ML)
│   ├── favorites
│   └── profile & settings
│
├── mitra-dashboard (Mitra)
│   ├── manage-restaurant
│   ├── manage-menus (input harga & gizi)
│   └── reviews
│
└── admin-dashboard (Admin)
    ├── verify-mitra
    ├── manage-recipes
    └── system-metrics
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
| role | text (enum: 'user', 'mitra', 'admin') |
| created_at | timestamp |

**preferences** *(hanya untuk role = user)*
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| user_id | uuid, FK → users |
| budget | integer |
| spicy_level | text/enum |
| max_calories | integer, nullable |

**preference_categories**
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| user_id | uuid, FK → users |
| category | text |

**restaurants**
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| owner_id | uuid, FK → users (role: mitra) |
| name | text |
| address | text |
| latitude | numeric |
| longitude | numeric |
| rating | numeric |
| is_verified | boolean |

**menus** *(tabel untuk menyimpan detail makanan dan gizi per restoran)*
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| restaurant_id | uuid, FK → restaurants |
| name | text |
| price | integer |
| nutrition_info | jsonb (kalori, protein, lemak, karbo) |

**recipes**
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| title | text |
| ingredients | jsonb |
| steps | jsonb |
| nutrition_info | jsonb (kalori, protein, lemak, karbo) |
| created_by | uuid, FK → users (role: admin) |

**favorites**
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| user_id | uuid, FK → users |
| restaurant_id | uuid, nullable |
| menu_id | uuid, nullable |
| recipe_id | uuid, nullable |

**user_activities** *(input dataset utama untuk Machine Learning)*
| Kolom | Tipe |
|---|---|
| id | uuid, PK |
| user_id | uuid, FK → users |
| activity_type | text (enum: 'search', 'view_menu', 'view_recipe', 'like', 'skip') |
| target_id | uuid (ID dari restoran/menu/resep yang berinteraksi), nullable |
| query_value | text (untuk kata kunci pencarian), nullable |
| created_at | timestamp |

---

## 12. API Endpoint

**Authentication & Users**
- `POST /api/auth/register`
- `POST /api/auth/login`

**Mitra & Restaurants**
- `POST /api/mitra/restaurants` (Register restoran)
- `POST /api/mitra/restaurants/{id}/menus` (Tambah/edit menu dan gizi)
- `GET /api/restaurants`
- `GET /api/restaurants/{id}/menus`

**Recipes**
- `GET /api/recipes`
- `POST /api/admin/recipes` (Tambah resep oleh admin)

**User Activities & Recommendations**
- `POST /api/activities` (Mencatat event dari frontend: view, click, dll)
- `GET /api/recommendations` *(Endpoint rekomendasi yang didukung ML)*

**Favorites**
- `POST /api/favorites`
- `DELETE /api/favorites/{id}`

---

## 13. Tech Stack

| Layer | Pilihan |
|---|---|
| **Frontend** | **Next.js 15 (App Router)** + TypeScript (Terletak di folder `/frontend`) |
| Styling | Tailwind CSS + shadcn/ui |
| **Backend API** | **Node.js (Express.js / NestJS)** atau **Python (FastAPI)** (Terletak di folder `/backend`) |
| **Machine Learning** | **Python (FastAPI / Flask)** + Scikit-Learn / TensorFlow |
| Database | PostgreSQL (Neon / Supabase) |
| ORM | Prisma / Drizzle (Node.js) atau SQLAlchemy (Python) |
| Auth | JWT Authentication (Custom atau via Auth.js / penyedia pihak ketiga) |
| Maps | OpenStreetMap + Leaflet.js |

---

## 14. Non-Functional Requirements

**Arsitektur Terpisah (*Decoupled*):**
- Frontend (`/frontend`) dan Backend (`/backend`) berjalan di servis yang berbeda. Hal ini memastikan frontend murni berfokus pada UI, dan backend fokus memproses logika bisnis serta ML.

**Performance:** Response API < 2 detik, inferensi ML < 500ms.
**Security:** Password hashing, JWT, otorisasi berbasis Role (RBAC), rate limiting.
**Scalability:** Arsitektur terpisah ini memungkinkan backend API, ML service, dan frontend di-*scale up* secara independen berdasarkan beban *traffic*.

---

## 15. KPI Produk

**KPI Produk**
- 100 pengguna uji coba
- 10 Mitra/Restoran terdaftar di fase awal
- 70% pengguna mencoba rekomendasi makanan ML
- 50% pengguna memanfaatkan informasi nilai gizi

**KPI Teknis**
- API uptime > 95%
- Akurasi atau relevansi rekomendasi ML > 80%

---

## 16. Roadmap Pengerjaan

**Hari 1**
- Setup struktur repository (pembuatan folder `/frontend` dan `/backend`)
- Inisiasi DB PostgreSQL
- UI/UX Landing Page, Login/Register di Frontend
- Pengembangan ML Model awal di Backend (Python)

**Hari 2**
- Pembuatan API CRUD (Auth, Restoran, Resep) di Backend
- Integrasi Dashboard Mitra, Nearby Food, & Recipes di Frontend

**Hari 3**
- Integrasi Frontend dengan API Python ML (Sistem Rekomendasi)
- Testing API terintegrasi, perbaikan bug, deployment (Vercel untuk Frontend, Railway/Render untuk Backend)
- Pitch deck & demo

---

## 17. Elevator Pitch

Kuliner-In adalah platform web cerdas yang mendisrupsi cara orang mencari makanan. Dengan memanfaatkan Machine Learning, Kuliner-In tidak sekadar menampilkan tempat makan, tapi merekomendasikan makanan yang paling cocok dengan selera, budget, dan bahkan memberikan informasi **Nilai Gizi** (kalori, protein, dll). Platform ini juga memberdayakan UMKM melalui dashboard mitra, sehingga cocok untuk mereka yang ingin makan enak, hemat, sadar kesehatan, sekaligus memajukan bisnis kuliner lokal!