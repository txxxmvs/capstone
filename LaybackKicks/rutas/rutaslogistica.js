const express = require('express');
const router = express.Router();
const controladorLogistica = require('../controladores/controladorLogistica');

// Ruta para obtener los productos con su estado logístico
router.put('/logistica/:idProducto', controladorLogistica.actualizarEstadoLogistico);
router.get('/logistica', controladorLogistica.filtrarLogistica);

module.exports = router;
