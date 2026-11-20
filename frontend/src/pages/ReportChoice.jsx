import { Link } from "react-router-dom";
import { PackageCheck, PackageSearch, ArrowRight } from "lucide-react";

export default function ReportChoice() {
  return (
    <main className="page">
      <section className="choice-wrap">
        <h1>Apa yang ingin Anda laporkan?</h1>
        <p className="muted">Pilih salah satu, kami pandu langkah selanjutnya.</p>

        <div className="choice-grid">
          <Link to="/lapor/temuan" className="choice-card">
            <div className="choice-icon green"><PackageCheck size={30} /></div>
            <h3>Saya menemukan barang</h3>
            <p>Unggah foto, AI membantu mengisi rincian barangnya.</p>
            <span className="choice-link">Lanjut <ArrowRight size={16} /></span>
          </Link>

          <Link to="/lapor/kehilangan" className="choice-card choice-amber">
            <div className="choice-icon amber"><PackageSearch size={30} /></div>
            <h3>Saya kehilangan barang</h3>
            <p>Daftarkan sekarang, Anda diberi tahu jika ada yang cocok.</p>
            <span className="choice-link">Lanjut <ArrowRight size={16} /></span>
          </Link>
        </div>
      </section>
    </main>
  );
}