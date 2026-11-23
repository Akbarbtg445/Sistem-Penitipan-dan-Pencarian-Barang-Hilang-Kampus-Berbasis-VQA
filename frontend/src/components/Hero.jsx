import { useRef, useState } from "react";
import { Search, ScanLine, Loader2, X, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

function compressImageFile(file, maxDim = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format gambar tidak didukung."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Hero({ query = "", onQueryChange = () => {} }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [vqaResult, setVqaResult] = useState(null);
  const [scanError, setScanError] = useState("");

  const handleScanClick = () => {
    if (scanning) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setScanning(true);
    setScanError("");
    setVqaResult(null);

    try {
      const compressedBase64 = await compressImageFile(file);

      const res = await fetch(`${API_BASE}/vqa/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: compressedBase64 }),
      });

      const rawText = await res.text();
      let json = {};
      try {
        json = JSON.parse(rawText);
      } catch {
        throw new Error(rawText.slice(0, 120) || `HTTP ${res.status}`);
      }

      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || json.detail || "Gagal menganalisis foto.");
      }

      const data = json.data || {};
      setVqaResult(data);

      const keyword =
        (Array.isArray(data.teks) && data.teks[0]) ||
        (data.kategori && data.kategori !== "Lainnya" ? data.kategori : "") ||
        (data.warna && data.warna !== "Tidak terdeteksi" ? data.warna : "");

      if (keyword) {
        onQueryChange(keyword);
      }
    } catch (err) {
      setScanError(err.message || "Terjadi kesalahan saat pencarian visual.");
    } finally {
      setScanning(false);
    }
  };

  const clearVisualSearch = () => {
    setVqaResult(null);
    setScanError("");
    onQueryChange("");
  };

  const keywordChips = vqaResult
    ? [
        vqaResult.kategori,
        vqaResult.warna,
        vqaResult.bahan,
        ...(Array.isArray(vqaResult.teks) ? vqaResult.teks : []),
      ].filter(
        (val, idx, arr) =>
          val &&
          val !== "Lainnya" &&
          val !== "Tidak terdeteksi" &&
          arr.indexOf(val) === idx
      )
    : [];

  return (
    <section className="hero">
      <h1>Halo, {user?.short || "Pengguna"}</h1>
      <p className="muted hero-desc">
        Pusat pencatatan barang temuan dan kehilangan di seluruh lingkungan
        Universitas Muhammadiyah Yogyakarta.
      </p>

      <div className="search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Cari barang hilang, jenis barang, atau lokasi temuan..."
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          type="button"
          className="search-scan"
          onClick={handleScanClick}
          disabled={scanning}
          title="Pencarian Visual Cepat (Unggah Foto Barang)"
          aria-label="Pencarian Visual Cepat"
        >
          {scanning ? <Loader2 size={18} className="spin" /> : <ScanLine size={18} />}
        </button>
      </div>

      {scanning && (
        <p className="muted" style={{ marginTop: "0.65rem", fontSize: "0.88rem" }}>
          Menganalisis ciri visual foto menggunakan AI VQA...
        </p>
      )}

      {scanError && (
        <p style={{ marginTop: "0.65rem", fontSize: "0.88rem", color: "#dc2626" }}>
          {scanError}
        </p>
      )}

      {vqaResult && (
        <div
          style={{
            marginTop: "0.85rem",
            display: "inline-flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.45rem",
            padding: "0.55rem 0.85rem",
            borderRadius: "999px",
            background: "rgba(22, 101, 52, 0.08)",
            fontSize: "0.85rem",
          }}
        >
          <Sparkles size={15} />
          <span>Hasil Scan VQA:</span>
          {keywordChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onQueryChange(chip)}
              style={{
                border: "1px solid rgba(22, 101, 52, 0.25)",
                background: query.toLowerCase() === chip.toLowerCase() ? "#166534" : "#fff",
                color: query.toLowerCase() === chip.toLowerCase() ? "#fff" : "#166534",
                borderRadius: "999px",
                padding: "0.18rem 0.65rem",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              {chip}
            </button>
          ))}
          <button
            type="button"
            onClick={clearVisualSearch}
            title="Reset filter visual"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              padding: "0.15rem",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </section>
  );
}