from fastapi import FastAPI

app = FastAPI(title="WMS 仓储物流后端")

@app.get("/")
def health():
    return {"status": "ok", "service": "wms-backend"}
