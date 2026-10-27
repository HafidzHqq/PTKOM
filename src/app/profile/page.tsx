"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/logout-button";

type BmrResult = {
  bmr: number;
  tdee: number;
  daily_calorie_target: number;
  daily_protein_target: number;
  daily_fat_target: number;
  daily_carb_target: number;
  daily_fiber_target: number;
};

export default function ProfilePage() {
  const { user } = useAuth();

  const [gender, setGender] = useState<"male" | "female">("male");
  const [ageInput, setAgeInput] = useState("25");
  const [weightInput, setWeightInput] = useState("65");
  const [heightInput, setHeightInput] = useState("170");
  const [activity, setActivity] = useState<"sedentary" | "light" | "moderate" | "active">("sedentary");
  const [budgetInput, setBudgetInput] = useState("");
  const [selectedCity, setSelectedCity] = useState("Bandar Lampung");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bmrResult, setBmrResult] = useState<BmrResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [imgError, setImgError] = useState(false);

  // Load saved profile on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("dompetkost_city");
      if (savedCity) setSelectedCity(savedCity);
    }
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/profile");
        const json = await res.json();
        if (!cancelled && json.success && json.data) {
          const d = json.data;
          if (d.gender) setGender(d.gender);
          if (d.age != null) setAgeInput(String(d.age));
          if (d.weight_kg != null) setWeightInput(String(d.weight_kg));
          if (d.height_cm != null) setHeightInput(String(d.height_cm));
          if (d.activity_level) setActivity(d.activity_level);
          if (d.monthly_food_budget != null) setBudgetInput(String(d.monthly_food_budget));
          if (d.daily_calorie_target != null) {
            setBmrResult({
              bmr: d.bmr ?? 0,
              tdee: d.tdee ?? 0,
              daily_calorie_target: d.daily_calorie_target,
              daily_protein_target: d.daily_protein_target,
              daily_fat_target: d.daily_fat_target,
              daily_carb_target: d.daily_carb_target,
              daily_fiber_target: d.daily_fiber_target ?? 0,
            });
          }
        }
      } catch (e) {
        console.error("load profile", e);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { setImgError(false); }, [user?.image]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function sanitizeNumericInput(v: string) {
    let s = v.replace(/[^0-9.]/g, "");
    const parts = s.split(".");
    if (parts.length > 2) s = parts[0] + "." + parts.slice(1).join("");
    if (s.length > 1 && s[0] === "0" && s[1] !== ".") {
      s = s.replace(/^0+/, "");
      if (s === "" || s[0] === ".") s = "0" + s;
    }
    return s;
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    const age = Number(ageInput);
    const weight = Number(weightInput);
    const height = Number(heightInput);

    if (ageInput.trim() === "" || Number.isNaN(age)) e.age = "Umur wajib diisi";
    else if (!Number.isInteger(age)) e.age = "Umur harus bilangan bulat";
    else if (age < 1 || age > 120) e.age = "Umur harus 1–120 tahun";

    if (weightInput.trim() === "" || Number.isNaN(weight)) e.weight = "Berat wajib diisi";
    else if (weight < 20 || weight > 300) e.weight = "Berat harus 20–300 kg";

    if (heightInput.trim() === "" || Number.isNaN(height)) e.height = "Tinggi wajib diisi";
    else if (height < 100 || height > 250) e.height = "Tinggi harus 100–250 cm";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const calculateBMR = async () => {
    if (!validate()) {
      setToast({ type: "error", msg: "Periksa kembali input Anda" });
      return;
    }
    setLoading(true);
    setToast(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("dompetkost_city", selectedCity);
    }
    try {
      // Save budget separately if provided
      if (budgetInput.trim() !== "" && Number(budgetInput) > 0) {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gender,
            age: Number(ageInput),
            weight_kg: Number(weightInput),
            height_cm: Number(heightInput),
            activity_level: activity,
            monthly_food_budget: Number(budgetInput),
          }),
        });
      }
      const res = await fetch("/api/profile/calculate-bmr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          age: Number(ageInput),
          weight_kg: Number(weightInput),
          height_cm: Number(heightInput),
          activity_level: activity,
          save_to_profile: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBmrResult(data.data);
        setToast({ type: "success", msg: "Target gizi berhasil dihitung & disimpan!" });
        setErrors({});
      } else {
        const msg = data.message || "Gagal menghitung";
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.errors as Record<string, string[]>)) {
            fieldErrors[k] = (v as string[])[0];
          }
          setErrors(fieldErrors);
        }
        setToast({ type: "error", msg });
      }
    } catch (e) {
      console.error(e);
      setToast({ type: "error", msg: "Terjadi kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  };

  const initial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  const inputClass = (field: string) =>
    `block w-full rounded-lg border-2 bg-neutral-50 p-4 text-sm font-black text-black focus:bg-white focus:ring-0 transition-colors placeholder:text-neutral-300 ${
      errors[field] ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-black"
    }`;

  return (
    <div className="w-full px-4 py-5 sm:py-8 md:px-8 lg:px-10 xl:px-12 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-orange-700 text-white shadow-xs shrink-0">
            <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">Profil &amp; Porsi</h1>
            <p className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium mt-0.5 sm:mt-1">
              Atur profil dan preferensi porsi untuk panduan kuliner &amp; gizi yang pas di badan dan dompet.
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`rounded-xl border px-5 py-3.5 text-sm font-bold flex items-center gap-2 ${
          toast.type === "success"
            ? "bg-amber-50 border-amber-300 text-amber-950"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {toast.type === "success" ? (
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-neutral-200/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-5 sm:space-y-6">
            {user?.image && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "Avatar"}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-amber-200 shadow-sm object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-amber-100 text-4xl font-black text-amber-900 shadow-sm border-4 border-amber-200">
                {initial}
              </div>
            )}
            <div>
              <h2 className="text-xl font-black text-neutral-900">{user?.name || "Anak Kost Penjelajah"}</h2>
              <p className="text-sm font-medium text-neutral-600 mt-1 break-all">{user?.email || "kost@dompetkost.local"}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950">
                <svg className="w-3.5 h-3.5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{selectedCity}</span>
              </div>
            </div>
            <div className="w-full pt-4 border-t border-neutral-100">
              <LogoutButton />
            </div>
          </div>

          {/* Saved Target Summary */}
          {bmrResult && (
            <div className="rounded-2xl border border-neutral-200/90 bg-white/95 backdrop-blur-md p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-orange-700 border border-amber-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Keseimbangan Porsi Tersimpan</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-600">Energi Target</span>
                  <span className="text-sm font-black text-neutral-900">{bmrResult.daily_calorie_target} kkal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-600">Protein</span>
                  <span className="text-sm font-black text-neutral-900">{bmrResult.daily_protein_target}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-600">Lemak</span>
                  <span className="text-sm font-black text-neutral-900">{bmrResult.daily_fat_target}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-600">Karbohidrat</span>
                  <span className="text-sm font-black text-neutral-900">{bmrResult.daily_carb_target}g</span>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-100">
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">BMR: {bmrResult.bmr} kkal • Kebutuhan Harian (TDEE): {bmrResult.tdee} kkal</p>
              </div>
            </div>
          )}
        </div>

        {/* BMR Calculator */}
          <div className="lg:col-span-8 rounded-2xl border border-neutral-200/90 bg-white/95 backdrop-blur-md p-4 sm:p-6 md:p-8 shadow-xs space-y-6 sm:space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4 relative z-10">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-orange-700 border border-amber-200 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </span>
            <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg md:text-xl leading-snug">Kalkulator Keseimbangan Energi &amp; Porsi</h3>
          </div>

          {loadingProfile ? (
            <div className="flex justify-center py-16 relative z-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-black">Jenis Kelamin</label>
                  <div className="bg-neutral-50 p-1.5 rounded-lg flex border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`flex-1 py-3 text-sm font-bold rounded transition-all ${
                        gender === "male" ? "bg-white text-black shadow-sm border border-neutral-200" : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`flex-1 py-3 text-sm font-bold rounded transition-all ${
                        gender === "female" ? "bg-white text-black shadow-sm border border-neutral-200" : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-black">
                    Umur (tahun) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="25"
                    value={ageInput}
                    onChange={(e) => setAgeInput(sanitizeNumericInput(e.target.value))}
                    className={inputClass("age")}
                  />
                  {errors.age && <p className="text-xs font-bold text-red-500">{errors.age}</p>}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-black">
                    Berat Badan (kg) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="65"
                    value={weightInput}
                    onChange={(e) => setWeightInput(sanitizeNumericInput(e.target.value))}
                    className={inputClass("weight")}
                  />
                  {errors.weight && <p className="text-xs font-bold text-red-500">{errors.weight}</p>}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-black">
                    Tinggi Badan (cm) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="170"
                    value={heightInput}
                    onChange={(e) => setHeightInput(sanitizeNumericInput(e.target.value))}
                    className={inputClass("height")}
                  />
                  {errors.height && <p className="text-xs font-bold text-red-500">{errors.height}</p>}
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-sm font-bold text-neutral-900">
                    Kota / Wilayah Kost <span className="text-amber-800 font-medium">— untuk penyesuaian harga kuliner</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { city: "Bandar Lampung", multiplier: "Standar (1.0x)" },
                      { city: "Jakarta", multiplier: "Metropolitan (+25%)" },
                      { city: "Bandung", multiplier: "Priangan (+5%)" },
                      { city: "Yogyakarta", multiplier: "Pelajar (-15%)" },
                      { city: "Surabaya", multiplier: "Jawa Timur (+5%)" },
                      { city: "Malang", multiplier: "Kampus Dingin (-10%)" },
                    ].map((item) => (
                      <button
                        key={item.city}
                        type="button"
                        onClick={() => setSelectedCity(item.city)}
                        className={`rounded-xl border-2 p-3 text-left transition-all ${
                          selectedCity === item.city
                            ? "border-orange-700 bg-amber-50/90 text-neutral-900 shadow-xs"
                            : "border-neutral-200 bg-neutral-50/80 text-neutral-600 hover:border-amber-300"
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-black text-neutral-900">{item.city}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 ${selectedCity === item.city ? "text-orange-700" : "text-neutral-500"}`}>{item.multiplier}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-sm font-bold text-neutral-900">Budget Makanan Bulanan (Rp) <span className="text-neutral-500 font-medium">— opsional</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 750000"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(sanitizeNumericInput(e.target.value))}
                    className={inputClass("budget")}
                  />
                  {budgetInput && Number(budgetInput) > 0 && (
                    <p className="text-xs font-semibold text-amber-900">≈ Rp {Math.round(Number(budgetInput) / 30).toLocaleString("id-ID")} / hari</p>
                  )}
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-sm font-bold text-neutral-900">Tingkat Aktivitas Kuliah &amp; Harian</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {([
                      { value: "sedentary", label: "Santai", desc: "Rebahan / nugas di kamar" },
                      { value: "light", label: "Ringan", desc: "Jalan santai ke kampus" },
                      { value: "moderate", label: "Sedang", desc: "Aktif jalan & olahraga 3-5x" },
                      { value: "active", label: "Tinggi", desc: "Organisasi padat & rutin gym" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setActivity(opt.value)}
                        className={`rounded-xl border-2 p-3 text-center transition-all ${
                          activity === opt.value
                            ? "border-orange-700 bg-orange-700 text-white shadow-xs"
                            : "border-neutral-200 bg-neutral-50/80 text-neutral-700 hover:border-amber-300"
                        }`}
                      >
                        <p className="text-sm font-black">{opt.label}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 ${activity === opt.value ? "text-amber-100" : "text-neutral-500"}`}>{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={calculateBMR}
                disabled={loading}
                className="w-full rounded-xl bg-orange-700 p-4 sm:p-5 text-base sm:text-lg font-extrabold text-white shadow-md shadow-orange-700/20 hover:bg-orange-800 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Menghitung Porsi Pas...
                  </span>
                ) : (
                  "Simpan Profil &amp; Porsi"
                )}
              </button>
            </div>
          )}

          {/* Results */}
          {bmrResult && (
            <div className="rounded-2xl bg-amber-50/70 p-4 sm:p-6 md:p-8 border border-amber-200/80 relative z-10 space-y-4">
              <h4 className="font-black text-neutral-900 text-center text-lg">Keseimbangan Energi Harian Anda</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { label: "Energi (TDEE)", value: bmrResult.daily_calorie_target, unit: "kkal", color: "text-orange-700" },
                  { label: "Protein", value: bmrResult.daily_protein_target, unit: "g", color: "text-amber-900" },
                  { label: "Lemak", value: bmrResult.daily_fat_target, unit: "g", color: "text-neutral-800" },
                  { label: "Karbohidrat", value: bmrResult.daily_carb_target, unit: "g", color: "text-neutral-800" },
                ].map((item) => (
                  <div key={item.label} className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-xs">
                    <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className={`font-black text-xl ${item.color}`}>
                      {item.value} <span className="text-xs font-medium text-neutral-500">{item.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-center text-amber-950 bg-amber-100/80 py-2.5 rounded-xl uppercase tracking-wider border border-amber-200">
                BMR: {bmrResult.bmr} kkal • Kebutuhan Harian (TDEE): {bmrResult.tdee} kkal
              </p>
              <div className="rounded-xl border border-amber-300 bg-amber-100/60 p-3 text-center">
                <p className="text-xs font-semibold text-amber-950 flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-800 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Ini estimasi umum, bukan saran medis. Punya kondisi kesehatan khusus? Tanyakan ke ahli gizi atau dokter.</span>
                </p>
                <p className="text-[11px] text-neutral-600 mt-1">
                  Formula Mifflin-St Jeor &amp; AKG Kemenkes sebagai acuan edukasi porsi seimbang anak kost.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
