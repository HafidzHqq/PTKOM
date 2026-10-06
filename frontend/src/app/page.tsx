"use client";

import { useState } from "react";
import { FoodAnalysisResult } from "@/lib/ai";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/logout-button";
import NutritionHistory from "@/components/nutrition-history";
import FoodRecommendations from "@/components/food-recommendations";

export default function Home() {
  const { user, signOut } = useAuth();
  // const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historySaveError, setHistorySaveError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setFoodName(""); // Clear text input when image is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoodName(e.target.value);
    if (e.target.value) {
      setPreview(null); // Clear image when text is typed
    }
  };

  const handleAnalyze = async () => {
    if (!preview && !foodName.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
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
        throw new Error(data.error || "Gagal menganalisis gambar");
      }

      setResult(data);
      try {
        const saveResponse = await fetch("/api/nutrition-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!saveResponse.ok) {
          const saveData = await saveResponse.json();
          setHistorySaveError(
            saveData.error || "Hasil analisis tidak berhasil disimpan.",
          );
        } else {
          setHistoryRefreshKey((key) => key + 1);
        }
      } catch {
        setHistorySaveError(
          "Koneksi gagal. Hasil analisis belum masuk ke riwayat.",
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const displayUser = user || {
    name: "Tamu (Guest)",
    email: "guest@gizikost.local",
    image: null
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header with User Info */}
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {displayUser.image ? (
              <img
                src={displayUser.image}
                alt="Avatar"
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                {displayUser.email?.[0].toUpperCase() || "U"}
              </div>
            )}
            <div>
              <p className="font-medium">{displayUser.name || displayUser.email}</p>
              <p className="text-xs text-gray-500">Siap menganalisis makanan!</p>
            </div>
          </div>
          {user ? (
            <button
              onClick={signOut}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Keluar
            </button>
          ) : (
            <a
              href="/login"
              className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              Login
            </a>
          )}
        </div>

        <header className="space-y-2 text-center">
          <div className="flex justify-end">
            <LogoutButton />
          </div>
          <h1 className="text-4xl font-bold text-green-600">
            🥗 GiziKost (Test UI)
          </h1>
          <p className="text-gray-500">
            Upload foto makanan atau ketik nama makanan untuk dianalisis oleh AI Round-Robin.
          </p>
        </header>

        <FoodRecommendations refreshKey={historyRefreshKey} />

        <NutritionHistory refreshKey={historyRefreshKey} />

        <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Ketik Nama Makanan
            </label>
            <input
              type="text"
              placeholder="Contoh: Nasi Goreng Telur, Ayam Bakar..."
              value={foodName}
              onChange={handleTextChange}
              className="block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 flex-shrink-0 text-sm text-gray-400">ATAU</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Pilih Foto Makanan
            </label>
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
            />
          </div>

          {preview && (
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="max-h-full object-contain"
              />
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={(!preview && !foodName.trim()) || loading}
            className={`w-full rounded-md px-4 py-3 font-semibold text-white transition-colors ${
              (!preview && !foodName.trim()) || loading
                ? "cursor-not-allowed bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Menganalisis dengan AI..." : "🔍 Analisis Makanan"}
          </button>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {historySaveError && (
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            Analisis berhasil, tetapi riwayat belum tersimpan: {historySaveError}
          </div>
        )}

        {result && (
          <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="border-b pb-2 text-2xl font-semibold">
              Hasil Analisis
            </h2>

            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-5">
              <div className="rounded-lg bg-orange-50 p-3">
                <p className="text-sm font-medium text-orange-600">Kalori</p>
                <p className="text-xl font-bold">
                  {result.total_nutrition.calories}{" "}
                  <span className="text-sm font-normal">kcal</span>
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-600">Protein</p>
                <p className="text-xl font-bold">
                  {result.total_nutrition.protein_g}{" "}
                  <span className="text-sm font-normal">g</span>
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3">
                <p className="text-sm font-medium text-yellow-600">Lemak</p>
                <p className="text-xl font-bold">
                  {result.total_nutrition.fat_g}{" "}
                  <span className="text-sm font-normal">g</span>
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3">
                <p className="text-sm font-medium text-purple-600">Karbo</p>
                <p className="text-xl font-bold">
                  {result.total_nutrition.carbs_g}{" "}
                  <span className="text-sm font-normal">g</span>
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-sm font-medium text-green-600">Serat</p>
                <p className="text-xl font-bold">
                  {result.total_nutrition.fiber_g}{" "}
                  <span className="text-sm font-normal">g</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium">Makanan yang terdeteksi:</h3>
              <ul className="space-y-2">
                {result.foods.map((food, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3"
                  >
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <p className="text-xs text-gray-500">
                        {food.name_en} • Estimasi: {food.portion_grams}g
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {food.nutrition.calories} kcal
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Catatan Gizi:</h3>
              <ul className="list-disc space-y-1 pl-5 text-gray-700">
                {result.health_notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <h3 className="mb-2 text-sm font-medium text-gray-500">
                Raw JSON:
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
