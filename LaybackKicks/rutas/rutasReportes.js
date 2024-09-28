const express = require('express');
const router = express.Router();
const controladorReportes = require('../controladores/controladorReportes');

router.get('/:tipo', controladorReportes.generarReporte);

module.exports = router;