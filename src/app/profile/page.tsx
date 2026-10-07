"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/logout-button";

export default function ProfilePage() {
  const { user } = useAuth();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(65);
  const [height, setHeight] = useState<number>(170);
  const [activity, setActivity] = useState<"sedentary" | "light" | "moderate" | "active">("moderate");
  
  const [bmrResult, setBmrResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculateBMR = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/calculate-bmr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender, age, weight_kg: weight, height_cm: height, activity_level: activity }),
      });
      const data = await res.json();
      if (data.success) {
        setBmrResult(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">👤 Profil & Target Gizi</h1>
        <p className="text-sm text-gray-500 mt-1">Atur profil Anda untuk mendapatkan target gizi yang lebih akurat.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="Avatar" className="h-24 w-24 rounded-full border-4 border-green-50" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name || "Tamu (Guest)"}</h2>
            <p className="text-sm text-gray-500">{user?.email || "guest@dompetkost.local"}</p>
          </div>
          <div className="w-full pt-4 border-t border-gray-100">
            <LogoutButton />
          </div>
        </div>

        {/* BMR Calculator */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Kalkulator BMR & TDEE</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Jenis Kelamin</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full rounded-lg border border-gray-300 p-2.5 text-sm">
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Umur (tahun)</label>
              <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Berat Badan (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Tinggi Badan (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-gray-600">Tingkat Aktivitas</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value as any)} className="w-full rounded-lg border border-gray-300 p-2.5 text-sm">
                <option value="sedentary">Jarang Olahraga (Sedentary)</option>
                <option value="light">Olahraga Ringan (1-3 hari/minggu)</option>
                <option value="moderate">Olahraga Sedang (3-5 hari/minggu)</option>
                <option value="active">Olahraga Berat (6-7 hari/minggu)</option>
              </select>
            </div>
          </div>

          <button onClick={calculateBMR} disabled={loading} className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-50">
            {loading ? "Menghitung..." : "Hitung Target Gizi"}
          </button>

          {bmrResult && (
            <div className="mt-4 rounded-xl bg-green-50 p-4 border border-green-100">
              <h4 className="font-bold text-green-900 mb-3 text-center">Target Harian Anda</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-2 rounded-lg border border-green-100">
                  <p className="text-[10px] text-gray-500">Kalori (TDEE)</p>
                  <p className="font-bold text-orange-600">{bmrResult.daily_calorie_target} <span className="text-[10px]">kcal</span></p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-green-100">
                  <p className="text-[10px] text-gray-500">Protein</p>
                  <p className="font-bold text-blue-600">{bmrResult.daily_protein_target} <span className="text-[10px]">g</span></p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-green-100">
                  <p className="text-[10px] text-gray-500">Lemak</p>
                  <p className="font-bold text-yellow-600">{bmrResult.daily_fat_target} <span className="text-[10px]">g</span></p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-green-100">
                  <p className="text-[10px] text-gray-500">Karbohidrat</p>
                  <p className="font-bold text-purple-600">{bmrResult.daily_carb_target} <span className="text-[10px]">g</span></p>
                </div>
              </div>
              <p className="text-[10px] text-center text-gray-500 mt-3">*BMR Anda: {bmrResult.bmr} kcal (Kalori yang terbakar saat istirahat total)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
