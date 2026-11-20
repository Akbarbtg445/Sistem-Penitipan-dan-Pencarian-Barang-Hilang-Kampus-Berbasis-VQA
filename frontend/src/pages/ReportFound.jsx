import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, Phone, MessageCircle, Info } from "lucide-react";
import { Field, FormCard, PhotoPicker, ReporterCard, Steps, categories } from "../components/FormBits";
import PreviewModal from "../components/PreviewModal";

const kondisi = ["Sangat Baik & Utuh", "Baik, ada goresan", "Rusak ringan", "Rusak berat"];

const areas = [
  "Gedung AR Fachruddin A",
  "Gedung AR Fachruddin B",
  "Gedung Siti Walidah (F6)",
  "Perpustakaan Pusat",
  "Masjid KH Ahmad Dahlan",
  "Kantin Bintang Utara",
  "Lapangan Bintang",
  "Parkiran Timur Perpustakaan & Pasca",
  "Parkir Barat Pascasarjana",
  "Lainnya",
];

const pos = [
  "Pos Satpam AR Fachruddin A (Lantai Dasar)",
  "Pos Satpam Siti Walidah (F6)",
  "Pos Satpam Perpustakaan & Pasca",
  "Pos Satpam Lapangan Bintang",
];

export default function ReportFound() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(false);
  const [f, setF] = useState({
    nama: "", kategori: categories[0], kondisi: kondisi[0], deskripsi: "",
    area: "", detail: "", tanggal: "", jam: "",
    penyerahan: "satpam", pos: pos[0],
  });

  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const lokasi =
    f.area === "Lainnya" || !f.area
      ? f.detail
      : f.detail
      ? `${f.area} - ${f.detail}`
      : f.area;

  const submit = (e) => {
    e.preventDefault();
    setPreview(true);
  };

  const rows = [
    { label: "Nama Barang", value: f.nama },
    { label: "Kategori", value: f.kategori },
    { label: "Kondisi", value: f.kondisi },
    { label: "Ciri Khusus", value: f.deskripsi },
    { label: "Lokasi Ditemukan", value: lokasi },
    { label: "Tanggal & Jam", value: `${f.tanggal} ${f.jam}` },
    {
      label: "Status Penguasaan",
      value:
        f.penyerahan === "satpam"
          ? `Sudah diserahkan ke ${f.pos}`
          : "Masih saya bawa sendiri (akan diserahkan ke pos satpam terdekat)",
    },
  ];

  const report = {
    type: "found",
    title: f.nama,
    place: lokasi,
    status: "Menunggu Verifikasi",
    tone: "yellow",
  };

  return (
    <main className="page">
      <div className="page-head">
        <span className="eyebrow">LAPOR TEMUAN BARANG</span>
        <h1>Formulir Lapor Temuan Barang</h1>
        <p className="muted">
          Bantu kembalikan amanah rekan kampus. Laporan barang yang Anda temukan
          akan diverifikasi dan diamankan oleh petugas Satpam.
        </p>
      </div>

      <form className="form-layout" onSubmit={submit}>
        <div className="form-main">
          <FormCard num="1" title="Dokumentasi Foto Temuan" subtitle="Sertakan foto barang yang ditemukan dari beberapa sudut.">
            <PhotoPicker files={files} setFiles={setFiles} max={3} label="Unggah Foto Fisik" />
          </FormCard>

          <FormCard num="2" title="Informasi & Ciri Fisik" subtitle="Detail pada barang membantu pencocokan dengan pemilik.">
            <Field label="Nama Barang Temuan" required>
              <input className="finput-solo" name="nama" value={f.nama} onChange={set} placeholder="Contoh: Tumbler Stainless Hijau Forest Oxford 750ml" required />
            </Field>
            <div className="frow">
              <Field label="Kategori Barang" required>
                <select className="finput-solo" name="kategori" value={f.kategori} onChange={set}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Kondisi Fisik Saat Ditemukan" required>
                <select className="finput-solo" name="kondisi" value={f.kondisi} onChange={set}>
                  {kondisi.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Ciri Khusus & Spesifikasi Detail" required hint="Minimal 20 karakter. Jangan sebutkan semua ciri; sisakan satu untuk verifikasi pemilik.">
              <textarea className="finput-solo" name="deskripsi" rows={4} minLength={20} value={f.deskripsi} onChange={set} placeholder="Warna, merek, stiker, goresan, isi, dll." required />
            </Field>
          </FormCard>

          <FormCard num="3" title="Lokasi & Status Penyerahan" subtitle="Informasi lokasi membantu pengembalian lebih cepat.">
            <div className="frow">
              <Field label="Area Ditemukan di Kampus" required>
                <select className="finput-solo" name="area" value={f.area} onChange={set} required>
                  <option value="" disabled>Pilih area...</option>
                  {areas.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field
                label={f.area === "Lainnya" ? "Tulis Lokasi" : "Detail Lokasi (opsional)"}
                required={f.area === "Lainnya"}
              >
                <input
                  className="finput-solo"
                  name="detail"
                  value={f.detail}
                  onChange={set}
                  placeholder={f.area === "Lainnya" ? "Tulis lokasi penemuan" : "Contoh: Lantai 2, dekat lift"}
                  required={f.area === "Lainnya"}
                />
              </Field>
            </div>

            <div className="frow">
              <Field label="Tanggal Ditemukan" required>
                <input className="finput-solo" type="date" name="tanggal" value={f.tanggal} onChange={set} required />
              </Field>
              <Field label="Perkiraan Jam" required>
                <input className="finput-solo" type="time" name="jam" value={f.jam} onChange={set} required />
              </Field>
            </div>

            <div className="flabel">Status Penguasaan Fisik Barang Saat Ini <span className="req">*</span></div>
            <div className="radio-row">
              <label className={`radio-card ${f.penyerahan === "satpam" ? "on" : ""}`}>
                <input type="radio" name="penyerahan" value="satpam" checked={f.penyerahan === "satpam"} onChange={set} />
                <div>
                  <strong>Sudah Diserahkan ke Pos Satpam</strong>
                  <span>Barang fisik sudah di salah satu pos untuk disimpan.</span>
                </div>
              </label>
              <label className={`radio-card ${f.penyerahan === "sendiri" ? "on" : ""}`}>
                <input type="radio" name="penyerahan" value="sendiri" checked={f.penyerahan === "sendiri"} onChange={set} />
                <div>
                  <strong>Masih Saya Bawa Sendiri</strong>
                  <span>Akan segera saya serahkan ke Pos Satpam terdekat.</span>
                </div>
              </label>
            </div>

            {f.penyerahan === "satpam" ? (
              <Field label="Pilih Titik Pos Satpam Penerima" required>
                <select className="finput-solo" name="pos" value={f.pos} onChange={set}>
                  {pos.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
            ) : (
              <div className="info-note">
                <Info size={15} />
                <span>
                  Mohon serahkan barang ke Pos Satpam terdekat paling lambat 1x24
                  jam agar bisa diverifikasi dan diamankan.
                </span>
              </div>
            )}
          </FormCard>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate("/lapor")}>Batal</button>
            <button type="submit" className="btn-save">Tinjau &amp; Kirim Laporan</button>
          </div>
        </div>

        <aside className="form-side">
          <ReporterCard />
          <Steps
            title="Panduan Amanah Temuan"
            steps={[
              { title: "Foto & Isi Formulir", text: "Dokumentasikan barang dari beberapa sudut dan isi rincian." },
              { title: "Serahkan Fisik ke Satpam", text: "Bawa barang ke pos satpam terdekat paling lambat 1x24 jam." },
              { title: "Pemantauan Tiap Amanah", text: "Pantau status laporan di halaman Riwayat Laporan." },
            ]}
          />
          <section className="fcard side-card">
            <div className="side-card-title"><HeartHandshake size={15} /> Bantu Kembalikan Amanah Rekan Kampus</div>
            <p className="muted small">Butuh bantuan saat melapor? Hubungi petugas keamanan kampus.</p>
            <div className="help-line"><Phone size={14} /> (0274) 387656 ext. 110</div>
            <div className="help-line"><MessageCircle size={14} /> WhatsApp Siaga Satpam 24 Jam</div>
          </section>
        </aside>
      </form>

      {preview && (
        <PreviewModal
          title="Pratinjau Laporan Temuan Barang"
          rows={rows}
          files={files}
          report={report}
          onClose={() => setPreview(false)}
        />
      )}
    </main>
  );
}