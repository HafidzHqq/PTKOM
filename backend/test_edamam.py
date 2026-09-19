import requests

# 1. Daftar di https://developer.edamam.com/edamam-nutrition-api
# 2. Masukkan App ID dan App Key Anda di bawah ini
APP_ID = "MASUKKAN_APP_ID_ANDA_DISINI"
APP_KEY = "MASUKKAN_APP_KEY_ANDA_DISINI"

def get_nutrition_data(food_query: str):
    print(f"Mencari data gizi untuk: {food_query}...")
    url = f"https://api.edamam.com/api/nutrition-data?app_id={APP_ID}&app_key={APP_KEY}&nutrition-type=logging&ingr={food_query}"
    
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if 'calories' in data and data['calories'] > 0:
            print(f"✅ Data Ditemukan!")
            print(f"- Kalori: {data['calories']} kcal")
            print(f"- Protein: {data['totalNutrients'].get('PROCNT', {}).get('quantity', 0):.1f} g")
            print(f"- Lemak: {data['totalNutrients'].get('FAT', {}).get('quantity', 0):.1f} g")
            print(f"- Karbohidrat: {data['totalNutrients'].get('CHOCDF', {}).get('quantity', 0):.1f} g")
        else:
            print("❌ Makanan tidak ditemukan atau porsi tidak valid.")
    else:
        print(f"❌ Error API: {response.status_code}")
        print("Pastikan Anda sudah mengganti APP_ID dan APP_KEY.")

if __name__ == "__main__":
    # Contoh pencarian (gunakan bahasa inggris lebih disarankan untuk Edamam)
    get_nutrition_data("1 bowl of chicken soup")
