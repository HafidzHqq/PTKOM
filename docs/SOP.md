# SOP Repository — Kuliner-In (Next.js + Python ML)

## Daftar Isi
1. [Tech Stack](#1-tech-stack)
2. [Prasyarat](#2-prasyarat)
3. [Struktur Repository](#3-struktur-repository)
4. [Menjalankan Project Secara Lokal](#4-menjalankan-project-secara-lokal)
5. [Branch Strategy](#5-branch-strategy)
6. [Git Flow](#6-git-flow)
7. [Commit Convention](#7-commit-convention)
8. [API Standard](#8-api-standard)
9. [Environment Variables](#9-environment-variables)
10. [Code Style](#10-code-style)
11. [Pull Request Rules](#11-pull-request-rules)
12. [Testing](#12-testing)
13. [Definition of Done](#13-definition-of-done)

---

## 1. Tech Stack

**Frontend & Backend**
- Next.js 16
- TypeScript
- Tailwind CSS
- Shadcn/UI

**Machine Learning**
- Python
- FastAPI
- Scikit-learn

**Database**
- PostgreSQL (Supabase)

---

## 2. Prasyarat

Sebelum mulai, pastikan sudah terinstall:

| Tool | Versi minimum | Untuk |
|---|---|---|
| Node.js | 20.x LTS | `apps/web` |
| pnpm / npm | terbaru | package manager |
| Python | 3.11+ | `apps/ml-service` |
| Docker & Docker Compose | terbaru | menjalankan service secara terisolasi |
| Git | terbaru | version control |

---

## 3. Struktur Repository

### Monorepo

```
kuliner-in/
│
├── apps/
│   ├── web/                 # Next.js
│   └── ml-service/          # FastAPI
│
├── docs/
│   ├── PRD.md
│   ├── SOP.md
│   └── API.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

### Struktur Next.js (`apps/web/`)

```
apps/web/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── recipes/
│   │   ├── restaurants/
│   │   ├── recommendations/
│   │   └── profile/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   ├── types/
│   └── utils/
│
├── public/
└── package.json
```

### Struktur ML Service (`apps/ml-service/`)

```
apps/ml-service/
│
├── app/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── training/
│   └── schemas/
│
├── datasets/
├── tests/
├── main.py
└── requirements.txt
```

---

## 4. Menjalankan Project Secara Lokal

**Opsi A — via Docker Compose (disarankan)**
```bash
docker-compose up --build
```
Menjalankan `apps/web` dan `apps/ml-service` sekaligus, terhubung ke PostgreSQL (Supabase) sesuai konfigurasi di `.env`.

**Opsi B — manual, per service**
```bash
# Next.js
cd apps/web
pnpm install
pnpm dev

# ML Service
cd apps/ml-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 5. Branch Strategy

**Branch Utama**

| Branch | Fungsi |
|---|---|
| `main` | Production branch. **DILARANG commit atau push langsung** — perubahan masuk hanya lewat PR. |
| `develop` | Branch integrasi seluruh fitur. Perubahan masuk hanya lewat PR dari `feature/*`. |

**Feature Branch**

Format:
```
feature/nama-fitur
```

Contoh:
```
feature/auth
feature/recipes
feature/maps
feature/recommendation-ai
feature/profile
```

---

## 6. Git Flow

> **⚠️ ATURAN WAJIB (harus dipatuhi):**
> 1. **Wajib pull sebelum mulai kerja.** Selalu ambil update terbaru dari `develop` terlebih dahulu agar tidak terjadi konflik.
> 2. **DILARANG push/commit langsung ke `main`.** Setiap pekerjaan wajib dikerjakan di branch sendiri (`feature/*`).
> 3. **Wajib buat pull request (PR)** dari branch fitur ke `develop` setelah selesai — jangan pernah merge sendiri tanpa PR dan approval reviewer.

**Ambil update (WAJIB sebelum mulai kerja)**
```bash
git checkout develop
git pull origin develop
```

**Buat branch sendiri (jangan pernah bekerja langsung di main)**
```bash
git checkout -b feature/recipes
```

**Push ke branch sendiri**
```bash
git push origin feature/recipes
```

**Buat pull request**
```
Setelah push, buka PR di GitHub: feature/nama-fitur → develop
```

**Merge**
```
feature/* → develop (via PR + approval reviewer)
develop   → main   (via PR/release)
```

---

## 7. Commit Convention

Mengikuti [Conventional Commits](https://www.conventionalcommits.org/).

| Tipe | Contoh |
|---|---|
| Feature | `feat(recipes): add recipe detail page` |
| Fix | `fix(auth): login validation error` |
| Documentation | `docs: update setup guide` |
| Refactor | `refactor(map): optimize location query` |

---

## 8. API Standard

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

Semua endpoint API (baik dari Next.js API Routes maupun FastAPI ML Service) wajib mengikuti format response di atas agar konsisten di sisi frontend.

---

## 9. Environment Variables

**Next.js (`apps/web/.env`)**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ML_SERVICE_URL=
```

**FastAPI (`apps/ml-service/.env`)**
```
DATABASE_URL=
MODEL_PATH=
```

> File `.env` tidak boleh di-commit ke repository. Gunakan `.env.example` sebagai referensi variabel yang dibutuhkan, dan pastikan `.env` sudah terdaftar di `.gitignore`.

---

## 10. Code Style

| Elemen | Konvensi | Contoh |
|---|---|---|
| Component | PascalCase | `RecipeCard.tsx`, `RestaurantCard.tsx` |
| Function | camelCase | `getRecipes()`, `getNearbyRestaurants()`, `getRecommendations()` |
| Constants | UPPER_CASE | `MAX_DISTANCE`, `DEFAULT_RADIUS`, `API_TIMEOUT` |

---

## 11. Pull Request Rules

> **⚠️ Wajib PR:** Dilarang merge/commit langsung ke `main` atau `develop`. Semua perubahan harus melalui PR yang di-approve minimal 1 reviewer.

Setiap PR wajib berisi template berikut:

```markdown
## Deskripsi
Menambahkan halaman resep.

## Perubahan
- Recipe list
- Recipe detail
- API integration

## Testing
- Desktop
- Mobile

## Screenshot
(lampirkan)
```

Minimal **1 reviewer** wajib approve sebelum PR di-merge ke `develop`.

---

## 12. Testing

- **Frontend:** pengujian manual di desktop & mobile viewport sebelum PR diajukan (lihat template PR di atas).
- **ML Service:** unit test untuk fungsi scoring/recommendation ditaruh di `apps/ml-service/tests/`, dijalankan dengan `pytest` sebelum merge ke `develop`.
- **Integrasi:** pastikan `docker-compose up` berjalan tanpa error sebelum merge ke `main`.

---

## 13. Definition of Done

Sebuah task dianggap selesai jika:

- Fitur berjalan sesuai PRD
- Tidak ada error build
- Sudah diuji manual
- Sudah direview tim
- Sudah merge ke `develop`
- Dokumentasi diperbarui