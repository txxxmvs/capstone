const express = require('express');
const router = express.Router();
const controladorLogistica = require('../controladores/controladorLogistica');

// Ruta para obtener los productos con su estado logístico
router.get('/', controladorLogistica.filtrarLogistica);
router.put('/:idProducto', controladorLogistica.actualizarEstadoLogistico);

module.exports = router;
