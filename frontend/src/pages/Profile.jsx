import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home, Phone, Mail, Check, Pencil, Lock, ShieldCheck, ExternalLink,
  ArrowRight, Headset, FileText, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useReports } from "../context/ReportsContext";
import "../styles/profile.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const { reports } = useReports();
  const navigate = useNavigate();

  const initialData = {
    phone: "", // TODO: ambil dari backend
    email: user?.email || "",
    notifEmail: true,
    notifWa: true,
  };

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(initialData);
  const [form, setForm] = useState(initialData);

  const hasNim = user?.nim && user.nim !== "-";
  const hasPhone = saved.phone.trim() !== "";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const cancelEdit = () => {
    setForm(saved);
    setEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(form);
    setEditing(false);
    // TODO: kirim ke backend, mis. fetch("/api/profil", { method: "PUT", ... })
    // Status "Terverifikasi" harus dikonfirmasi backend (mis. OTP WhatsApp).
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Home size={13} />
          <Link to="/">Beranda</Link> / <span>Akun Pengguna</span> /{" "}
          <strong>Pengaturan Profil &amp; Kontak SSO</strong>
        </div>
      </div>

      <main className="profile-page">
        <section className="pcard">
          <div className="p-eyebrow">PROFIL MAHASISWA &amp; INFORMASI KONTAK</div>
          <div className="p-title-row">
            <h1>Data Akun Terintegrasi SSO</h1>
            <span className="p-badge p-badge-green">Terverifikasi SSO</span>
            <span className="p-badge p-badge-gray">Aktif</span>
          </div>

          <div className="p-user">
            <div className="p-avatar">{user?.short?.[0] || "U"}</div>
            <div>
              <div className="p-name">
                {user?.name || "Pengguna"} <span className="p-role">Mahasiswa</span>
              </div>
              {hasNim && <div className="p-nim">NIM: {user.nim}</div>}
              <div className="p-prodi">
                {user?.fakultas || "-"}
                {user?.angkatan ? ` · Angkatan ${user.angkatan}` : ""}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-field">
              <div className="p-label-row">
                <label htmlFor="phone">
                  Nomor WhatsApp Aktif <span className="req">*</span>
                </label>
                {hasPhone ? (
                  <span className="p-badge p-badge-yellow">Menunggu Verifikasi</span>
                ) : (
                  <span className="p-badge p-badge-gray">Belum Terverifikasi</span>
                )}
              </div>
              <div className={`p-input ${editing ? "" : "is-readonly"}`}>
                <Phone size={16} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  readOnly={!editing}
                  placeholder="Belum diisi, contoh: +62 812-xxxx-xxxx"
                  required
                />
              </div>
              <small>
                {hasPhone
                  ? "Digunakan petugas Satpam UMY & sistem untuk konfirmasi langsung penemuan barang."
                  : "Isi nomor WhatsApp agar petugas dapat menghubungimu saat barang ditemukan."}
              </small>
            </div>

            <div className="p-field">
              <div className="p-label-row">
                <label htmlFor="email">
                  Email SSO / Notifikasi Kampus <span className="req">*</span>
                </label>
                <span className="p-badge p-badge-green">Terhubung &amp; Terverifikasi</span>
              </div>
              <div className={`p-input ${editing ? "" : "is-readonly"}`}>
                <Mail size={16} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  readOnly={!editing}
                  required
                />
              </div>
            </div>

            <label className="p-check">
              <input type="checkbox" name="notifEmail" checked={form.notifEmail} onChange={handleChange} disabled={!editing} />
              Kirim salinan notifikasi temuan ke email SSO
            </label>

            <div className="p-check-box">
              <label className="p-check">
                <input type="checkbox" name="notifWa" checked={form.notifWa} onChange={handleChange} disabled={!editing} />
                <strong>Notifikasi WhatsApp Instan jika barang cocok ditemukan</strong>
              </label>
              <p>
                <Lock size={12} /> Data kontak terenkripsi dan hanya dapat
                diakses oleh petugas Pos Satpam saat proses verifikasi klaim.
              </p>
            </div>

            {editing ? (
              <div className="p-actions">
                <button type="submit" className="btn-save">
                  <Check size={16} /> Perbarui Kontak
                </button>
                <button type="button" className="btn-cancel" onClick={cancelEdit}>
                  Batal
                </button>
              </div>
            ) : (
              <div className="p-actions">
                <button type="button" className="btn-edit" onClick={() => setEditing(true)}>
                  <Pencil size={15} /> Perbarui Kontak
                </button>
              </div>
            )}
          </form>
        </section>

        <aside className="p-side">
          <section className="pcard">
            <div className="side-head">
              <div className="side-title">
                <ShieldCheck size={16} /> Keamanan Akun SSO UMY
              </div>
              <span className="p-badge p-badge-green">Aman</span>
            </div>
            <dl className="sec-list">
              <div><dt>ID Pengguna SSO:</dt><dd>{user?.email || "-"}</dd></div>
              <div><dt>2FA Microsoft Authenticator:</dt><dd className="ok">✓ Aktif</dd></div>
              <div><dt>Sesi Login Terakhir:</dt><dd>Hari ini (Eduroam UMY)</dd></div>
            </dl>
            <a href="#" className="side-link">
              Kelola Password di Portal SSO UMY <ExternalLink size={13} />
            </a>
          </section>

          <section className="pcard">
            <div className="side-head">
              <div className="side-title">Laporan Terdaftar Saya</div>
              <span className="p-badge p-badge-gray">{reports.length} Laporan</span>
            </div>

            {reports.length === 0 ? (
              <div className="empty-mini">
                <FileText size={22} />
                <p>Belum ada laporan terdaftar.</p>
                <Link to="/lapor" className="link">Buat laporan pertama</Link>
              </div>
            ) : (
              <div className="rep-list">
                {reports.slice(0, 3).map((r) => (
                  <div key={r.id} className="rep">
                    <div className="rep-icon"><FileText size={14} /></div>
                    <div className="rep-text">
                      <strong>{r.title}</strong>
                      <span>{r.place}</span>
                    </div>
                    <span className={`rep-status ${r.tone}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}

            <Link to="/riwayat" className="side-link">
              Buka Riwayat &amp; Klaim Temuan Lengkap <ArrowRight size={13} />
            </Link>
          </section>

          <section className="help">
            <div className="help-icon"><Headset size={16} /></div>
            <div>
              <strong>Kendala Nomor WhatsApp atau Identitas?</strong>
              <p>
                Kunjungi langsung <b>Pos Induk Keamanan Gedung AR Fachruddin A
                (Lantai Dasar)</b> atau hubungi Call Center Satpam UMY di (0274)
                387656 ext. 110.
              </p>
            </div>
          </section>

          <section className="pcard logout-card">
            <div>
              <strong>Keluar dari Akun</strong>
              <p>Akhiri sesi login di perangkat ini.</p>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </section>
        </aside>
      </main>
    </>
  );
}