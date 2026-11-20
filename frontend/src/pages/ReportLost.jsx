import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Field, FormCard, PhotoPicker, ReporterCard, Steps, categories } from "../components/FormBits";
import PreviewModal from "../components/PreviewModal";

export default function ReportLost() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(false);
  const [f, setF] = useState({
    nama: "", kategori: categories[0], ciri: "",
    lokasi: "", tglHilang: "", rentang: "", catatan: "",
  });

  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setPreview(true);
  };

  const rows = [
    { label: "Nama / Merek Barang", value: f.nama },
    { label: "Kategori", value: f.kategori },
    { label: "Ciri Khusus (Privat)", value: f.ciri },
    { label: "Lokasi Terakhir Terlihat", value: f.lokasi },
    { label: "Tanggal Terakhir Terlihat", value: f.tglHilang },
    { label: "Rentang Waktu", value: f.rentang },
    { label: "Catatan Tambahan", value: f.catatan },
  ];

  const report = {
    type: "lost",
    title: f.nama,
    place: f.lokasi,
    status: "Pencarian",
    tone: "yellow",
  };

  return (
    <main className="page">
      <div className="page-head">
        <span className="eyebrow">LAPOR KEHILANGAN</span>
        <h1>Formulir Lapor Kehilangan Barang</h1>
        <p className="muted">
          Daftarkan barang yang hilang. Anda akan diberi tahu jika ada
          temuan yang cocok di 14 pos satpam kampus.
        </p>
      </div>

      <div className="ad-banner">
        <div>
          <strong>Sudah cek katalog barang temuan?</strong>
          <p>Barangmu mungkin sudah diamankan petugas. Cek dulu sebelum membuat laporan.</p>
        </div>
        <Link to="/daftar-temuan" className="btn-yellow">
          <Search size={14} style={{ verticalAlign: -2 }} /> Cek Katalog Temuan
        </Link>
      </div>

      <form className="form-layout" onSubmit={submit}>
        <div className="form-main">
          <FormCard num="1" title="Informasi Barang Hilang" subtitle="Tuliskan identitas utama barang.">
            <Field label="Nama / Merek / Model Barang" required>
              <input className="finput-solo" name="nama" value={f.nama} onChange={set} placeholder="Contoh: Laptop Asus Zenbook 14 OLED" required />
            </Field>
            <Field label="Kategori Barang" required>
              <select className="finput-solo" name="kategori" value={f.kategori} onChange={set}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </FormCard>

          <FormCard num="2" title="Ciri Khusus & Bukti Validasi" subtitle="Ciri ini bersifat privat dan hanya dipakai untuk verifikasi.">
            <Field label="Deskripsi Ciri Fisik Tersembunyi (Privat)" required hint="Ciri yang hanya diketahui pemilik, misalnya goresan, isi, atau stiker di bagian dalam.">
              <textarea className="finput-solo" name="ciri" rows={4} value={f.ciri} onChange={set} required />
            </Field>
            <Field label="Lampiran Foto Bukti Kepemilikan (opsional)" hint="Foto nota, box, atau foto lama bersama barang.">
              <PhotoPicker files={files} setFiles={setFiles} max={3} label="Tarik foto ke sini atau pilih berkas" />
            </Field>
          </FormCard>

          <FormCard num="3" title="Lokasi & Estimasi Waktu Terakhir Terlihat" subtitle="Data ini membantu penelusuran CCTV dan area pos.">
            <Field label="Lokasi Terakhir Terlihat di Kampus" required>
              <input className="finput-solo" name="lokasi" value={f.lokasi} onChange={set} placeholder="Contoh: Perpustakaan Pusat Lantai 2" required />
            </Field>
            <div className="frow">
              <Field label="Tanggal Terakhir Terlihat" required>
                <input className="finput-solo" type="date" name="tglHilang" value={f.tglHilang} onChange={set} required />
              </Field>
              <Field label="Perkiraan Rentang Waktu" required>
                <input className="finput-solo" name="rentang" value={f.rentang} onChange={set} placeholder="Contoh: 13.00 - 15.00 WIB" required />
              </Field>
            </div>
            <Field label="Catatan Kronologi Singkat">
              <textarea className="finput-solo" name="catatan" rows={3} value={f.catatan} onChange={set} />
            </Field>
          </FormCard>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate("/lapor")}>Batal</button>
            <button type="submit" className="btn-save">Tinjau &amp; Kirim Laporan</button>
          </div>

          <Steps
            horizontal
            title="Alur Pengembalian Amanah"
            steps={[
              { title: "Laporan Terdaftar di Radar BK3", text: "Data kehilangan dicatat dan dibandingkan dengan temuan di pos satpam." },
              { title: "Notifikasi Kecocokan Instan", text: "Jika ada temuan yang cocok, kamu dikabari lewat WhatsApp dan email." },
              { title: "Pengambilan & Bukti Serah", text: "Ambil barang di pos dengan KTM asli dan tanda tangan berita acara." },
            ]}
          />
        </div>

        <aside className="form-side">
          <ReporterCard />
        </aside>
      </form>

      {preview && (
        <PreviewModal
          title="Pratinjau Laporan Kehilangan Barang"
          rows={rows}
          files={files}
          report={report}
          onClose={() => setPreview(false)}
        />
      )}
    </main>
  );
}