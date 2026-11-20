import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowDownUp } from "lucide-react";
import Hero from "../components/Hero";
import CategoryChips, { categoryChips } from "../components/CategoryChips";
import StatCards from "../components/StatCards";
import ItemCard from "../components/ItemCard";
import CtaBanner from "../components/CtaBanner";
import { items } from "../data/items";
import { useReports } from "../context/ReportsContext";

export default function Home() {
  const { reports } = useReports();
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);

  const active = categoryChips.find((c) => c.id === cat);
  const q = query.trim().toLowerCase();

  const foundReports = reports.filter((r) => r.type === "found");
  const allItems = [...foundReports, ...items];

  let filtered = allItems.filter((i) => {
    const okCat = !active.match || active.match.includes(i.category);
    const okQuery =
      !q ||
      `${i.title} ${i.description} ${i.foundAt} ${i.category}`
        .toLowerCase()
        .includes(q);
    return okCat && okQuery;
  });

  if (!newestFirst) filtered = [...filtered].reverse();

  return (
    <main className="container">
      <Hero query={query} onQueryChange={setQuery} />
      <CategoryChips
        active={cat}
        onChange={setCat}
        historyCount={reports.length}
      />
      <StatCards />

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              {cat === "all" ? "Barang Temuan Terbaru" : active.label}{" "}
              <span className="dot" />
            </h2>
            <p className="muted">
              {cat === "all"
                ? "Segera hubungi pos satpam gedung terkait apabila mengenali barang milik Anda."
                : `Menampilkan ${filtered.length} barang pada kategori ${active.label}.`}
            </p>
          </div>
          <div className="section-actions">
            <button
              className="btn-outline"
              onClick={() => setNewestFirst(!newestFirst)}
            >
              <ArrowDownUp size={14} /> Urutkan: {newestFirst ? "Terbaru" : "Terlama"}
            </button>
            <Link to="/daftar-temuan" className="link">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <h3>Tidak ada barang ditemukan</h3>
            <p>Coba ganti kategori atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <CtaBanner />
    </main>
  );
}