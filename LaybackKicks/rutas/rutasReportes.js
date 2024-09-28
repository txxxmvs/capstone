const express = require('express');
const router = express.Router();
const { generarReporte, generarPDF } = require('../controladores/controladorReporte');

// Ruta para generar reportes con filtros
router.get('/:tipo', generarReporte);

// Ruta para generar PDF a partir de HTML
router.post('/generar-pdf', generarPDF);

module.exports = router;
