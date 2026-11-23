import os
import io
import re
import json
import time
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

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


def get_openrouter_key() -> str:
    return (os.getenv("OPENROUTER_API_KEY") or "").strip().strip('"').strip("'")


class AnalyzeRequest(BaseModel):
    imageBase64: str


class AskRequest(BaseModel):
    imageBase64: str
    question: str


def compress_to_data_url(data_url: str) -> str:
    if not data_url:
        raise ValueError("imageBase64 kosong.")

    if data_url.startswith("http://") or data_url.startswith("https://"):
        img_resp = requests.get(data_url, timeout=15)
        img_resp.raise_for_status()
        img_bytes = img_resp.content
    else:
        if "," in data_url:
            _, encoded = data_url.split(",", 1)
        else:
            encoded = data_url
        img_bytes = base64.b64decode(encoded)

    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img.thumbnail((1280, 1280))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=88)
    b64_small = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_small}"


def get_free_vision_models() -> list[str]:
    return [
        "google/gemini-2.5-flash",
        "google/gemini-2.0-flash-001",
        "openrouter/free",
        "google/gemma-3-27b-it:free",
        "google/gemma-3-12b-it:free",
        "qwen/qwen2.5-vl-72b-instruct:free",
        "meta-llama/llama-3.2-11b-vision-instruct:free",
        "mistralai/mistral-small-3.1-24b-instruct:free",
    ]


def call_vision_llm(messages: list, temperature: float = 0.2) -> str:
    api_key = get_openrouter_key()
    if not api_key:
        raise RuntimeError(f"OPENROUTER_API_KEY belum diisi di environment atau {ENV_PATH}")

    candidates = get_free_vision_models()
    last_error = ""

    for model_id in candidates:
        try:
            resp = requests.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                    "HTTP-Referer": "https://vqaservice.vercel.app",
                    "X-Title": "UMY Campus Lost and Found VQA",
                },
                json={
                    "model": model_id,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": 1500,
                },
                timeout=20,
            )
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices") or []
                if choices:
                    msg = choices[0].get("message") or {}
                    content = msg.get("content")
                    if isinstance(content, str) and content.strip():
                        return content.strip()
                last_error = f"[{model_id}] HTTP 200 tetapi content kosong/None"
            else:
                last_error = f"[{model_id}] HTTP {resp.status_code}: {resp.text[:200]}"
                if resp.status_code == 429:
                    time.sleep(0.5)
        except Exception as err:
            last_error = f"[{model_id}] Exception: {err}"

    raise RuntimeError(f"Semua kandidat model vision gagal. Terakhir: {last_error}")


def extract_json_object(raw_text: str) -> dict:
    cleaned = (raw_text or "").strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    candidate = match.group(0) if match else cleaned

    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        def grab_field(key: str, default: str) -> str:
            m = re.search(rf'"{key}"\s*:\s*"([^"\n\r]*)', candidate)
            return m.group(1).strip() if m and m.group(1).strip() else default

        teks_items = []
        teks_match = re.search(r'"teks"\s*:\s*\[([^\]]*)', candidate, flags=re.DOTALL)
        if teks_match:
            teks_items = [t.strip() for t in re.findall(r'"([^"\n\r]+)"', teks_match.group(1)) if t.strip()]

        return {
            "kategori": grab_field("kategori", "Lainnya"),
            "warna": grab_field("warna", "Tidak terdeteksi"),
            "bahan": grab_field("bahan", "Tidak terdeteksi"),
            "teks": teks_items[:5],
        }


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
                                "Analisis gambar ini secara teliti untuk sistem Lost & Found kampus. "
                                "Fokus pada objek utama atau elemen paling menonjol meskipun latar belakang ramai/rumit. "
                                "Kembalikan HANYA 1 baris JSON valid tanpa markdown dan tanpa tanda kutip ganda di dalam isi teks: "
                                '{"kategori": "...", "warna": "...", "bahan": "...", "teks": ["..."]}. '
                                "Aturan: 'kategori' maksimal 3 kata; 'warna' maksimal 3 warna dominan; "
                                "'bahan' perkiraan material/jenis visual; 'teks' maksimal 5 teks/label paling penting (masing-masing maks 4 kata)."
                            ),
                        },
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
            temperature=0.1,
        )

        parsed = extract_json_object(raw_text)
        teks_list = parsed.get("teks") if isinstance(parsed.get("teks"), list) else []

        return {
            "status": "success",
            "data": {
                "kategori": parsed.get("kategori") or "Lainnya",
                "warna": parsed.get("warna") or "Tidak terdeteksi",
                "bahan": parsed.get("bahan") or "Tidak terdeteksi",
                "teks": teks_list,
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