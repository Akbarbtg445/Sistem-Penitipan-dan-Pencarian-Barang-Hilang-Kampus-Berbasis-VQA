let itemsData = [
  {
    id_temuan: "1",
    kategori_barang: "Tas & Dompet",
    warna_barang: "Hitam",
    lokasi_ditemukan: "Perpustakaan Pusat Lt. 2",
    ciri_khusus: "Tas ransel hitam berisi buku catatan, ditemukan di meja baca dekat jendela.",
    status_barang: "Tersedia di Pos",
    foto_barang: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  },
  {
    id_temuan: "2",
    kategori_barang: "Aksesoris",
    warna_barang: "Hitam Matte",
    lokasi_ditemukan: "Gedung FTI / Teknik Ruang C3",
    ciri_khusus: "Botol minum tahan panas tertinggal di kursi baris tengah setelah jam kuliah.",
    status_barang: "Tersedia di Pos",
    foto_barang: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"
  }
];

let claimsData = [
  {
    id: 101,
    nama_barang: "Tas & Dompet (Hitam)",
    pengklaim: "Ahmad Fauzan (20240140088)",
    pertanyaan: "Apakah ada gantungan kunci di resleting depan?",
    jawaban_ai: "Yes, red keychain attached",
    klaim_user: "Ada gantungan kunci warna merah",
    confidence: 92.4,
    status: "Menunggu Verifikasi"
  }
];

let latestVqaResult = null;

function getSupabaseHeaders() {
  const isJwtKey = CONFIG.SUPABASE_ANON_KEY && CONFIG.SUPABASE_ANON_KEY.startsWith("eyJ");
  return {
    apikey: CONFIG.SUPABASE_ANON_KEY,
    ...(isJwtKey ? { Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}` } : {})
  };
}

// Kompres otomatis gambar di browser sebelum upload agar ringan (< 200 KB) & cepat
function compressImage(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchBarangTemuan();
  renderClaimsTable();
});

// Navigasi Tab
window.switchTab = function (tabName) {
  ["katalog", "lapor", "petugas"].forEach((t) => {
    const viewEl = document.getElementById(`view-${t}`);
    const btnEl = document.getElementById(`tab-${t}`);
    if (viewEl) viewEl.classList.add("hidden");
    if (btnEl) {
      btnEl.classList.remove("bg-white", "text-emerald-900", "font-semibold");
      btnEl.classList.add("text-emerald-100");
    }
  });

  const activeView = document.getElementById(`view-${tabName}`);
  const activeBtn = document.getElementById(`tab-${tabName}`);
  if (activeView) activeView.classList.remove("hidden");
  if (activeBtn) {
    activeBtn.classList.add("bg-white", "text-emerald-900", "font-semibold");
    activeBtn.classList.remove("text-emerald-100");
  }
};

// Ambil Data Barang dari Supabase
async function fetchBarangTemuan() {
  try {
    if (CONFIG.SUPABASE_ANON_KEY && !CONFIG.SUPABASE_ANON_KEY.includes("TEMPEL")) {
      const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/barang_temuan?select=*&order=created_at.desc`, {
        headers: getSupabaseHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          itemsData = data;
        }
      }
    }
  } catch (err) {
    console.warn("Menggunakan data katalog lokal sementara:", err.message);
  }
  renderItems(itemsData);
}

// Render Kartu Barang Temuan sesuai kolom database
function renderItems(list) {
  const grid = document.getElementById("itemsGrid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">Tidak ada barang yang sesuai dengan pencarian.</div>`;
    return;
  }

  grid.innerHTML = list.map((item) => {
    const itemId = item.id_temuan || item.id;
    const itemImg = item.foto_barang || "";
    const judulBarang = `${item.kategori_barang || "Barang Temuan"}${item.warna_barang ? ` (${item.warna_barang})` : ""}`;
    return `
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
        <div class="relative h-48 bg-slate-200">
          <img src="${itemImg}" alt="${judulBarang}" class="w-full h-full object-cover" />
          <span class="absolute top-3 left-3 bg-slate-900/75 text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
            ${item.kategori_barang || "Umum"}
          </span>
          <span class="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
            ${item.status_barang || "Tersedia"}
          </span>
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 class="font-bold text-slate-800 text-base">${judulBarang}</h3>
            <p class="text-xs text-emerald-700 font-medium mt-1">
              <i class="fa-solid fa-location-dot mr-1"></i> ${item.lokasi_ditemukan || "-"}
            </p>
            <p class="text-xs text-slate-500 mt-2 line-clamp-2">${item.ciri_khusus || ""}</p>
          </div>
          <button onclick="openClaimModal('${itemId}')"
            class="w-full bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white border border-emerald-200 font-semibold py-2 rounded-lg text-xs sm:text-sm transition">
            <i class="fa-solid fa-robot mr-1"></i> Klaim & Verifikasi VQA
          </button>
        </div>
      </div>
    `;
  }).join("");
}

window.filterItems = function () {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  const filtered = itemsData.filter((item) => {
    const matchText =
      (item.kategori_barang || "").toLowerCase().includes(keyword) ||
      (item.warna_barang || "").toLowerCase().includes(keyword) ||
      (item.lokasi_ditemukan || "").toLowerCase().includes(keyword) ||
      (item.ciri_khusus || "").toLowerCase().includes(keyword);
    const matchCat = category === "all" || item.kategori_barang === category;
    return matchText && matchCat;
  });
  renderItems(filtered);
};

window.openClaimModal = function (itemId) {
  const item = itemsData.find((i) => String(i.id_temuan || i.id) === String(itemId));
  if (!item) return;

  latestVqaResult = null;
  const judulBarang = `${item.kategori_barang || "Barang Temuan"}${item.warna_barang ? ` (${item.warna_barang})` : ""}`;
  document.getElementById("modalItemId").value = item.id_temuan || item.id;
  document.getElementById("modalItemImg").src = item.foto_barang || "";
  document.getElementById("modalItemCategory").textContent = item.kategori_barang || "Barang Temuan";
  document.getElementById("modalItemTitle").textContent = judulBarang;
  document.getElementById("modalItemLocation").innerHTML = `<i class="fa-solid fa-location-dot mr-1"></i> ${item.lokasi_ditemukan || "-"}`;
  document.getElementById("vqaResultPanel").classList.add("hidden");
  document.getElementById("vqaClaimForm").reset();
  document.getElementById("vqaModal").classList.remove("hidden");
};

window.closeModal = function () {
  document.getElementById("vqaModal").classList.add("hidden");
};

window.runVqaCheck = async function () {
  const question = document.getElementById("vqaQuestion").value.trim();
  const imgUrl = document.getElementById("modalItemImg").src;

  if (!question) {
    alert("Masukkan pertanyaan verifikasi ciri barang terlebih dahulu!");
    return;
  }

  const btn = document.getElementById("btnTestVqa");
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Menganalisis...`;
  btn.disabled = true;

  try {
    const imgResponse = await fetch(imgUrl);
    const imgBlob = await imgResponse.blob();

    const formData = new FormData();
    formData.append("image", imgBlob, "item.jpg");
    formData.append("question", question);

    const res = await fetch(CONFIG.VQA_API_URL, {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Server VQA tidak merespons");
    const data = await res.json();
    latestVqaResult = data;

    document.getElementById("vqaAiAnswer").textContent = data.answer;
    document.getElementById("vqaConfidenceBadge").textContent = `Keyakinan ${data.confidence}%`;
    document.getElementById("vqaResultPanel").classList.remove("hidden");
  } catch (err) {
    latestVqaResult = {
      answer: "Simulasi AI: Ciri visual terdeteksi pada objek (Server FastAPI offline)",
      confidence: 88.5
    };
    document.getElementById("vqaAiAnswer").textContent = latestVqaResult.answer;
    document.getElementById("vqaConfidenceBadge").textContent = `Keyakinan ${latestVqaResult.confidence}%`;
    document.getElementById("vqaResultPanel").classList.remove("hidden");
  } finally {
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles mr-1"></i> 1. Cek dengan AI`;
    btn.disabled = false;
  }
};

// Submit Pengajuan Klaim
document.getElementById("vqaClaimForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!latestVqaResult) {
    alert("Klik tombol '1. Cek dengan AI' terlebih dahulu sebelum mengajukan klaim.");
    return;
  }

  const itemId = document.getElementById("modalItemId").value;
  const item = itemsData.find((i) => String(i.id_temuan || i.id) === String(itemId));
  const judulBarang = item ? `${item.kategori_barang} (${item.warna_barang || "-"})` : `Barang #${itemId}`;

  const payload = {
    barang_id: itemId,
    nama_pengklaim: document.getElementById("claimantName").value,
    nim_kontak: document.getElementById("claimantNim").value,
    pertanyaan_vqa: document.getElementById("vqaQuestion").value,
    jawaban_pengklaim: document.getElementById("userExpectedAnswer").value,
    jawaban_ai: latestVqaResult.answer,
    skor_vqa: latestVqaResult.confidence
  };

  try {
    await fetch(`${CONFIG.BACKEND_API_URL}/klaim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn("Backend offline, menyimpan klaim ke state tampilan sementara.");
  }

  claimsData.unshift({
    id: Date.now(),
    nama_barang: judulBarang,
    pengklaim: `${payload.nama_pengklaim} (${payload.nim_kontak})`,
    pertanyaan: payload.pertanyaan_vqa,
    jawaban_ai: payload.jawaban_ai,
    klaim_user: payload.jawaban_pengklaim,
    confidence: payload.skor_vqa,
    status: "Menunggu Verifikasi"
  });

  renderClaimsTable();
  closeModal();
  alert("Pengajuan klaim beserta log verifikasi VQA berhasil dikirim ke petugas kampus!");
  switchTab("petugas");
});

// Submit Form Laporan Barang Baru ke Supabase (dengan kompresi foto cepat)
document.getElementById("reportForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = document.getElementById("btnSubmitLaporan");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Mengompres & Mengunggah...`;
  btn.disabled = true;

  try {
    if (!CONFIG.SUPABASE_ANON_KEY || CONFIG.SUPABASE_ANON_KEY.includes("TEMPEL")) {
      throw new Error("SUPABASE_ANON_KEY di config.js belum diisi!");
    }

    const baseHeaders = getSupabaseHeaders();
    const bucketName = CONFIG.STORAGE_BUCKET || "foto_barang";
    const fileInput = document.getElementById("fotoBarang");
    const file = fileInput.files[0];
    let publicImageUrl = "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=600&q=80";

    // 1. Kompres & Upload foto ke Supabase Storage
    if (file) {
      const optimizedFile = await compressImage(file, 800, 0.75);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
      const uploadUrl = `${CONFIG.SUPABASE_URL}/storage/v1/object/${bucketName}/${fileName}`;

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          ...baseHeaders,
          "Content-Type": "image/jpeg"
        },
        body: optimizedFile
      });

      if (!uploadRes.ok) {
        const errStorage = await uploadRes.json();
        throw new Error(`Gagal upload foto: ${errStorage.message || uploadRes.statusText}`);
      }

      publicImageUrl = `${CONFIG.SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
    }

    // 2. Simpan data ke tabel Supabase
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Menyimpan Data...`;
    const jenis = document.getElementById("jenisLaporan").value;
    const targetTable = jenis === "temuan" ? "barang_temuan" : "laporan_kehilangan";
    const nowIso = new Date().toISOString();

    const dbPayload = jenis === "temuan"
      ? {
          kategori_barang: document.getElementById("kategoriBarang").value,
          warna_barang: document.getElementById("namaBarang").value,
          lokasi_ditemukan: document.getElementById("lokasiBarang").value,
          ciri_khusus: document.getElementById("deskripsiBarang").value,
          waktu_ditemukan: nowIso,
          foto_barang: publicImageUrl,
          status_barang: "Tersedia di Pos",
          updated_at: nowIso
        }
      : {
          kategori_barang: document.getElementById("kategoriBarang").value,
          warna_barang: document.getElementById("namaBarang").value,
          lokasi_hilang: document.getElementById("lokasiBarang").value,
          ciri_khusus: document.getElementById("deskripsiBarang").value,
          foto_barang: publicImageUrl,
          status_barang: "Dicari",
          updated_at: nowIso
        };

    const dbRes = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${targetTable}`, {
      method: "POST",
      headers: {
        ...baseHeaders,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(dbPayload)
    });

    if (!dbRes.ok) {
      const errDb = await dbRes.json();
      throw new Error(`Gagal simpan ke tabel ${targetTable}: ${errDb.message || errDb.details}`);
    }

    await fetchBarangTemuan();
    e.target.reset();
    alert(`Berhasil! Data dan foto sudah tersimpan ke tabel "${targetTable}" di Supabase.`);
    switchTab("katalog");
  } catch (err) {
    console.error(err);
    alert("Error Supabase: " + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

function renderClaimsTable() {
  const tbody = document.getElementById("claimsTableBody");
  if (!tbody) return;

  tbody.innerHTML = claimsData.map((c) => `
    <tr class="hover:bg-slate-50">
      <td class="px-4 py-3 font-semibold text-slate-800">${c.nama_barang}</td>
      <td class="px-4 py-3 text-xs text-slate-600">${c.pengklaim}</td>
      <td class="px-4 py-3 text-xs space-y-1">
        <p><span class="font-semibold text-slate-700">Tanya:</span> ${c.pertanyaan}</p>
        <p><span class="font-semibold text-emerald-700">AI:</span> ${c.jawaban_ai}</p>
        <p><span class="font-semibold text-blue-700">Klaim:</span> ${c.klaim_user}</p>
      </td>
      <td class="px-4 py-3">
        <span class="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full">${c.confidence}%</span>
      </td>
      <td class="px-4 py-3">
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${
          c.status === "Disetujui" ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-800"
        }">${c.status}</span>
      </td>
      <td class="px-4 py-3 text-right">
        ${
          c.status !== "Disetujui"
            ? `<button onclick="approveClaim(${c.id})" class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                Setujui & Serahkan
              </button>`
            : `<span class="text-xs text-slate-400"><i class="fa-solid fa-check-double"></i> Selesai</span>`
        }
      </td>
    </tr>
  `).join("");
}

window.approveClaim = function (claimId) {
  const target = claimsData.find((c) => c.id === claimId);
  if (target) {
    target.status = "Disetujui";
    renderClaimsTable();
    alert(`Klaim disetujui! Data serah terima untuk "${target.nama_barang}" siap dicatat ke riwayat_serah_terima.`);
  }
};