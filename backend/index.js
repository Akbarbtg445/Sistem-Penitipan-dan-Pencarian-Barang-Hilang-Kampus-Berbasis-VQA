const express = require('express');
const cors = require('cors');
require('dotenv').config();

const klaimRoutes = require('./routes/klaimRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const vqaRoutes = require('./routes/vqaRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/klaim', klaimRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/vqa', vqaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});