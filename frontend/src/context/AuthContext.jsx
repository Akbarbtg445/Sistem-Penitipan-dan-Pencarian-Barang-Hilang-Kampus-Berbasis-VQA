import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const KEY = "bh_user";

// Perkiraan dari pola email kampus (mis. "ft24" = Fakultas Teknik angkatan 2024).
const FAKULTAS = {
  ft: "Fakultas Teknik",
  fh: "Fakultas Hukum",
  feb: "Fakultas Ekonomi dan Bisnis",
  fai: "Fakultas Agama Islam",
  fkik: "Fakultas Kedokteran dan Ilmu Kesehatan",
  fisipol: "Fakultas Ilmu Sosial dan Ilmu Politik",
  fp: "Fakultas Pertanian",
};

// DEMO: NIM tidak bisa ditebak dari email.
// TODO: ganti dengan data dari backend/SSO.
const NIM_DEMO = {
  "safira.dwi.ft24@mail.umy.ac.id": "20240140173",
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

function buildUser(email) {
  const local = email.split("@")[0];
  const parts = local.split(/[._-]+/).filter(Boolean);
  const nameParts = [];
  let fakultas = "";
  let angkatan = "";

  for (const p of parts) {
    const m = p.match(/^([a-z]+)(\d{2})$/i);
    if (m) {
      fakultas = FAKULTAS[m[1].toLowerCase()] || "";
      angkatan = `20${m[2]}`;
    } else if (/^[a-z]+$/i.test(p)) {
      nameParts.push(cap(p));
    }
  }

  const name = nameParts.join(" ") || cap(local);
  return {
    email,
    name,
    short: nameParts[0] || name,
    nim: NIM_DEMO[email] || "-", // "-" = belum ada data, barisnya disembunyikan
    fakultas: fakultas || "Fakultas belum tersedia",
    angkatan,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      // Bangun ulang dari email supaya perubahan data langsung terpakai
      return saved?.email ? buildUser(saved.email) : null;
    } catch {
      return null;
    }
  });

  // TODO: ganti dengan request ke backend (POST /api/login)
  const login = (email) => {
    const u = buildUser(email.trim().toLowerCase());
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);