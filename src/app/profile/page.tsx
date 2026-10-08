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
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-purple-100 text-purple-600 shadow-sm">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">Profil & Target Gizi</h1>
          <p className="text-sm md:text-base text-neutral-500 font-medium mt-1">
            Atur profil Anda untuk mendapatkan target gizi yang lebih akurat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="rounded-lg border border-neutral-100 bg-white p-8 shadow-sm flex flex-col items-center text-center space-y-6">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="Avatar" className="h-32 w-32 rounded-full border-4 border-emerald-50 shadow-sm" />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-100 text-4xl font-black text-emerald-700 shadow-sm">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-black text-neutral-900">{user?.name || "Tamu (Guest)"}</h2>
            <p className="text-sm font-medium text-neutral-500 mt-1">{user?.email || "guest@dompetkost.local"}</p>
          </div>
          <div className="w-full pt-6 border-t border-neutral-100">
            <LogoutButton />
          </div>
        </div>

        {/* BMR Calculator */}
        <div className="lg:col-span-2 rounded-lg border border-neutral-100 bg-white p-6 md:p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <span className="text-2xl">🧮</span>
            <h3 className="text-xl font-black text-neutral-900">Kalkulator BMR & TDEE</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Jenis Kelamin</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full rounded-lg border-2 border-neutral-100 bg-neutral-50 p-4 text-sm font-bold text-neutral-900 focus:border-emerald-500 focus:bg-white focus:ring-0 transition-colors">
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Umur (tahun)</label>
              <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full rounded-lg border-2 border-neutral-100 bg-neutral-50 p-4 text-sm font-bold text-neutral-900 focus:border-emerald-500 focus:bg-white focus:ring-0 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Berat Badan (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full rounded-lg border-2 border-neutral-100 bg-neutral-50 p-4 text-sm font-bold text-neutral-900 focus:border-emerald-500 focus:bg-white focus:ring-0 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Tinggi Badan (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full rounded-lg border-2 border-neutral-100 bg-neutral-50 p-4 text-sm font-bold text-neutral-900 focus:border-emerald-500 focus:bg-white focus:ring-0 transition-colors" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-bold text-neutral-700">Tingkat Aktivitas</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value as any)} className="w-full rounded-lg border-2 border-neutral-100 bg-neutral-50 p-4 text-sm font-bold text-neutral-900 focus:border-emerald-500 focus:bg-white focus:ring-0 transition-colors">
                <option value="sedentary">Jarang Olahraga (Sedentary)</option>
                <option value="light">Olahraga Ringan (1-3 hari/minggu)</option>
                <option value="moderate">Olahraga Sedang (3-5 hari/minggu)</option>
                <option value="active">Olahraga Berat (6-7 hari/minggu)</option>
              </select>
            </div>
          </div>

          <button onClick={calculateBMR} disabled={loading} className="w-full rounded-lg bg-emerald-600 p-5 text-lg font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100">
            {loading ? "Menghitung..." : "Hitung Target Gizi"}
          </button>

          {bmrResult && (
            <div className="mt-8 rounded-lg bg-emerald-50 p-6 md:p-8 border border-emerald-100">
              <h4 className="font-black text-emerald-900 mb-6 text-center text-lg">Target Harian Anda</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Kalori (TDEE)</p>
                  <p className="font-black text-orange-600 text-xl">{bmrResult.daily_calorie_target} <span className="text-xs font-medium">kcal</span></p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Protein</p>
                  <p className="font-black text-blue-600 text-xl">{bmrResult.daily_protein_target} <span className="text-xs font-medium">g</span></p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Lemak</p>
                  <p className="font-black text-yellow-600 text-xl">{bmrResult.daily_fat_target} <span className="text-xs font-medium">g</span></p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Karbohidrat</p>
                  <p className="font-black text-purple-600 text-xl">{bmrResult.daily_carb_target} <span className="text-xs font-medium">g</span></p>
                </div>
              </div>
              <p className="text-xs font-medium text-center text-emerald-700 mt-6 bg-emerald-100/50 py-2 rounded">
                *BMR Anda: <strong>{bmrResult.bmr} kcal</strong> (Kalori yang terbakar saat istirahat total)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
