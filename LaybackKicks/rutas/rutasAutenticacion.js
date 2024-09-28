const express = require('express');
const router = express.Router();
const controladorAutenticacion = require('../controladores/controladorAutenticacion');

// Ruta para iniciar sesión
router.post('/login', controladorAutenticacion.iniciarSesion);

module.exports = router;