import { useMemo } from "react";
import { Camera, X, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const categories = [
  "Botol & Tumbler",
  "Elektronik & Gadget",
  "Dompet & Kartu KTM",
  "Kunci & Kendaraan",
  "Pakaian & Tas",
  "Lainnya",
];

export function Field({ label, required, hint, children }) {
  return (
    <div className="ffield">
      <label className="flabel">
        {label} {required && <span className="req">*</span>}
      </label>
      {children}
      {hint && <small className="fhint">{hint}</small>}
    </div>
  );
}

export function FormCard({ num, title, subtitle, children }) {
  return (
    <section className="fcard">
      <div className="fhead">
        <span className="fnum">{num}</span>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function PhotoPicker({ files, setFiles, max = 3, label = "Unggah Foto" }) {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  const onPick = (e) => {
    const picked = Array.from(e.target.files);
    setFiles([...files, ...picked].slice(0, max));
    e.target.value = "";
  };

  const remove = (i) => setFiles(files.filter((_, x) => x !== i));

  return (
    <div className="photo-grid">
      {files.length < max && (
        <label className="photo-add">
          <Camera size={22} />
          <strong>{label}</strong>
          <span>JPG/PNG, maks {max} foto</span>
          <input type="file" accept="image/*" multiple hidden onChange={onPick} />
        </label>
      )}
      {urls.map((u, i) => (
        <div key={u} className="photo-thumb">
          <img src={u} alt={`Foto ${i + 1}`} />
          <button type="button" onClick={() => remove(i)} aria-label="Hapus foto">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ReporterCard() {
  const { user } = useAuth();
  const hasNim = user?.nim && user.nim !== "-";

  return (
    <section className="fcard side-card">
      <div className="side-card-title">
        <ShieldCheck size={15} /> Identitas Pelapor
      </div>
      <div className="reporter">
        <div className="reporter-avatar">{user?.short?.[0] || "U"}</div>
        <div>
          <strong>{user?.name || "Pengguna"}</strong>
          {hasNim && <span>NIM: {user.nim}</span>}
          <span>{user?.fakultas || "-"}</span>
        </div>
      </div>
      <div className="reporter-line">
        <span>Email Kampus</span>
        <strong>{user?.email || "-"}</strong>
      </div>
    </section>
  );
}

export function Steps({ title, steps, horizontal = false }) {
  return (
    <section className={`fcard side-card ${horizontal ? "steps-h" : ""}`}>
      <div className="side-card-title">{title}</div>
      <div className="steps">
        {steps.map((s, i) => (
          <div key={s.title} className="step">
            <span className="step-num">{i + 1}</span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}