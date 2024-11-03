const express = require('express');
const { enviarAlertaSms } = require('../controladores/controladorWsp');
const router = express.Router();

router.get('/enviar-alerta-sms', enviarAlertaSms);

module.exports = router;