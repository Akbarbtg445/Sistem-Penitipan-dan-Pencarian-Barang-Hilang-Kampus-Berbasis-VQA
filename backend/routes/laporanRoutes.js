const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');

router.post('/', laporanController.buatLaporan);
router.get('/', laporanController.ambilLaporan);

module.exports = router;