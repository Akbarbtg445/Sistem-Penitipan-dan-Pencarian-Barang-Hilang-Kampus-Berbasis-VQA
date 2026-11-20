import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Logo: taruh file di frontend/public/logo-umy.png
// Kalau file belum ada, otomatis tampil kotak "UMY".
function Logo() {
  const [ok, setOk] = useState(true);
  return ok ? (
    <img
      src="/logo-umy.png"
      alt="Logo UMY"
      className="login-logo-img"
      onError={() => setOk(false)}
    />
  ) : (
    <div className="logo logo-lg">UMY</div>
  );
}

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return setError("Masukkan email yang valid.");
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    setError("");
    login(email);
    navigate("/");
  };

  return (
    <div className="login">
      <aside className="login-photo">
        <div className="login-brand">
          <Logo />
          <h2>Pusat Amanah Barang Temuan &amp; Kehilangan</h2>
          <p>
            Sistem repositori resmi Universitas Muhammadiyah Yogyakarta untuk
            civitas akademika, transparan dan berkeadaban.
          </p>
          {/* Foto opsional: frontend/public/login.jpg (disembunyikan jika tidak ada) */}
          <img
            className="login-photo-img"
            src="/login.jpg"
            alt=""
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      </aside>

      <main className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <h1>Masuk ke Akun</h1>
          <p className="muted">Gunakan email kampus untuk melanjutkan.</p>

          <label className="flabel" htmlFor="email">Email</label>
          <div className="finput">
            <Mail size={16} />
            <input
              id="email"
              type="email"
              placeholder="nama@mail.umy.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label className="flabel" htmlFor="password">Password</label>
          <div className="finput">
            <Lock size={16} />
            <input
              id="password"
              type={show ? "text" : "password"}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye"
              onClick={() => setShow(!show)}
              aria-label="Lihat password"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-save login-btn">
            Masuk <ArrowRight size={16} />
          </button>
        </form>
      </main>
    </div>
  );
}