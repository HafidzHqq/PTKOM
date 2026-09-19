import requests
import os
from dotenv import load_dotenv

# Load credentials from .env file
load_dotenv()
CLIENT_ID = os.getenv("FATSECRET_CLIENT_ID")
CLIENT_SECRET = os.getenv("FATSECRET_CLIENT_SECRET")

def get_access_token():
    token_url = "https://oauth.fatsecret.com/connect/token"
    data = {"grant_type": "client_credentials", "scope": "basic"}
    response = requests.post(token_url, auth=(CLIENT_ID, CLIENT_SECRET), data=data)
    
    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        print(f"Gagal mendapatkan token: {response.json()}")
        return None

def search_food(token, query):
    api_url = "https://platform.fatsecret.com/rest/server.api"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "method": "foods.search",
        "search_expression": query,
        "format": "json"
    }
    
    response = requests.get(api_url, headers=headers, params=params)
    if response.status_code == 200:
        data = response.json()
        if 'error' in data:
            print(f"Error dari FatSecret: {data['error'].get('message')}")
            return
            
        foods = data.get('foods', {}).get('food', [])
        if not foods:
            print("Makanan tidak ditemukan.")
            return
            
        print(f"\nHasil pencarian untuk '{query}':")
        # Menampilkan 3 hasil pertama
        for food in (foods if isinstance(foods, list) else [foods])[:3]:
            print(f"- {food.get('food_name')} ({food.get('food_description')})")
    else:
        print(f"Error API: {response.status_code}")

if __name__ == "__main__":
    if not CLIENT_ID or not CLIENT_SECRET:
        print("Error: FATSECRET_CLIENT_ID atau FATSECRET_CLIENT_SECRET tidak ditemukan di file .env")
    else:
        token = get_access_token()
        if token:
            search_food(token, "soto ayam")
