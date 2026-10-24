import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { Mistral } from "@mistralai/mistralai";

export interface AskRecipeRequest {
  prompt?: string;
  ingredients?: string;
  budget?: number;
  cookingTool?: string;
  dietaryGoal?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  category: string;
  cookTimeMinutes: number;
  portions: number;
  estimatedCost: number;
  cookingTool: string;
  ingredients: string[];
  steps: string[];
  nutrition: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
  chefTips: string;
  healthTags: string[];
}

export interface AskRecipeResponse {
  replyText: string;
  recipe?: GeneratedRecipe | null;
  suggestions: string[];
}

export const ASK_RECIPE_SYSTEM_PROMPT = `
Kamu adalah "Chef Kost AI", asisten koki pintar dan ahli gizi ramah khusus anak kost di Indonesia dari aplikasi DompetKost.
Gaya bicaramu: hangat, suportif, santai khas mahasiswa/anak muda Indonesia, cerdas dalam menghemat uang belanja, dan selalu peduli gizi seimbang.

Tugas utamamu:
1. Membantu pengguna menemukan ide masakan lezat, praktis, bergizi, dan murah meriah.
2. Memaksimalkan bahan-bahan yang pengguna miliki di kost (mengurangi mubazir / sisa makanan).
3. Menyesuaikan alat masak yang umum di kamar kost (Rice Cooker, Kompor 1 Tungku / Wajan Teflon, Panci Rebus, atau Air Panas).
4. Menyediakan kalkulasi nutrisi ilmiah (Kalori, Protein, Lemak, Karbohidrat, Serat) dan perkiraan biaya belanja pasar/warung (Rupiah).
5. Selalu memberikan tips memasak hemat ("chefTips").

Format output WAJIB HANYA JSON MURNI (valid JSON) tanpa awalan/akhiran markdown:
{
  "replyText": "Penjelasan ramah dari Chef Kost AI kepada user, rekomendasi, dan alasan kenapa menu ini cocok...",
  "recipe": {
    "title": "Nama Resep Unik & Menggugah Selera",
    "description": "Deskripsi singkat resep (1-2 kalimat)",
    "category": "Lauk Hemat | Rice Cooker | Sayur & Sup | Sarapan | Camilan",
    "cookTimeMinutes": 15,
    "portions": 1,
    "estimatedCost": 12000,
    "cookingTool": "Rice Cooker | Teflon / Wajan | Panci | Tanpa Api",
    "ingredients": [
      "2 butir telur ayam (Rp 4.000)",
      "1 kotak tahu putih, potong dadu (Rp 2.500)",
      "2 siung bawang merah & 1 siung bawang putih (Rp 1.000)",
      "1 sdm kecap manis & sedikit garam"
    ],
    "steps": [
      "Kocok telur bersama tahu dadu dan sedikit garam hingga merata.",
      "Panaskan 1 sdm minyak di wajan atau rice cooker (mode cook).",
      "Tuang adonan telur tahu, masak dengan api kecil hingga bagian bawah kecokelatan.",
      "Balik perlahan, beri kecap manis di atasnya, angkat dan nikmati hangat!"
    ],
    "nutrition": {
      "calories": 380,
      "protein_g": 22.5,
      "fat_g": 14.0,
      "carbs_g": 38.0,
      "fiber_g": 3.0
    },
    "chefTips": "Gunakan api kecil saat mendadar tahu telur agar bagian dalamnya matang merata tanpa gosong.",
    "healthTags": ["Tinggi Protein", "Hemat Kantong", "Cepat Matang"]
  },
  "suggestions": [
    "Bisa dibuat versi tanpa minyak gak?",
    "Gimana kalau ditambah nasi langsung?",
    "Ide olahan tempe untuk menu besok"
  ]
}

Jika pengguna hanya bertanya tips kuliner non-resep (misal: "cara simpan tahu biar gak asem"), set "recipe": null dan jawab secara lengkap di "replyText".
`.trim();

function cleanJson(str: string) {
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Format JSON tidak valid");
  return JSON.parse(str.substring(start, end + 1));
}

// Fallback jika API AI tidak tersedia
function fallbackAskRecipe(input: AskRecipeRequest): AskRecipeResponse {
  const query = `${input.prompt || ""} ${input.ingredients || ""} ${input.dietaryGoal || ""}`.toLowerCase();

  let recipe: GeneratedRecipe;

  if (query.includes("rice cooker") || query.includes("nasi")) {
    recipe = {
      title: "Nasi Liwet Rice Cooker Teri Telur Hemat",
      description: "Nasi gurih harum rempah dengan taburan teri renyah dan telur orak-arik praktis langsung matang bersama di rice cooker.",
      category: "Rice Cooker",
      cookTimeMinutes: 25,
      portions: 1,
      estimatedCost: 11000,
      cookingTool: "Rice Cooker",
      ingredients: [
        "1 gelas beras (Rp 3.000)",
        "1 butir telur ayam (Rp 2.000)",
        "2 sdm teri medan / teri jengki (Rp 3.000)",
        "2 siung bawang merah & 1 siung bawang putih, iris (Rp 1.000)",
        "1 batang serai & 1 lembar daun salam (Rp 500)",
        "1 sdt kaldu bubuk & 1 sdm minyak goreng (Rp 1.500)"
      ],
      steps: [
        "Cuci beras bersih, masukkan air sesuai takaran masak biasa di panci rice cooker.",
        "Tumis sebentar bawang, serai, daun salam, dan teri di rice cooker dengan 1 sdm minyak hingga harum.",
        "Masukkan beras dan air, tambahkan kaldu bubuk, aduk rata lalu tekan tombol COOK.",
        "Saat tombol beralih ke WARM, ceplokkan telur di atas nasi hangat, tutup lagi 5 menit sampai telur matang lembut.",
        "Aduk nasi liwet hingga pulen dan nikmati selagi hangat!"
      ],
      nutrition: {
        calories: 520,
        protein_g: 19.5,
        fat_g: 13.0,
        carbs_g: 78.0,
        fiber_g: 3.2,
      },
      chefTips: "Gunakan minyak bekas menggoreng bawang agar aroma nasi liwet semakin harum khas resto sunda.",
      healthTags: ["Prakits 1 Panci", "Tinggi Karbo & Protein", "Super Harum"],
    };
  } else if (query.includes("tahu") || query.includes("tempe")) {
    recipe = {
      title: "Tumis Tahu Tempe Kecap Pedas Manis",
      description: "Paduan tahu tempe kaya protein nabati dengan balutan kuah kecap gurih kental yang boros nasi.",
      category: "Lauk Hemat",
      cookTimeMinutes: 15,
      portions: 1,
      estimatedCost: 8500,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "1/2 papan tempe, potong dadu (Rp 3.000)",
        "1 kotak tahu putih, potong dadu (Rp 2.500)",
        "3 buah cabai rawit & 2 siung bawang merah (Rp 1.500)",
        "2 sdm kecap manis & 1 sdt saus tiram (Rp 1.500)",
        "Sedikit air & garam secukupnya"
      ],
      steps: [
        "Goreng tahu dan tempe sebentar sampai berkulit (setengah matang), tiriskan.",
        "Tumis irisan bawang dan cabai hingga layu dan harum.",
        "Masukkan tahu dan tempe, tambahkan kecap manis, saus tiram, dan sedikit air.",
        "Masak hingga bumbu meresap dan kuah mengental menyelimuti tahu tempe. Siap disajikan!"
      ],
      nutrition: {
        calories: 360,
        protein_g: 24.0,
        fat_g: 12.5,
        carbs_g: 39.0,
        fiber_g: 5.5,
      },
      chefTips: "Potong tempe dan tahu seukuran dadu kecil agar bumbu kecap lebih cepat meresap tanpa perlu dimasak lama.",
      healthTags: ["Super Tinggi Protein", "Kaya Serat Nabati", "Budget Super Irit"],
    };
  } else if (query.includes("sayur") || query.includes("sup") || query.includes("kuah")) {
    recipe = {
      title: "Sup Bening Bayam Jagung Manis Segar",
      description: "Kuah bening segar penambah stamina anak kost dengan paduan bayam kaya zat besi dan manisnya pipilan jagung.",
      category: "Sayur & Sup",
      cookTimeMinutes: 12,
      portions: 1,
      estimatedCost: 7000,
      cookingTool: "Panci Rebus",
      ingredients: [
        "1 ikat bayam segar (Rp 3.000)",
        "1/2 buah jagung manis, potong (Rp 2.000)",
        "2 siung bawang merah, iris tipis (Rp 1.000)",
        "1 ruas kunci atau temu kunci (opsional) & garam, gula secukupnya (Rp 1.000)"
      ],
      steps: [
        "Didihkan 400ml air di panci, masukkan irisan bawang merah dan jagung manis.",
        "Masak selama 5 menit sampai jagung empuk dan manisnya keluar.",
        "Bumbui dengan garam dan sedikit gula, koreksi rasa.",
        "Masukkan daun bayam, masak sebentar saja (1-2 menit) agar tetap hijau segar. Angkat segera!"
      ],
      nutrition: {
        calories: 140,
        protein_g: 5.8,
        fat_g: 1.2,
        carbs_g: 28.0,
        fiber_g: 6.5,
      },
      chefTips: "Jangan merebus bayam terlalu lama agar warna tetap hijau cerah dan vitaminnya tidak rusak.",
      healthTags: ["Kaya Zat Besi & Serat", "Rendah Kalori", "Menyegarkan Tubuh"],
    };
  } else {
    // Default: Omelet telur sayur bumbu bawang
    recipe = {
      title: "Omelet Telur Bawang Cabai Gurih",
      description: "Telur dadar tebal garing di luar lembut di dalam dengan wangi bawang melimpah dan sengatan cabai rawit.",
      category: "Sarapan",
      cookTimeMinutes: 10,
      portions: 1,
      estimatedCost: 6500,
      cookingTool: "Teflon / Wajan",
      ingredients: [
        "2 butir telur ayam (Rp 4.000)",
        "3 siung bawang merah, iris tebal (Rp 1.500)",
        "2 buah cabai rawit merah, iris (Rp 500)",
        "1/2 batang daun bawang & sejumput garam/kaldu bubuk (Rp 500)"
      ],
      steps: [
        "Kocok lepas telur bersama irisan bawang merah, cabai, daun bawang, dan kaldu bubuk sampai berbusa.",
        "Panaskan 2 sdm minyak di wajan hingga benar-benar panas.",
        "Tuang kocokan telur, kecilkan api ke sedang. Biarkan pinggirannya mengembang garing.",
        "Balik sekali, masak hingga kedua sisi kecokelatan keemasan. Sajikan hangat bersama nasi!"
      ],
      nutrition: {
        calories: 275,
        protein_g: 14.5,
        fat_g: 18.0,
        carbs_g: 6.5,
        fiber_g: 1.2,
      },
      chefTips: "Kocok telur agak lama sampai berbusa dan pastikan minyak cukup panas agar telur dadar mengembang keriting garing.",
      healthTags: ["Tinggi Protein", "Siap dalam 10 Menit", "Bahan Selalu Ada"],
    };
  }

  return {
    replyText: `Halo Sobat Kost! Berdasarkan pertanyaan dan preferensimu, Chef AI racikkan menu spesial: **${recipe.title}**. Menu ini sangat pas untuk anak kost karena biayanya terjangkau (sekitar Rp ${recipe.estimatedCost.toLocaleString("id-ID")}), cepat dibuat, dan tetap menjaga kebutuhan nutrisi harianmu!`,
    recipe,
    suggestions: [
      "Bagaimana cara memasak ini pakai rice cooker saja?",
      "Bisa ganti bahan utamanya dengan telur atau tahu?",
      "Rekomendasikan menu hemat lain di bawah Rp 10.000",
    ],
  };
}

export async function askRecipeWithAI(input: AskRecipeRequest): Promise<AskRecipeResponse> {
  const userContent = `
Permintaan User: ${input.prompt || "Buatkan ide resep hemat & lezat"}
Bahan yang tersedia: ${input.ingredients || "Bebas / Bahan umum anak kost"}
Target Budget: ${input.budget ? `Maksimal Rp ${input.budget.toLocaleString("id-ID")}` : "Hemat anak kost"}
Alat Masak Tersedia: ${input.cookingTool || "Rice Cooker atau Teflon Kompor Sederhana"}
Target Gizi: ${input.dietaryGoal || "Seimbang & Bergizi"}
  `.trim();

  const providers: string[] = [];
  if (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2) providers.push("gemini");
  if (process.env.GROQ_API_KEY) providers.push("groq");
  if (process.env.MISTRAL_API_KEY) providers.push("mistral");

  if (providers.length === 0) {
    return fallbackAskRecipe(input);
  }

  const shuffled = [...providers].sort(() => 0.5 - Math.random());

  for (const provider of shuffled) {
    try {
      console.log(`[Ask Recipe AI] Trying provider: ${provider}`);
      let resultText = "";

      if (provider === "gemini") {
        const rawKeys = [
          ...(process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.split(",") : []),
          process.env.GEMINI_API_KEY_2 || "",
        ]
          .map((k) => k.trim())
          .filter(Boolean);

        const geminiKeys = [...new Set(rawKeys)];
        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

        for (const key of geminiKeys) {
          try {
            const ai = new GoogleGenerativeAI(key);
            const model = ai.getGenerativeModel({
              model: modelName,
              systemInstruction: ASK_RECIPE_SYSTEM_PROMPT,
            });

            const response = await model.generateContent({
              contents: [
                ...(input.history || []).map((h) => ({
                  role: h.role === "assistant" ? "model" : "user",
                  parts: [{ text: h.content }],
                })),
                { role: "user", parts: [{ text: userContent }] },
              ],
              generationConfig: {
                responseMimeType: "application/json",
              },
            });

            resultText = response.response.text() || "";
            if (resultText) break;
          } catch (e) {
            console.warn(`[Ask Recipe Gemini] key failed:`, e);
          }
        }
      } else if (provider === "groq") {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

        const completion = await groq.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: ASK_RECIPE_SYSTEM_PROMPT },
            ...(input.history || []).map((h) => ({
              role: h.role as "user" | "assistant",
              content: h.content,
            })),
            { role: "user", content: userContent },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        resultText = completion.choices[0]?.message?.content || "";
      } else if (provider === "mistral") {
        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        const modelName = process.env.MISTRAL_MODEL || "mistral-large-latest";

        const chatResponse = await mistral.chat.complete({
          model: modelName,
          messages: [
            { role: "system", content: ASK_RECIPE_SYSTEM_PROMPT },
            ...(input.history || []).map((h) => ({
              role: h.role as "user" | "assistant",
              content: h.content,
            })),
            { role: "user", content: userContent },
          ],
          responseFormat: { type: "json_object" },
        });

        const content = chatResponse.choices?.[0]?.message?.content;
        resultText = typeof content === "string" ? content : "";
      }

      if (resultText) {
        const parsed = cleanJson(resultText);
        return {
          replyText: parsed.replyText || "Ini rekomendasi resep terbaik untukmu:",
          recipe: parsed.recipe || null,
          suggestions: Array.isArray(parsed.suggestions)
            ? parsed.suggestions
            : [
                "Bagaimana cara memasaknya pakai rice cooker?",
                "Bisakah diganti dengan bahan lain yang lebih murah?",
                "Buatkan variasi menu hemat lainnya",
              ],
        };
      }
    } catch (err) {
      console.error(`[Ask Recipe AI] Provider ${provider} failed:`, err);
    }
  }

  console.warn("[Ask Recipe AI] All providers failed, falling back to heuristic generator");
  return fallbackAskRecipe(input);
}
