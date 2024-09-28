const express = require('express');
const router = express.Router();
const controladorProveedores= require('../controladores/controladorProveedores');

router.get('/', controladorProveedores.obtenerProveedores);
router.post('/', controladorProveedores.insertarProveedor);
router.put('/:id', controladorProveedores.actualizarProveedor);
router.delete('/:id', controladorProveedores.eliminarProveedor);

module.exports = router;