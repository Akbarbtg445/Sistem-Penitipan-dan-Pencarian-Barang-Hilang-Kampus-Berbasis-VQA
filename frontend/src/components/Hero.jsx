import { Search, ScanLine } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Hero({ query = "", onQueryChange = () => {} }) {
  const { user } = useAuth();

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
        <button className="search-scan" aria-label="Scan">
          <ScanLine size={18} />
        </button>
      </div>
    </section>
  );
}