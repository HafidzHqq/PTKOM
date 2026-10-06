-- Tabel Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  weight_kg DECIMAL,
  height_cm DECIMAL,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active')),
  daily_calorie_target INTEGER,
  daily_protein_target INTEGER,
  daily_fat_target INTEGER,
  daily_carb_target INTEGER,
  monthly_food_budget INTEGER, -- dalam Rupiah
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Food Logs (Riwayat Makan)
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  food_name_en TEXT, -- untuk lookup di USDA/OpenFoodFacts
  photo_url TEXT,
  calories DECIMAL,
  protein_g DECIMAL,
  fat_g DECIMAL,
  carbs_g DECIMAL,
  fiber_g DECIMAL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  ai_confidence DECIMAL, -- confidence score dari Gemini
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Rekomendasi Makanan Lokal (Seed Data)
CREATE TABLE local_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT, -- 'lauk', 'sayur', 'pokok', 'snack'
  avg_price_idr INTEGER,
  calories DECIMAL,
  protein_g DECIMAL,
  fat_g DECIMAL,
  carbs_g DECIMAL,
  fiber_g DECIMAL,
  availability TEXT, -- 'warteg', 'kantin', 'minimarket', 'masak_sendiri'
  is_budget_friendly BOOLEAN DEFAULT true
);

-- Insert Seed Data for Local Foods
INSERT INTO local_foods (name, category, avg_price_idr, calories, protein_g, fat_g, carbs_g, fiber_g, availability) VALUES
('Nasi Putih', 'pokok', 3000, 260, 4.4, 0.4, 57, 0.6, 'warteg'),
('Tempe Goreng (2 potong)', 'lauk', 4000, 200, 18, 10, 8, 3, 'warteg'),
('Tahu Bacem (3 buah)', 'lauk', 5000, 180, 15, 9, 6, 1, 'warteg'),
('Telur Dadar', 'lauk', 5000, 150, 10, 11, 1, 0, 'warteg'),
('Sayur Bayam', 'sayur', 3000, 40, 3, 0.5, 6, 4, 'warteg'),
('Ayam Goreng', 'lauk', 10000, 300, 25, 18, 5, 0, 'warteg'),
('Pecel Lele + Nasi', 'paket', 12000, 550, 28, 22, 60, 2, 'kantin'),
('Mie Instan (1 bungkus)', 'pokok', 3500, 380, 8, 14, 52, 2, 'masak_sendiri');

-- Setup Storage Bucket for Food Images
INSERT INTO storage.buckets (id, name, public) VALUES ('food-images', 'food-images', true) ON CONFLICT (id) DO NOTHING;

-- Set up Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'food-images');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_foods ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Policies for food_logs table
CREATE POLICY "Users can view their own food logs" ON food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own food logs" ON food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own food logs" ON food_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own food logs" ON food_logs FOR DELETE USING (auth.uid() = user_id);

-- Policies for local_foods table (public read-only)
CREATE POLICY "Anyone can view local foods" ON local_foods FOR SELECT USING (true);
