import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyAndAnalyzeRecipeWithAI } from "@/lib/ai/recipeAnalysis";

const INITIAL_RECIPES = [
  {
    title: "Nasi Liwet Rice Cooker Spesial Kost",
    description: "Resep nasi liwet harum gurih praktis dibuat di rice cooker kamar kost dengan aroma serai dan daun salam.",
    category: "Rice Cooker",
    cookTimeMinutes: 30,
    portions: 2,
    estimatedCost: 14000,
    imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "2 cup beras putih",
      "50g teri medan / asin goreng",
      "4 siung bawang merah iris",
      "2 batang serai memarkan",
      "3 lembar daun salam",
      "5 buah cabai rawit utuh",
      "1 sdt kaldu bubuk & garam",
      "Air secukupnya"
    ]),
    steps: JSON.stringify([
      "Cuci bersih beras dan masukkan ke dalam panci rice cooker.",
      "Tumis sebentar bawang merah, serai, daun salam hingga harum.",
      "Masukkan tumisan bumbu, cabai rawit, dan teri ke dalam beras.",
      "Tambahkan air sesuai takaran masak nasi biasa dan kaldu bubuk.",
      "Tekan tombol Cook dan tunggu hingga matang. Aduk rata sebelum disajikan."
    ]),
    calories: 460,
    proteinG: 14.2,
    fatG: 9.5,
    carbsG: 78.0,
    fiberG: 2.8,
    isAiVerified: true,
    aiFeedback: "Kombinasi karbohidrat kompleks dan protein dari teri asin yang gurih. Aromanya menggugah selera dan sangat ramah di kantong!",
  },
  {
    title: "Ayam Suwir Balado Pedas Manis",
    description: "Lauk stok andalan anak kost, tahan 3-4 hari di kulkas dan bikin lahap makan.",
    category: "Lauk Hemat",
    cookTimeMinutes: 25,
    portions: 3,
    estimatedCost: 22000,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "250g dada ayam fillet rebus lalu suwir",
      "5 siung bawang merah",
      "3 siung bawang putih",
      "8 buah cabai merah keriting",
      "1 lembar daun jeruk",
      "1 sdm kecap manis & 1 sdt gula garam"
    ]),
    steps: JSON.stringify([
      "Rebus dada ayam hingga matang lalu suwir-suwir.",
      "Haluskan cabai dan bawang, tumis bersama daun jeruk hingga matang dan harum.",
      "Masukkan ayam suwir, tambahkan kecap manis, garam, dan sedikit air kaldu.",
      "Masak dengan api sedang hingga bumbu meresap sempurna."
    ]),
    calories: 285,
    proteinG: 28.0,
    fatG: 8.5,
    carbsG: 14.0,
    fiberG: 1.5,
    isAiVerified: true,
    aiFeedback: "Tinggi protein tanpa banyak lemak jenuh. Pilihan lauk hemat berprotein tinggi terbaik untuk anak kost yang aktif beraktivitas.",
  },
  {
    title: "Sup Sayur Bakso Bening Segar",
    description: "Sup hangat kaya serat dan vitamin dengan kaldu bening yang menenangkan tubuh.",
    category: "Sayur & Sup",
    cookTimeMinutes: 15,
    portions: 2,
    estimatedCost: 12000,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "1 buah wortel potong bulat",
      "5 buah buncis potong serong",
      "5 butir bakso sapi potong kerat",
      "2 lembar kol potong kasar",
      "2 siung bawang putih cincang",
      "1 batang daun bawang & seledri",
      "Garam, merica, dan kaldu bubuk secukupnya"
    ]),
    steps: JSON.stringify([
      "Didihkan 600ml air di panci.",
      "Tumis bawang putih hingga wangi, masukkan ke air mendidih.",
      "Masukkan wortel dan bakso sapi terlebih dahulu hingga setengah empuk.",
      "Tambahkan buncis dan kol, bumbui dengan garam, merica, dan kaldu.",
      "Beri taburan daun bawang dan seledri, angkat saat sayur masih renyah."
    ]),
    calories: 145,
    proteinG: 7.8,
    fatG: 4.2,
    carbsG: 18.5,
    fiberG: 4.2,
    isAiVerified: true,
    aiFeedback: "Menu berkuah rendah kalori namun sangat kaya serat dan vitamin C. Cocok untuk makan malam ringan yang menghangatkan tubuh.",
  },
  {
    title: "Orek Tahu Tempe Kecap Manis",
    description: "Lauk sejuta umat khas warteg yang manis gurih, tahan lama dan super hemat.",
    category: "Lauk Hemat",
    cookTimeMinutes: 20,
    portions: 2,
    estimatedCost: 9000,
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "1 papan tempe potong dadu",
      "2 kotak tahu putih potong dadu",
      "3 siung bawang merah & 2 siung bawang putih",
      "3 buah cabai hijau keriting",
      "3 sdm kecap manis",
      "1 sdt gula merah & garam secukupnya"
    ]),
    steps: JSON.stringify([
      "Goreng tahu dan tempe hingga setengah kering berkulit, tiriskan.",
      "Tumis bawang merah, bawang putih, dan cabai hijau hingga harum.",
      "Masukkan kecap manis, gula merah, sedikit air, dan aduk berbusa.",
      "Masukkan tahu dan tempe, aduk cepat hingga bumbu merata terbalut rata."
    ]),
    calories: 220,
    proteinG: 15.6,
    fatG: 9.8,
    carbsG: 19.4,
    fiberG: 3.8,
    isAiVerified: true,
    aiFeedback: "Sumber protein nabati terbaik dengan harga super hemat. Tempe kaya isoflavon dan serat fermentasi yang baik untuk pencernaan.",
  },
  {
    title: "Omelet Mie Sayur Mahasiswa",
    description: "Upgrade mie instan jadi omelet padat gizi dengan telur dan sayuran renyah.",
    category: "Sarapan",
    cookTimeMinutes: 10,
    portions: 1,
    estimatedCost: 7500,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "1 bungkus mie instan rasa favorit",
      "2 butir telur ayam",
      "1 batang daun bawang iris",
      "1/2 buah wortel parut kasar",
      "1 sdm minyak goreng"
    ]),
    steps: JSON.stringify([
      "Rebus mie instan setengah matang lalu tiriskan.",
      "Kocok lepas 2 butir telur bersama bumbu mie instan, daun bawang, dan wortel parut.",
      "Campurkan mie ke dalam kocokan telur hingga rata.",
      "Panaskan wajan dengan sedikit minyak, tuang adonan mie telur.",
      "Goreng dengan api kecil hingga kedua sisi kecokelatan dan matang merata."
    ]),
    calories: 480,
    proteinG: 17.5,
    fatG: 22.0,
    carbsG: 52.0,
    fiberG: 2.5,
    isAiVerified: true,
    aiFeedback: "Sarapan cepat penambah energi tinggi! Penambahan 2 butir telur dan wortel menyeimbangkan kebutuhan protein dan serat harian.",
  },
  {
    title: "Telur Dadar Padang Tebal Gurih",
    description: "Telur dadar tebal khas resto Padang dengan tekstur renyah di luar dan lembut gurih di dalam.",
    category: "Lauk Hemat",
    cookTimeMinutes: 15,
    portions: 2,
    estimatedCost: 8000,
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "3 butir telur ayam",
      "2 batang daun bawang iris tebal",
      "3 buah cabai merah iris",
      "1 sdm tepung beras (kunci ketebalan)",
      "2 siung bawang merah iris",
      "1/2 sdt merica dan garam",
      "Minyak goreng cukup"
    ]),
    steps: JSON.stringify([
      "Kocok telur bersama tepung beras, garam, dan merica hingga larut merata.",
      "Campurkan irisan daun bawang, bawang merah, dan cabai ke dalam kocokan telur.",
      "Panaskan minyak agak banyak di wajan kecil dengan api sedang.",
      "Tuang seluruh adonan telur dari agak tinggi, kecilkan api agar bagian dalam matang tanpa gosong.",
      "Balik sekali saat sisi bawah sudah kecokelatan krispi, masak hingga matang lalu tiriskan."
    ]),
    calories: 245,
    proteinG: 17.5,
    fatG: 18.0,
    carbsG: 4.8,
    fiberG: 1.2,
    isAiVerified: true,
    aiFeedback: "Lauk protein tinggi hemat biaya. Tepung beras memberikan karbohidrat pengikat dan tekstur tebal tanpa mengorbankan kepadatan nutrisi telur.",
  },
  {
    title: "Tahu Telur Bumbu Kacang Praktis",
    description: "Tahu goreng telur disiram saus kacang gurih manis dan tauge segar khas Jawa Timur.",
    category: "Lauk Hemat",
    cookTimeMinutes: 15,
    portions: 2,
    estimatedCost: 10000,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "2 kotak tahu putih potong dadu kecil",
      "2 butir telur ayam kocok lepas",
      "50g tauge rebus sebentar",
      "2 sdm selai kacang / bumbu pecel instan",
      "1 sdm kecap manis",
      "1 siung bawang putih haluskan",
      "Cabai rawit sesuai selera",
      "Air hangat secukupnya"
    ]),
    steps: JSON.stringify([
      "Campurkan potongan tahu ke dalam telur kocok yang diberi sedikit garam.",
      "Goreng dalam wajan datar dengan sedikit minyak hingga matang berkulit, angkat dan taruh di piring.",
      "Larutkan selai kacang/bumbu pecel dengan air hangat, bawang putih, kecap manis, dan cabai ulek.",
      "Taruh tauge rebus di atas tahu telur, lalu siram bumbu kacang gurih di atasnya."
    ]),
    calories: 310,
    proteinG: 21.0,
    fatG: 18.5,
    carbsG: 17.0,
    fiberG: 3.5,
    isAiVerified: true,
    aiFeedback: "Kombinasi protein hewani dan nabati sempurna (telur + tahu). Kacang tanah menyumbang lemak tak jenuh ganda yang baik untuk kesehatan otak mahasiswa.",
  },
  {
    title: "Sambal Goreng Tempe Teri Crispy",
    description: "Tempe dan teri goreng garing dibalut sambal karamel manis gurih, awet hingga seminggu untuk stok lauk kost.",
    category: "Lauk Hemat",
    cookTimeMinutes: 20,
    portions: 4,
    estimatedCost: 12000,
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "1 papan tempe iris korek api tipis",
      "40g teri asin cuci bersih dan tiriskan",
      "4 siung bawang merah & 2 siung bawang putih iris",
      "4 buah cabai merah iris serong",
      "2 lembar daun salam & 1 ruas lengkuas",
      "2 sdm gula merah sisir",
      "1 sdm air asam jawa & 1 sdt garam"
    ]),
    steps: JSON.stringify([
      "Goreng irisan tempe hingga kering renyah, angkat dan tiriskan.",
      "Goreng teri asin hingga garing keemasan, tiriskan.",
      "Tumis bawang merah, bawang putih, cabai, daun salam, dan lengkuas sampai wangi harum.",
      "Masukkan gula merah, air asam jawa, dan sedikit garam. Masak hingga gula berkaramel dan kental berserabut.",
      "Matikan api, masukkan tempe dan teri goreng, aduk cepat hingga seluruh bumbu merata."
    ]),
    calories: 230,
    proteinG: 18.2,
    fatG: 10.5,
    carbsG: 18.0,
    fiberG: 4.2,
    isAiVerified: true,
    aiFeedback: "Lauk stok terbaik untuk anak kost! Padat kalsium dari teri dan probiotik-prebiotik alami dari kedelai fermentasi tempe.",
  },
  {
    title: "Sarden Tumis Ekstra Pedas Daun Jeruk",
    description: "Sarden kaleng hemat disulap jadi lauk restoran dengan tumisan cabai melimpah dan aroma segar daun jeruk.",
    category: "Lauk Hemat",
    cookTimeMinutes: 10,
    portions: 2,
    estimatedCost: 13500,
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "1 kaleng sarden ukuran kecil (155g)",
      "4 siung bawang merah iris",
      "2 siung bawang putih iris",
      "7 buah cabai rawit merah iris",
      "1 buah tomat merah potong dadu",
      "3 lembar daun jeruk buang tulangnya",
      "1 sdt gula pasir & 1/2 sdt kaldu jamur"
    ]),
    steps: JSON.stringify([
      "Tumis bawang merah, bawang putih, cabai rawit, tomat, dan daun jeruk hingga harum dan layu.",
      "Tuangkan kaleng sarden beserta saus tomatnya ke dalam wajan.",
      "Tambahkan sedikit gula pasir dan kaldu jamur untuk menyeimbangkan rasa asam saus.",
      "Masak dengan api sedang hingga kuah sedikit mengental dan bumbu meresap ke daging ikan. Jangan sering diaduk agar ikan tidak hancur."
    ]),
    calories: 220,
    proteinG: 19.5,
    fatG: 10.2,
    carbsG: 9.0,
    fiberG: 1.8,
    isAiVerified: true,
    aiFeedback: "Kaya asam lemak Omega-3 dan Vitamin D dari ikan laut sarden, sangat bagus untuk konsentrasi belajar mahasiswa.",
  },
  {
    title: "Ayam Kecap Mentega Rice Bowl Kost",
    description: "Potongan ayam lembut berbalut saus mentega gurih manis legit ala resto chinese food versi ramah kantong.",
    category: "Lauk Hemat",
    cookTimeMinutes: 20,
    portions: 2,
    estimatedCost: 18000,
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "200g dada ayam potong dadu",
      "1 sdm margarin / mentega",
      "1/2 buah bawang bombay iris memanjang",
      "2 siung bawang putih cincang",
      "2 sdm kecap manis",
      "1 sdm saus tiram",
      "1 sdt kecap inggris / kecap asin",
      "1 buah jeruk limau / nipis"
    ]),
    steps: JSON.stringify([
      "Bumbui potongan ayam dengan sedikit garam dan merica, goreng setengah matang lalu sisihkan.",
      "Lelehkan margarin, tumis bawang putih dan bawang bombay hingga harum layu.",
      "Masukkan kecap manis, saus tiram, dan kecap asin bersama sedikit air.",
      "Masukkan ayam goreng, masak hingga kuah mengental dan bumbu meresap mengkilap.",
      "Beri perasan jeruk limau sebelum diangkat, sajikan di atas nasi hangat."
    ]),
    calories: 295,
    proteinG: 27.0,
    fatG: 11.2,
    carbsG: 15.0,
    fiberG: 1.4,
    isAiVerified: true,
    aiFeedback: "Sumber protein tanpa lemak jenuh berlebih. Rasanya disukai semua lidah dan memasaknya hanya butuh satu wajan teflon.",
  },
  {
    title: "Tumis Kangkung Belacan Terasi Bawang",
    description: "Sayur hijau renyah ditumis api besar dengan aroma terasi bakar dan bawang gurih pedas nendang.",
    category: "Sayur & Sup",
    cookTimeMinutes: 8,
    portions: 2,
    estimatedCost: 6000,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "1 ikat kangkung segar petik daun dan batang mudanya",
      "1/2 sdt terasi bakar",
      "3 siung bawang merah & 2 siung bawang putih",
      "4 buah cabai rawit merah",
      "1 sdm saus tiram",
      "1/2 sdt garam & gula",
      "1 sdm minyak goreng"
    ]),
    steps: JSON.stringify([
      "Haluskan kasar bawang merah, bawang putih, cabai rawit, dan terasi bakar.",
      "Panaskan minyak dengan api besar, tumis bumbu halus hingga sangat wangi.",
      "Masukkan kangkung yang sudah dicuci bersih, aduk cepat.",
      "Bubuhi saus tiram, garam, dan gula.",
      "Masak sebentar saja (1-2 menit) agar kangkung tetap hijau cerah dan bertekstur krispi renyah."
    ]),
    calories: 85,
    proteinG: 4.2,
    fatG: 4.0,
    carbsG: 8.5,
    fiberG: 3.8,
    isAiVerified: true,
    aiFeedback: "Rendah kalori, kaya serat larut air dan zat besi yang ampuh mencegah anemia pada mahasiswa yang sering begadang.",
  },
  {
    title: "Sayur Bening Bayam Jagung Manis",
    description: "Kuah bening aromatik temu kunci dengan manis alami jagung manis dan daun bayam segar pelepas dahaga.",
    category: "Sayur & Sup",
    cookTimeMinutes: 12,
    portions: 2,
    estimatedCost: 7500,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "1 ikat bayam hijau petik daunnya",
      "1 buah jagung manis potong bulat / pipil",
      "3 butir bawang merah iris tipis",
      "1 ruas temu kunci memarkan (atau daun salam)",
      "600ml air bersih",
      "1 sdt garam & 1 sdt gula pasir"
    ]),
    steps: JSON.stringify([
      "Didihkan air dalam panci bersama irisan bawang merah dan temu kunci hingga tercium aroma harum.",
      "Masukkan potongan jagung manis terlebih dahulu, rebus sekitar 5 menit sampai jagung empuk dan manisnya larut.",
      "Tambahkan garam dan gula pasir, aduk dan cicipi rasa kaldu beningnya.",
      "Masukkan daun bayam, masak sebentar saja sekitar 1 menit hingga layu lalu segera matikan api."
    ]),
    calories: 92,
    proteinG: 4.8,
    fatG: 1.0,
    carbsG: 19.5,
    fiberG: 4.0,
    isAiVerified: true,
    aiFeedback: "Menu hidrasi terbaik dengan elektrolit alami kalium dari jagung dan bayam. Kuahnya menyegarkan lambung dan melancarkan pencernaan.",
  },
  {
    title: "Sup Ayam Makaroni Telur Puyuh",
    description: "Sup kaldu ayam hangat berisi makaroni kenyal, potongan wortel lembut, dan telur puyuh padat gizi.",
    category: "Sayur & Sup",
    cookTimeMinutes: 20,
    portions: 2,
    estimatedCost: 15000,
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "100g daging ayam fillet potong kecil",
      "6 butir telur puyuh rebus kupas",
      "40g makaroni rebus aldente",
      "1 buah wortel iris bulat",
      "2 siung bawang putih geprek cincang",
      "1 batang seledri & daun bawang",
      "Garam, merica bubuk, dan kaldu ayam secukupnya"
    ]),
    steps: JSON.stringify([
      "Rebus ayam potong dengan 650ml air untuk membuat kaldu ayam alami.",
      "Tumis bawang putih cincang hingga harum kekuningan, masukkan ke dalam air rebusan kaldu.",
      "Masukkan wortel rebus hingga setengah empuk.",
      "Masukkan makaroni rebus dan telur puyuh, bumbui dengan garam, merica, dan kaldu bubuk.",
      "Taburkan irisan daun bawang dan seledri, angkat hangat."
    ]),
    calories: 235,
    proteinG: 18.5,
    fatG: 8.0,
    carbsG: 22.0,
    fiberG: 2.6,
    isAiVerified: true,
    aiFeedback: "Kombinasi makronutrien lengkap dalam semangkuk sup: protein hewani tinggi dari ayam dan telur puyuh, ditambah energi dari makaroni.",
  },
  {
    title: "Capcay Kuah Sederhana Telur Orak-Arik",
    description: "Aneka sayuran krispi berkuah gurih kental dengan telur orak-arik dan saus tiram lezat.",
    category: "Sayur & Sup",
    cookTimeMinutes: 15,
    portions: 2,
    estimatedCost: 11000,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "1 buah wortel iris serong",
      "3 lembar sawi putih potong sedang",
      "4 tangkai buncis potong serong",
      "1 butir telur ayam",
      "2 siung bawang putih cincang",
      "1 sdm saus tiram & 1/2 sdt kecap asin",
      "1 sdt tepung maizena larutkan sedikit air",
      "Garam dan merica secukupnya"
    ]),
    steps: JSON.stringify([
      "Orak-arik telur di wajan dengan sedikit minyak hingga matang butiran, pinggirkan.",
      "Tumis bawang putih cincang di wajan yang sama sampai harum wangi.",
      "Masukkan wortel dan buncis bersama 150ml air, masak hingga setengah empuk.",
      "Masukkan sawi putih, saus tiram, kecap asin, garam, dan merica.",
      "Tuangkan larutan maizena, aduk rata hingga kuah mengental berkilau dan sayur matang renyah."
    ]),
    calories: 155,
    proteinG: 9.8,
    fatG: 6.8,
    carbsG: 15.5,
    fiberG: 4.6,
    isAiVerified: true,
    aiFeedback: "Penyuplai mikronutrien harian terbaik (Vitamin A, C, K) dan antioksidan yang memperkuat daya tahan tubuh mahasiswa saat masa ujian.",
  },
  {
    title: "Nasi Kuning Komplit Rice Cooker",
    description: "Nasi kuning harum gurih berbumbu kunyit santan praktis dimasak cukup menggunakan rice cooker kamar kost.",
    category: "Rice Cooker",
    cookTimeMinutes: 35,
    portions: 3,
    estimatedCost: 13000,
    imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "2 cup beras putih",
      "1 bungkus santan instan (65ml)",
      "1 sdt kunyit bubuk",
      "2 batang serai memarkan",
      "3 lembar daun salam & 2 lembar daun pandan",
      "3 siung bawang merah iris halus",
      "1 sdt kaldu bubuk & 1 sdt garam"
    ]),
    steps: JSON.stringify([
      "Cuci bersih beras dan masukkan ke panci rice cooker.",
      "Campurkan santan instan dengan air hangat dan kunyit bubuk, aduk sampai kuning merata.",
      "Tuangkan air santan kunyit ke dalam beras sesuai takaran air masak biasa.",
      "Masukkan serai, daun salam, daun pandan, irisan bawang merah, garam, dan kaldu bubuk.",
      "Aduk rata, tekan tombol Cook. Setelah jeglek Warm, diamkan 10 menit lalu aduk perlahan agar bulir nasi pulen harum."
    ]),
    calories: 430,
    proteinG: 8.5,
    fatG: 12.0,
    carbsG: 72.0,
    fiberG: 2.1,
    isAiVerified: true,
    aiFeedback: "Kandungan kurkumin alami pada kunyit bekerja sebagai antiinflamasi alami yang baik untuk imunitas dan kesehatan pencernaan.",
  },
  {
    title: "Nasi Hainan Ayam Praktis Rice Cooker",
    description: "One-pot meal istimewa: nasi harum minyak wijen jahe matang bersama potongan daging ayam empuk gurih sekaligus.",
    category: "Rice Cooker",
    cookTimeMinutes: 35,
    portions: 2,
    estimatedCost: 20000,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "2 cup beras putih cuci bersih",
      "200g dada ayam potong pipih sedang",
      "3 siung bawang putih cincang halus",
      "2 cm jahe iris tipis atau geprek",
      "1 sdm minyak wijen",
      "1 sdm kecap asin & 1 sdm saus tiram",
      "1 batang daun bawang iris",
      "Garam dan kaldu bubuk secukupnya"
    ]),
    steps: JSON.stringify([
      "Tumis bawang putih dan jahe dengan minyak wijen langsung di panci rice cooker sampai wangi.",
      "Masukkan beras yang telah dicuci, aduk bersama bumbu tumis sebentar.",
      "Tambahkan air sesuai takaran masak nasi, tambahkan kecap asin, saus tiram, dan garam.",
      "Susun potongan daging ayam di atas permukaan beras (jangan diaduk ke dasar).",
      "Tutup rice cooker, tekan mode Cook sampai matang. Daging ayam akan matang sangat empuk dan kaldunya meresap ke dalam nasi."
    ]),
    calories: 470,
    proteinG: 26.5,
    fatG: 11.5,
    carbsG: 64.0,
    fiberG: 1.8,
    isAiVerified: true,
    aiFeedback: "Solusi one-pot meal paling efisien: hemat cucian piring, tinggi protein tanpa minyak berlebih, dan aroma wijen meningkatkan nafsu makan.",
  },
  {
    title: "Bubur Ayam Gurih Magic Com Anti Gosong",
    description: "Bubur ayam lembut kental tanpa perlu diaduk terus menerus, cocok saat tubuh sedang butuh makanan hangat nyaman.",
    category: "Rice Cooker",
    cookTimeMinutes: 40,
    portions: 2,
    estimatedCost: 9500,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "1/2 cup beras putih",
      "4 cup air kaldu ayam atau air biasa",
      "1 lembar daun salam",
      "1 ruas jahe memarkan",
      "1 sdt garam & kaldu bubuk",
      "Topping: kerupuk, kacang kedelai goreng, seledri, kecap asin"
    ]),
    steps: JSON.stringify([
      "Cuci bersih beras, masukkan ke rice cooker bersama air (rasio 1:6 hingga 1:7).",
      "Masukkan daun salam, jahe geprek, dan garam.",
      "Tekan tombol Cook. Biarkan tutup sedikit terbuka dengan menaruh sendok sayur di tepi panci agar air tidak meluap.",
      "Setelah 30 menit, aduk sesekali hingga bulir beras pecah menjadi bubur lembut kental.",
      "Sajikan dalam mangkuk bersama kerupuk dan taburan daun seledri."
    ]),
    calories: 280,
    proteinG: 14.5,
    fatG: 5.5,
    carbsG: 44.0,
    fiberG: 1.5,
    isAiVerified: true,
    aiFeedback: "Sangat ramah di lambung, mudah dicerna, dan memberikan hidrasi cepat. Pilihan tepat ketika sedang flu atau masa pemulihan.",
  },
  {
    title: "Pancake Pisang Oat 2 Bahan",
    description: "Sarapan sehat tanpa tepung terigu dan tanpa gula pasir tambahan, manis alami dari pisang matang.",
    category: "Sarapan",
    cookTimeMinutes: 10,
    portions: 1,
    estimatedCost: 6500,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "1 buah pisang ambon/cavendish matang",
      "1 butir telur ayam",
      "3 sdm rolled oat atau oatmeal instan",
      "Sejumput bubuk kayu manis (opsional)",
      "1/2 sdt margarin untuk olesan teflon"
    ]),
    steps: JSON.stringify([
      "Lumatkan pisang matang di mangkuk menggunakan garpu hingga halus bertekstur.",
      "Kocok telur bersama oatmeal dan lumatkan pisang hingga menyatu menjadi adonan kental.",
      "Panaskan teflon anti lengket dengan api kecil, beri olesan tipis margarin.",
      "Tuang 2 sendok makan adonan, masak hingga muncul gelembung kecil di permukaan (sekitar 2 menit).",
      "Balik perlahan dan masak sisi sebaliknya hingga cokelat keemasan. Angkat dan sajikan hangat."
    ]),
    calories: 260,
    proteinG: 11.0,
    fatG: 6.2,
    carbsG: 42.0,
    fiberG: 5.5,
    isAiVerified: true,
    aiFeedback: "Tinggi serat beta-glukan dari oat yang memberikan rasa kenyang bertahan lama sepanjang waktu kuliah pagi tanpa lonjakan gula darah drastis.",
  },
  {
    title: "Roti Bakar Telur Keju Lumer",
    description: "Roti panggang mentega gurih renyah dengan isian telur mata sapi dan lembaran keju cheddar meleleh.",
    category: "Sarapan",
    cookTimeMinutes: 8,
    portions: 1,
    estimatedCost: 8000,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "2 lembar roti tawar",
      "1 butir telur ayam",
      "1 lembar keju slice cheddar",
      "1 sdt margarin",
      "Saus tomat / sambal secukupnya",
      "Sejumput merica bubuk"
    ]),
    steps: JSON.stringify([
      "Goreng telur mata sapi setengah matang atau matang sesuai selera, beri sedikit garam dan merica.",
      "Olesi kedua sisi luar roti tawar dengan margarin.",
      "Letakkan telur dan selembar keju slice di antara dua lembar roti.",
      "Panggang roti di atas teflon dengan api kecil sambil ditekan perlahan hingga kedua permukaan cokelat keemasan dan keju meleleh gurih."
    ]),
    calories: 330,
    proteinG: 16.0,
    fatG: 15.0,
    carbsG: 33.0,
    fiberG: 2.8,
    isAiVerified: true,
    aiFeedback: "Sarapan padat energi dan kalsium yang siap dalam 8 menit. Cocok untuk sarapan kilat sebelum berangkat kuliah."
  },
  {
    title: "Tahu Crispy Cabai Garam Bawang",
    description: "Camilan gurih renyah tahu goreng balut maizena ditumis dengan taburan bawang putih melimpah dan cabai rawit pedas.",
    category: "Camilan",
    cookTimeMinutes: 15,
    portions: 2,
    estimatedCost: 7000,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "3 kotak tahu putih potong dadu kecil",
      "3 sdm tepung maizena",
      "4 siung bawang putih cincang halus",
      "5 buah cabai rawit merah iris kecil",
      "1 batang daun bawang iris tipis",
      "1/2 sdt garam & 1/2 sdt kaldu jamur",
      "Minyak untuk menggoreng"
    ]),
    steps: JSON.stringify([
      "Baluri potongan tahu dengan tepung maizena kering sampai seluruh permukaannya terlapisi tipis merata.",
      "Goreng tahu dalam minyak panas hingga berkulit renyah dan garing keemasan, tiriskan.",
      "Kurangi minyak di wajan, tumis bawang putih cincang hingga harum kekuningan dan renyah.",
      "Masukkan irisan cabai rawit dan daun bawang, aduk sebentar.",
      "Masukkan tahu crispy goreng, bumbui dengan garam dan kaldu jamur, kocok cepat agar merata lalu sajikan."
    ]),
    calories: 190,
    proteinG: 13.0,
    fatG: 9.5,
    carbsG: 14.0,
    fiberG: 2.2,
    isAiVerified: true,
    aiFeedback: "Camilan protein nabati hemat biaya yang jauh lebih sehat dibanding gorengan pinggir jalan karena menggunakan minyak segar dan minim tepung terigu."
  },
  {
    title: "Pisang Bakar Coklat Keju Kost",
    description: "Camilan manis legit malam hari dari pisang kepok/raja panggang mentega dengan taburan meses dan parutan keju gurih.",
    category: "Camilan",
    cookTimeMinutes: 10,
    portions: 2,
    estimatedCost: 7500,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
    ingredients: JSON.stringify([
      "3 buah pisang kepok atau uli matang",
      "1 sdm margarin",
      "2 sdm susu kental manis",
      "1 sdm meses coklat",
      "20g keju cheddar parut"
    ]),
    steps: JSON.stringify([
      "Kupas pisang lalu pipihkan perlahan dengan punggung sendok atau talenan.",
      "Panaskan margarin di teflon dengan api sedang-kecil.",
      "Panggang pisang hingga kedua sisinya berwarna kuning kecokelatan dan berkaramel harum.",
      "Tata pisang bakar di piring saji, kucuri susu kental manis, lalu taburkan meses dan parutan keju melimpah."
    ]),
    calories: 235,
    proteinG: 4.5,
    fatG: 7.0,
    carbsG: 41.0,
    fiberG: 3.2,
    isAiVerified: true,
    aiFeedback: "Penyedia kalium alami dan karbohidrat sederhana yang cepat memulihkan stamina otak setelah belajar keras seharian."
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const filter = searchParams.get("filter"); // "all" | "my_recipes" | "saved"

    // Ambil session user aktif jika ada
    const session = await getServerSession(authOptions);
    let currentDbUserId: number | null = null;
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (dbUser) currentDbUserId = dbUser.id;
    }

    // Pastikan seluruh koleksi resep awal tersedia di database tanpa duplikasi
    for (const item of INITIAL_RECIPES) {
      const exists = await prisma.recipe.findFirst({
        where: { title: item.title },
      });
      if (!exists) {
        await prisma.recipe.create({ data: item });
      }
    }

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filter === "my_recipes") {
      if (currentDbUserId) {
        where.userId = currentDbUserId;
      } else {
        // Belum login, tidak ada resep saya
        where.userId = -1;
      }
    } else if (filter === "saved") {
      if (currentDbUserId) {
        where.savedBy = {
          some: {
            userId: currentDbUserId,
          },
        };
      } else {
        where.id = -1;
      }
    }

    if (category && category !== "Semua") {
      where.category = category;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { ingredients: { contains: q } },
      ];
    }

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        savedBy: currentDbUserId
          ? {
              where: { userId: currentDbUserId },
              select: { id: true },
            }
          : false,
        _count: {
          select: {
            savedBy: true,
          },
        },
      },
    });

    const mappedRecipes = recipes.map((r: any) => ({
      ...r,
      isSaved: Boolean(r.savedBy && r.savedBy.length > 0),
      saveCount: r._count?.savedBy || 0,
      savedBy: undefined,
      _count: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: mappedRecipes,
      total: mappedRecipes.length,
      currentUserId: currentDbUserId,
    });
  } catch (error) {
    console.error("[GET /api/recipes] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar resep" },
      { status: 500 }
    );
  }
}

const createRecipeSchema = z.object({
  title: z.string().min(2, "Judul resep minimal 2 karakter"),
  description: z.string().optional(),
  category: z.string().default("Lauk Hemat"),
  cookTimeMinutes: z.number().int().min(1).default(20),
  portions: z.number().int().min(1).default(1),
  estimatedCost: z.number().int().min(0).default(15000),
  imageUrl: z.string().optional(),
  ingredients: z.string().min(3, "Bahan-bahan wajib diisi"),
  steps: z.string().min(3, "Langkah memasak wajib diisi"),
  // Pre-calculated nutrition (optional, will be analyzed if omitted or verified)
  calories: z.number().optional(),
  proteinG: z.number().optional(),
  fatG: z.number().optional(),
  carbsG: z.number().optional(),
  fiberG: z.number().optional(),
  aiFeedback: z.string().optional(),
  isAiVerified: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Anda harus login untuk mengupload resep" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createRecipeSchema.parse(body);

    // Dapatkan user ID database
    let dbUserId: number | null = null;
    if (session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (dbUser) dbUserId = dbUser.id;
    }
    if (!dbUserId && (session.user as any).id) {
      const parsedId = Number((session.user as any).id);
      if (!isNaN(parsedId)) dbUserId = parsedId;
    }

    const cleanTitle = parsed.title.trim();

    // CEK DUPLIKASI RESEP: Jangan masukkan resep yang sama
    const exactMatch = await prisma.recipe.findFirst({
      where: { title: cleanTitle },
      select: { id: true, title: true },
    });

    let duplicateFound = exactMatch;
    if (!duplicateFound) {
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const targetNorm = normalize(cleanTitle);
      const allExisting = await prisma.recipe.findMany({
        select: { id: true, title: true },
      });
      duplicateFound = allExisting.find((r) => normalize(r.title) === targetNorm) || null;
    }

    if (duplicateFound) {
      return NextResponse.json(
        {
          success: false,
          is_duplicate: true,
          message: `Resep "${duplicateFound.title}" sudah pernah dimasukkan ke database. Resep yang sama tidak dapat diupload lagi. Silakan gunakan judul berbeda atau buat kreasi resep unikmu!`,
        },
        { status: 409 }
      );
    }

    // Jika belum diverifikasi atau ingin memastikan dengan AI:
    let isAiVerified = parsed.isAiVerified || false;
    let calories = parsed.calories || 0;
    let proteinG = parsed.proteinG || 0;
    let fatG = parsed.fatG || 0;
    let carbsG = parsed.carbsG || 0;
    let fiberG = parsed.fiberG || 0;
    let aiFeedback = parsed.aiFeedback || "";
    let estimatedCost = parsed.estimatedCost;
    let cookTimeMinutes = parsed.cookTimeMinutes;

    // Selalu jalankan verifikasi AI jika belum diverifikasi atau nilai gizi 0
    if (!isAiVerified || calories === 0) {
      const aiResult = await verifyAndAnalyzeRecipeWithAI({
        title: parsed.title,
        ingredients: parsed.ingredients,
        steps: parsed.steps,
        imageBase64: parsed.imageUrl?.startsWith("data:") ? parsed.imageUrl : undefined,
        portions: parsed.portions,
      });

      if (!aiResult.is_food) {
        return NextResponse.json(
          {
            success: false,
            is_food: false,
            message: aiResult.rejection_reason || "AI mendeteksi input bukan makanan yang layak/aman dikonsumsi.",
          },
          { status: 422 }
        );
      }

      isAiVerified = true;
      calories = aiResult.nutrition.calories;
      proteinG = aiResult.nutrition.protein_g;
      fatG = aiResult.nutrition.fat_g;
      carbsG = aiResult.nutrition.carbs_g;
      fiberG = aiResult.nutrition.fiber_g;
      aiFeedback = aiResult.ai_feedback;
      if (!parsed.estimatedCost || parsed.estimatedCost === 15000) {
        estimatedCost = aiResult.estimated_cost;
      }
      if (!parsed.cookTimeMinutes || parsed.cookTimeMinutes === 20) {
        cookTimeMinutes = aiResult.cook_time_minutes;
      }
    }

    // Normalisasi ingredients & steps ke JSON string jika belum
    let ingredientsJson = parsed.ingredients;
    try {
      JSON.parse(parsed.ingredients);
    } catch {
      // Ubah dari baris teks biasa ke array of strings
      const arr = parsed.ingredients
        .split("\n")
        .map((s) => s.trim().replace(/^[-*•]\s*/, ""))
        .filter(Boolean);
      ingredientsJson = JSON.stringify(arr);
    }

    let stepsJson = parsed.steps;
    try {
      JSON.parse(parsed.steps);
    } catch {
      const arr = parsed.steps
        .split("\n")
        .map((s) => s.trim().replace(/^\d+[\.\)]\s*/, ""))
        .filter(Boolean);
      stepsJson = JSON.stringify(arr);
    }

    const created = await prisma.recipe.create({
      data: {
        userId: dbUserId,
        title: parsed.title,
        description: parsed.description || null,
        category: parsed.category,
        cookTimeMinutes: cookTimeMinutes,
        portions: parsed.portions,
        estimatedCost: estimatedCost,
        imageUrl: parsed.imageUrl || null,
        ingredients: ingredientsJson,
        steps: stepsJson,
        calories: calories,
        proteinG: proteinG,
        fatG: fatG,
        carbsG: carbsG,
        fiberG: fiberG,
        isAiVerified: isAiVerified,
        aiFeedback: aiFeedback,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resep berhasil disimpan dan diverifikasi oleh AI!",
      data: created,
    });
  } catch (error) {
    console.error("[POST /api/recipes] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Data resep tidak valid" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan resep ke database" },
      { status: 500 }
    );
  }
}
