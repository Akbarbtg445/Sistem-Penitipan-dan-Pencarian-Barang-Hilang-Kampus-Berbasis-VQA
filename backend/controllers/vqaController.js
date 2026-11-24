const supabase = require('../config/supabase');

const PYTHON_VQA_URL =
  process.env.PYTHON_VQA_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/vqa/py` : 'http://127.0.0.1:8000');

exports.analyzeVqa = async (req, res) => {
  try {
    const { imageBase64, extraKeywords = [] } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ status: 'error', message: 'Gambar wajib disertakan' });
    }

    // 1. Teruskan ke layanan Python VQA (main.py)
    const pyRes = await fetch(`${PYTHON_VQA_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!pyRes.ok) {
      const errText = await pyRes.text();
      throw new Error(`Layanan VQA Python error: ${errText}`);
    }

    const pyJson = await pyRes.json();
    const hasil = pyJson.data;

    // 2. Ambil barang_temuan & laporan_kehilangan dari Supabase secara paralel
    const [resTemuan, resHilang] = await Promise.all([
      supabase
        .from('barang_temuan')
        .select('*')
        .neq('status_barang', 'DIAMBIL')
        .order('created_at', { ascending: false }),
      supabase
        .from('laporan_kehilangan')
        .select('*')
        .eq('status_laporan', 'MENCARI')
        .order('created_at', { ascending: false }),
    ]);

    const semuaTemuan = resTemuan.data || [];
    const semuaHilang = resHilang.data || [];

    const rawKeywords = [
      hasil.kategori,
      hasil.warna,
      hasil.bahan,
      ...(Array.isArray(hasil.teks) ? hasil.teks : []),
      ...(Array.isArray(extraKeywords) ? extraKeywords : []),
    ]
      .filter((v) => v && v !== 'Lainnya' && v !== 'Tidak terdeteksi')
      .flatMap((v) => String(v).split(/[\s,/()-]+/))
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 2);

    const keywords = [...new Set(rawKeywords)];

    // Skor kecocokan dengan Barang Temuan
    const foundMatches = semuaTemuan
      .map((item) => {
        const hay = `${item.nama_barang || ''} ${item.kategori || ''} ${item.kategori_barang || ''} ${item.deskripsi_barang || ''} ${item.ciri_khusus || ''}`.toLowerCase();
        let hit = 0;
        keywords.forEach((kw) => {
          if (hay.includes(kw)) hit += 1;
        });
        const score = Math.min(98, 55 + hit * 14);
        return {
          id: item.id_temuan,
          type: 'found',
          title: item.nama_barang || item.kategori_barang || 'Barang Temuan',
          category: item.kategori || item.kategori_barang || '-',
          place: item.pos_penyimpanan || item.lokasi_ditemukan || 'Pos Satpam Kampus',
          description: item.deskripsi_barang || item.ciri_khusus || '-',
          date: item.tanggal_ditemukan || '-',
          image: item.foto_barang || '',
          score,
          hit,
        };
      })
      .filter((m) => m.hit > 0 || semuaTemuan.length <= 3)
      .sort((a, b) => b.hit - a.hit)
      .slice(0, 6);

    // Skor kecocokan dengan Laporan Kehilangan
    const lostMatches = semuaHilang
      .map((item) => {
        const hay = `${item.nama_barang || ''} ${item.kategori || ''} ${item.kategori_barang || ''} ${item.warna_barang || ''} ${item.deskripsi_ciri || ''} ${item.ciri_khusus || ''}`.toLowerCase();
        let hit = 0;
        keywords.forEach((kw) => {
          if (hay.includes(kw)) hit += 1;
        });
        const score = Math.min(98, 55 + hit * 14);
        return {
          id: item.id_laporan,
          type: 'lost',
          title: item.nama_barang || item.kategori_barang || 'Barang Hilang',
          category: item.kategori || item.kategori_barang || '-',
          color: item.warna_barang || '-',
          place: item.lokasi_hilang || '-',
          description: item.deskripsi_ciri || item.ciri_khusus || '-',
          date: item.tanggal_hilang || '-',
          image: item.foto_referensi || '',
          score,
          hit,
        };
      })
      .filter((m) => m.hit > 0 || semuaHilang.length <= 4)
      .sort((a, b) => b.hit - a.hit)
      .slice(0, 6);

    // 3. Catat ke tabel vqa_log di Supabase
    await supabase.from('vqa_log').insert([{
      id_temuan: foundMatches[0]?.id || null,
      vqa_kategori: (hasil.kategori || 'Lainnya').slice(0, 100),
      vqa_warna: (hasil.warna || '-').slice(0, 100),
      vqa_ciri: `Bahan: ${hasil.bahan || '-'} | Teks: ${(hasil.teks || []).join(', ')}`,
      is_dikoreksi: false,
    }]);

    res.status(200).json({
      status: 'success',
      result: hasil,
      matches: foundMatches,
      lostMatches,
    });
  } catch (error) {
    console.error('Error VQA Analyze:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.askVqa = async (req, res) => {
  try {
    const { imageBase64, question } = req.body;
    if (!imageBase64 || !question) {
      return res.status(400).json({ status: 'error', message: 'Gambar dan pertanyaan wajib diisi' });
    }

    const pyRes = await fetch(`${PYTHON_VQA_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, question }),
    });

    if (!pyRes.ok) {
      const errText = await pyRes.text();
      throw new Error(`Layanan VQA Python error: ${errText}`);
    }

    const pyJson = await pyRes.json();

    // Simpan log tanya jawab ke vqa_log
    await supabase.from('vqa_log').insert([{
      vqa_kategori: 'Tanya Jawab VQA',
      vqa_ciri: `Tanya: ${question} | Jawab: ${pyJson.answer}`,
      pertanyaan: question,
      jawaban_ai: pyJson.answer,
      is_dikoreksi: false,
    }]);

    res.status(200).json({
      status: 'success',
      answer: pyJson.answer,
    });
  } catch (error) {
    console.error('Error VQA Ask:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};