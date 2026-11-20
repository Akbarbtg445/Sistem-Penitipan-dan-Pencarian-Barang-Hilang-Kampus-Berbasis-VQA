import { createContext, useContext, useState, useEffect } from "react";

const ReportsContext = createContext();

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/laporan");
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        setReports(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat laporan dari backend:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const addReport = async (newReport) => {
    const res = await fetch("http://localhost:3000/api/laporan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReport),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Gagal menyimpan laporan ke database");
    }

    await fetchReports();
    return json.data;
  };

  return (
    <ReportsContext.Provider value={{ reports, addReport, fetchReports }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  return useContext(ReportsContext);
}