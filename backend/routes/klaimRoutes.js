const express = require('express');
const router = express.Router();
const klaimController = require('../controllers/klaimController');

router.post('/ajukan', klaimController.ajukanKlaim);
router.put('/verifikasi/:id_klaim', klaimController.verifikasiKlaim);

module.exports = router;