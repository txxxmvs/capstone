const express = require('express');
const router = express.Router();
const controladorLogistica = require('../controladores/controladorLogistica');

// Ruta para obtener los productos con su estado logístico
router.put('/:idProducto', controladorLogistica.actualizarEstadoLogistico);
router.get('/', controladorLogistica.filtrarLogistica);

module.exports = router;
