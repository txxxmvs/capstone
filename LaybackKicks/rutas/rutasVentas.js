const express = require('express');
const router = express.Router();
const controladorVentas = require('../controladores/controladorVentas');

// Ruta para registrar una venta
router.post('/registrar/:id', controladorVentas.registrarVenta);

module.exports = router;