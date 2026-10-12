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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bmrResult, setBmrResult] = useState<BmrResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [imgError, setImgError] = useState(false);

  // Load saved profile on mount
  useEffect(() => {
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
    <div className="w-full px-4 py-8 md:px-8 max-w-[1440px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-black text-white shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight">Profil & Target Gizi</h1>
            <p className="text-sm md:text-base text-neutral-500 font-medium mt-1">
              Atur profil Anda untuk mendapatkan target gizi yang lebih akurat.
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`rounded-lg border px-5 py-3.5 text-sm font-bold flex items-center gap-2 ${
          toast.type === "success"
            ? "bg-neutral-50 border-neutral-200 text-black"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm flex flex-col items-center text-center space-y-6">
            {user?.image && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "Avatar"}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-28 w-28 rounded-full border-4 border-neutral-100 shadow-sm object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-neutral-100 text-4xl font-black text-black shadow-sm border-4 border-neutral-50">
                {initial}
              </div>
            )}
            <div>
              <h2 className="text-xl font-black text-black">{user?.name || "Tamu (Guest)"}</h2>
              <p className="text-sm font-medium text-neutral-500 mt-1 break-all">{user?.email || "guest@dompetkost.local"}</p>
            </div>
            <div className="w-full pt-4 border-t border-neutral-100">
              <LogoutButton />
            </div>
          </div>

          {/* Saved Target Summary */}
          {bmrResult && (
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 text-black">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">Target Tersimpan</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-500">Kalori</span>
                  <span className="text-sm font-black text-black">{bmrResult.daily_calorie_target} kcal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-500">Protein</span>
                  <span className="text-sm font-black text-black">{bmrResult.daily_protein_target}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-500">Lemak</span>
                  <span className="text-sm font-black text-black">{bmrResult.daily_fat_target}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-500">Karbohidrat</span>
                  <span className="text-sm font-black text-black">{bmrResult.daily_carb_target}g</span>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-100">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">BMR: {bmrResult.bmr} kcal • TDEE: {bmrResult.tdee} kcal</p>
              </div>
            </div>
          )}
        </div>

        {/* BMR Calculator */}
        <div className="lg:col-span-8 rounded-lg border border-neutral-200 bg-white p-6 md:p-8 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-neutral-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4 relative z-10">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 text-black">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </span>
            <h3 className="font-extrabold text-black text-lg md:text-xl">Kalkulator BMR & TDEE</h3>
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
                      ♂ Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`flex-1 py-3 text-sm font-bold rounded transition-all ${
                        gender === "female" ? "bg-white text-black shadow-sm border border-neutral-200" : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      ♀ Perempuan
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
                  <label className="block text-sm font-bold text-black">Budget Makanan Bulanan (Rp) <span className="text-neutral-400 font-medium">— opsional</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 750000"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(sanitizeNumericInput(e.target.value))}
                    className={inputClass("budget")}
                  />
                  {budgetInput && Number(budgetInput) > 0 && (
                    <p className="text-xs font-medium text-neutral-500">≈ Rp {Math.round(Number(budgetInput) / 30).toLocaleString("id-ID")} / hari</p>
                  )}
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-sm font-bold text-black">Tingkat Aktivitas</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {([
                      { value: "sedentary", label: "Jarang", desc: "Tidak olahraga" },
                      { value: "light", label: "Ringan", desc: "1-3 hari/minggu" },
                      { value: "moderate", label: "Sedang", desc: "3-5 hari/minggu" },
                      { value: "active", label: "Berat", desc: "6-7 hari/minggu" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setActivity(opt.value)}
                        className={`rounded-lg border-2 p-3 text-center transition-all ${
                          activity === opt.value
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        <p className="text-sm font-black">{opt.label}</p>
                        <p className={`text-[10px] font-bold mt-0.5 ${activity === opt.value ? "text-neutral-300" : "text-neutral-400"}`}>{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={calculateBMR}
                disabled={loading}
                className="w-full rounded-lg bg-black p-5 text-lg font-bold text-white shadow-lg hover:bg-neutral-800 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Menghitung...
                  </span>
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          )}

          {/* Results */}
          {bmrResult && (
            <div className="rounded-lg bg-neutral-50 p-6 md:p-8 border border-neutral-200 relative z-10">
              <h4 className="font-black text-black mb-6 text-center text-lg">Target Harian Anda</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { label: "Kalori (TDEE)", value: bmrResult.daily_calorie_target, unit: "kcal", color: "text-black" },
                  { label: "Protein", value: bmrResult.daily_protein_target, unit: "g", color: "text-black" },
                  { label: "Lemak", value: bmrResult.daily_fat_target, unit: "g", color: "text-black" },
                  { label: "Karbohidrat", value: bmrResult.daily_carb_target, unit: "g", color: "text-black" },
                ].map((item) => (
                  <div key={item.label} className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className={`font-black text-xl ${item.color}`}>
                      {item.value} <span className="text-xs font-medium text-neutral-400">{item.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-center text-neutral-400 mt-6 bg-neutral-100 py-2.5 rounded uppercase tracking-wider">
                BMR: {bmrResult.bmr} kcal • TDEE: {bmrResult.tdee} kcal
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
