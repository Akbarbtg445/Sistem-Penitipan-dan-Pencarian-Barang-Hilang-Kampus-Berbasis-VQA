const express = require('express');
const router = express.Router();
const vqaController = require('../controllers/vqaController');

router.post('/analyze', vqaController.analyzeVqa);
router.post('/ask', vqaController.askVqa);

module.exports = router;