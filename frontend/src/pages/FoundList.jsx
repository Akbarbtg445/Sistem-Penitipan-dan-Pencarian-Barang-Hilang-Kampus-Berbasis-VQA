import { useState } from "react";
import { Search } from "lucide-react";
import ItemCard from "../components/ItemCard";
import { Steps } from "../components/FormBits";
import { items } from "../data/items";
import { useReports } from "../context/ReportsContext";

export default function FoundList() {
  const { reports } = useReports();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");

  const foundReports = reports.filter((r) => r.type === "found");
  const allItems = [...foundReports, ...items];
  const cats = ["Semua", ...new Set(allItems.map((i) => i.category))];

  const filtered = allItems.filter(
    (i) =>
      (cat === "Semua" || i.category === cat) &&
      `${i.title} ${i.description} ${i.foundAt}`
        .toLowerCase()
        .includes(q.toLowerCase())
  );

  return (
    <main className="page">
      <div className="page-head">
        <span className="eyebrow">KOLEKSI TERVERIFIKASI KAMPUS TERPADU</span>
        <h1>Daftar Barang Temuan Kampus</h1>
        <p className="muted">
          Katalog barang temuan yang telah diverifikasi dan diamankan oleh
          petugas keamanan. Temukan barang Anda dan ajukan klaim secara online.
        </p>
      </div>

      <div className="search search-wide">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Cari nama barang, jenis, atau lokasi penemuan..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="chips chips-left">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`chip ${cat === c ? "chip-active" : ""}`}
          >
            {c === "Semua" ? "Semua Kategori" : c}
          </button>
        ))}
      </div>

      <div className="list-layout">
        <div>
          <p className="muted small" style={{ marginBottom: 12 }}>
            Menampilkan {filtered.length} barang
          </p>
          {filtered.length === 0 ? (
            <div className="empty">Tidak ada barang yang cocok dengan pencarianmu.</div>
          ) : (
            <div className="grid grid-2">
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        <aside>
          <Steps
            title="Alur Pengambilan Amanah"
            steps={[
              { title: "Ajukan Klaim Daring", text: "Klik tombol klaim pada barang, lalu isi ciri khas atau bukti kepemilikan." },
              { title: "Verifikasi Petugas", text: "Petugas pos satpam mencocokkan KTM, data login SSO, dan bukti kepemilikan." },
              { title: "Serah Terima & Berita Acara", text: "Ambil barang di pos yang ditentukan dengan membawa KTM asli." },
            ]}
          />
        </aside>
      </div>
    </main>
  );
}