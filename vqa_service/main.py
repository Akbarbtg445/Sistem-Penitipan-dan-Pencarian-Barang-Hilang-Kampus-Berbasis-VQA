import os
import io
import json
import base64
import requests
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / "backend" / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

app = FastAPI(
    title="Campus Lost & Found VQA Service",
    root_path="/api/vqa/py" if os.getenv("VERCEL") else ""
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


class AnalyzeRequest(BaseModel):
    imageBase64: str


class AskRequest(BaseModel):
    imageBase64: str
    question: str


def compress_to_data_url(data_url: str) -> str:
    if "," in data_url:
        _, encoded = data_url.split(",", 1)
    else:
        encoded = data_url

    img_bytes = base64.b64decode(encoded)
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img.thumbnail((800, 800))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=80)
    b64_small = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_small}"


def get_free_vision_models() -> list[str]:
    preferred = [
        "google/gemma-3-27b-it:free",
        "google/gemma-3-12b-it:free",
        "qwen/qwen2.5-vl-72b-instruct:free",
        "qwen/qwen2.5-vl-32b-instruct:free",
        "meta-llama/llama-3.2-11b-vision-instruct:free",
        "mistralai/mistral-small-3.1-24b-instruct:free",
    ]
    try:
        resp = requests.get(f"{OPENROUTER_BASE_URL}/models", timeout=15)
        if resp.status_code == 200:
            dynamic = []
            for m in resp.json().get("data", []):
                mid = m.get("id", "")
                modalities = m.get("architecture", {}).get("input_modalities", [])
                if mid.endswith(":free") and "image" in modalities and mid not in preferred:
                    dynamic.append(mid)
            return preferred + dynamic[:6]
    except Exception:
        pass
    return preferred


def call_vision_llm(messages: list, temperature: float = 0.2) -> str:
    if not OPENROUTER_API_KEY:
        raise RuntimeError(f"OPENROUTER_API_KEY belum diisi di {ENV_PATH}")

    candidates = get_free_vision_models()
    last_error = ""

    for model_id in candidates:
        resp = requests.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "UMY Campus Lost and Found VQA",
            },
            json={
                "model": model_id,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": 500,
            },
            timeout=30,
        )
        if resp.status_code == 200:
            data = resp.json()
            if "choices" in data and data["choices"]:
                return data["choices"][0]["message"]["content"].strip()
        last_error = f"[{model_id}] HTTP {resp.status_code}: {resp.text[:250]}"

    raise RuntimeError(f"Semua kandidat model vision gagal. Terakhir: {last_error}")


@app.post("/analyze")
async def analyze_image(req: AnalyzeRequest):
    try:
        image_url = compress_to_data_url(req.imageBase64)

        raw_text = call_vision_llm(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Analisis foto ini untuk sistem Lost & Found kampus. "
                                "Kembalikan HANYA JSON murni tanpa markdown dengan kunci persis: "
                                '{"kategori": "...", "warna": "...", "bahan": "...", "teks": ["..."]}. '
                                "Isi 'teks' dengan tulisan/merek/stiker yang terlihat di gambar (array string)."
                            ),
                        },
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
            temperature=0.2,
        )

        raw_text = raw_text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(raw_text)

        return {
            "status": "success",
            "data": {
                "kategori": parsed.get("kategori", "Lainnya"),
                "warna": parsed.get("warna", "Tidak terdeteksi"),
                "bahan": parsed.get("bahan", "Tidak terdeteksi"),
                "teks": parsed.get("teks", []),
            },
        }
    except Exception as e:
        print("ERROR /analyze:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask")
async def ask_image(req: AskRequest):
    try:
        image_url = compress_to_data_url(req.imageBase64)

        answer = call_vision_llm(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Kamu adalah asisten AI Lost & Found kampus UMY. "
                                "Jawab pertanyaan pengguna berikut secara singkat, jelas, dan akurat dalam Bahasa Indonesia berdasarkan foto ini.\n"
                                f"Pertanyaan: {req.question}"
                            ),
                        },
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
            temperature=0.3,
        )

        return {
            "status": "success",
            "answer": answer,
        }
    except Exception as e:
        print("ERROR /ask:", e)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)