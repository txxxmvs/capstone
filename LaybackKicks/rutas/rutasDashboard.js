const express = require('express');
const router = express.Router();
const controladorDashboard = require('../controladores/controladorDashboard');

router.get('/', controladorDashboard.obtenerDatosDashboard);

module.exports = router;