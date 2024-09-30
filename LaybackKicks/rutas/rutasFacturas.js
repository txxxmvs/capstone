const express = require('express');
const router = express.Router();
const controladorFacturas = require('../controladores/controladorFacturas');

router.get('/vendidos', controladorFacturas.obtenerProductosVendidos);
router.post('/generar', controladorFacturas.generarFactura);

module.exports = router;