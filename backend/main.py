from fastapi import FastAPI

app = FastAPI(title="Kuliner-In ML Service")

@app.get("/")
def read_root():
    return {"message": "Welcome to Kuliner-In ML Service"}

@app.get("/api/recommendations")
def get_recommendations():
    # TODO: Implement ML logic here
    return {"recommendations": []}

