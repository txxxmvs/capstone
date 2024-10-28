const express = require('express');
const { enviarAlertaWsp } = require('../controladores/controladorWsp');
const router = express.Router();

router.get('/enviar-alerta-wsp', enviarAlertaWsp);

module.exports = router;