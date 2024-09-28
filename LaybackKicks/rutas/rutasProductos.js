const express = require('express');
const router = express.Router();
const controladorProducto = require('../controladores/controladorProducto');

router.get('/', controladorProducto.obtenerProductos);
router.post('/', controladorProducto.insertarProducto);
router.put('/:id', controladorProducto.actualizarProducto);
router.delete('/:id', controladorProducto.eliminarProducto);
router.get('/:id', controladorProducto.obtenerProductoPorId);

module.exports = router;