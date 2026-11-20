import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const ReportsContext = createContext(null);
const keyOf = (email) => `bh_reports_${email}`;

function load(email) {
  try {
    return JSON.parse(localStorage.getItem(keyOf(email))) || [];
  } catch {
    return [];
  }
}

export function ReportsProvider({ children }) {
  const { user } = useAuth();
  const email = user?.email;
  const [reports, setReports] = useState(() => (email ? load(email) : []));

  // Ganti daftar laporan setiap kali akun berganti
  useEffect(() => {
    setReports(email ? load(email) : []);
  }, [email]);

  // TODO: ganti dengan POST /api/laporan, lalu ambil daftar dari GET /api/laporan
  const addReport = (r) => {
    if (!email) return;
    const now = new Date();
    const item = {
      id: `HTMU-${now.getFullYear()}-${String(Date.now()).slice(-4)}`,
      date: now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      ...r,
    };
    const next = [item, ...reports];
    localStorage.setItem(keyOf(email), JSON.stringify(next));
    setReports(next);
  };

  return (
    <ReportsContext.Provider value={{ reports, addReport }}>
      {children}
    </ReportsContext.Provider>
  );
}

export const useReports = () => useContext(ReportsContext);