const supabase = require('../config/supabase');

const PYTHON_VQA_URL =
  process.env.PYTHON_VQA_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/vqa/py` : 'http://127.0.0.1:8000');

exports.analyzeVqa = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
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

    // 2. Cari kecocokan dengan barang_temuan asli di Supabase
    const { data: semuaTemuan } = await supabase
      .from('barang_temuan')
      .select('*')
      .order('created_at', { ascending: false });

    const keywords = [
      hasil.kategori,
      hasil.warna,
      ...(Array.isArray(hasil.teks) ? hasil.teks : []),
    ]
      .filter(Boolean)
      .map((k) => k.toLowerCase());

    const matches = (semuaTemuan || [])
      .map((item) => {
        const hay = `${item.nama_barang || ''} ${item.kategori || ''} ${item.deskripsi_barang || ''} ${item.ciri_khusus || ''}`.toLowerCase();
        let hit = 0;
        keywords.forEach((kw) => {
          if (kw.length > 2 && hay.includes(kw)) hit += 1;
        });
        const score = Math.min(98, 55 + hit * 15);
        return {
          id: item.id_temuan,
          title: item.nama_barang || item.kategori_barang || 'Barang Temuan',
          place: item.pos_penyimpanan || item.lokasi_ditemukan || 'Pos Satpam Kampus',
          score,
          hit,
        };
      })
      .filter((m) => m.hit > 0 || (semuaTemuan || []).length <= 3)
      .slice(0, 4);

    // 3. Catat ke tabel vqa_log di Supabase
    await supabase.from('vqa_log').insert([{
      id_temuan: matches[0]?.id || null,
      vqa_kategori: (hasil.kategori || 'Lainnya').slice(0, 100),
      vqa_warna: (hasil.warna || '-').slice(0, 100),
      vqa_ciri: `Bahan: ${hasil.bahan || '-'} | Teks: ${(hasil.teks || []).join(', ')}`,
      is_dikoreksi: false,
    }]);

    res.status(200).json({
      status: 'success',
      result: hasil,
      matches,
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