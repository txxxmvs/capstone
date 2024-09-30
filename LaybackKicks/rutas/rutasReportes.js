const express = require('express');
const router = express.Router();
const { generarReporte, generarPDF, generarFactura, obtenerProductosVendidos } = require('../controladores/controladorReporte');

router.get('/:tipo', generarReporte);
router.post('/generar-pdf', generarPDF);

module.exports = router;
