import { Megaphone } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="cta">
      <div className="cta-left">
        <div className="cta-icon">
          <Megaphone size={22} />
        </div>
        <div>
          <h3>Menemukan barang milik teman di kampus?</h3>
          <p>
            Segera titipkan ke Pos Satpam gedung terdekat atau catat laporan
            melalui sistem ini agar mempermudah pemilik asli melacak barangnya.
          </p>
        </div>
      </div>
      <div className="cta-actions">
        <button className="btn-yellow">Laporkan Penemuan</button>
        <button className="btn-ghost">Kontak Pos Satpam</button>
      </div>
    </section>
  );
}