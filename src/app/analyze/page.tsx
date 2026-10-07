"use client";

import { useState } from "react";
import { FoodAnalysisResult } from "@/lib/ai";

export default function AnalyzePage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historySaveSuccess, setHistorySaveSuccess] = useState(false);
  const [historySaveError, setHistorySaveError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setFoodName("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoodName(e.target.value);
    if (e.target.value) {
      setPreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!preview && !foodName.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setHistorySaveSuccess(false);
    setHistorySaveError(null);

    try {
      const payload = preview
        ? { imageBase64: preview }
        : { text: foodName.trim() };

      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menganalisis makanan");
      }

      setResult(data);

      // Auto save to nutrition history
      try {
        const saveResponse = await fetch("/api/nutrition-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!saveResponse.ok) {
          const saveData = await saveResponse.json();
          setHistorySaveError(saveData.error || "Gagal menyimpan ke riwayat.");
        } else {
          setHistorySaveSuccess(true);
        }
      } catch {
        setHistorySaveError("Koneksi gagal. Hasil belum masuk riwayat.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
          📸 Analisis Makanan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Foto atau ketik nama makanan untuk mendeteksi kandungan nutrisinya via AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Input */}
        <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Ketik Nama Makanan
            </label>
            <input
              type="text"
              placeholder="Contoh: Nasi Padang Rendang, Es Teh Manis..."
              value={foodName}
              onChange={handleTextChange}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 flex-shrink-0 text-xs font-medium text-gray-400">
              ATAU UPLOAD FOTO
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Pilih Foto Makanan
            </label>
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100 cursor-pointer"
            />
          </div>

          {preview && (
            <div className="relative flex aspect-video max-h-64 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview Makanan"
                className="max-h-full object-contain"
              />
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={(!preview && !foodName.trim()) || loading}
            className={`w-full rounded-xl px-4 py-3.5 font-semibold text-white shadow-sm transition-all ${
              (!preview && !foodName.trim()) || loading
                ? "cursor-not-allowed bg-gray-300"
                : "bg-green-600 hover:bg-green-700 active:scale-[0.99]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Menganalisis dengan AI...
              </span>
            ) : (
              "🔍 Mulai Analisis"
            )}
          </button>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {historySaveSuccess && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-800">
              ✅ Analisis berhasil disimpan ke riwayat harian Anda!
            </div>
          )}

          {historySaveError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              ⚠️ {historySaveError}
            </div>
          )}
        </section>

        {/* Result Container */}
        <div>
          {result ? (
            <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="border-b pb-3 text-xl font-bold text-gray-900">
                📊 Hasil Analisis Nutrisi
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="rounded-xl bg-orange-50 p-3 border border-orange-100">
                  <p className="text-xs font-semibold text-orange-600">Kalori</p>
                  <p className="text-lg font-bold text-gray-900">
                    {result.total_nutrition.calories}{" "}
                    <span className="text-xs font-normal">kcal</span>
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600">Protein</p>
                  <p className="text-lg font-bold text-gray-900">
                    {result.total_nutrition.protein_g}{" "}
                    <span className="text-xs font-normal">g</span>
                  </p>
                </div>
                <div className="rounded-xl bg-yellow-50 p-3 border border-yellow-100">
                  <p className="text-xs font-semibold text-yellow-600">Lemak</p>
                  <p className="text-lg font-bold text-gray-900">
                    {result.total_nutrition.fat_g}{" "}
                    <span className="text-xs font-normal">g</span>
                  </p>
                </div>
                <div className="rounded-xl bg-purple-50 p-3 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600">Karbo</p>
                  <p className="text-lg font-bold text-gray-900">
                    {result.total_nutrition.carbs_g}{" "}
                    <span className="text-xs font-normal">g</span>
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl bg-green-50 p-3 border border-green-100">
                  <p className="text-xs font-semibold text-green-600">Serat</p>
                  <p className="text-lg font-bold text-gray-900">
                    {result.total_nutrition.fiber_g}{" "}
                    <span className="text-xs font-normal">g</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Komponen Terdeteksi:
                </h3>
                <ul className="space-y-2">
                  {result.foods.map((food, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{food.name}</p>
                        <p className="text-xs text-gray-500">
                          {food.name_en} • ~{food.portion_grams}g
                        </p>
                      </div>
                      <div className="text-right text-xs font-semibold text-gray-700">
                        {food.nutrition.calories} kcal
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  Catatan Kesehatan:
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-xs text-gray-600">
                  {result.health_notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            </section>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
              <span className="text-4xl mb-2">🍽️</span>
              <p className="text-sm font-medium text-gray-600">
                Belum ada makanan yang dianalisis
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Masukkan nama makanan atau unggah foto untuk melihat rincian gizinya di sini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
