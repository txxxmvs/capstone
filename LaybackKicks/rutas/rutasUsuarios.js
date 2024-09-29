const express = require('express');
const router = express.Router();
const controladorUsuario = require('../controladores/controladorUsuario');

router.get('/', controladorUsuario.obtenerUsuarios);
router.post('/', controladorUsuario.insertarUsuario);
router.put('/:id', controladorUsuario.actualizarUsuario);
router.delete('/:id', controladorUsuario.eliminarUsuario);
router.put('/cambiar_contrasena/:id', controladorUsuario.cambiarContrasena);

module.exports = router;
