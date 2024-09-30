const express = require('express');
const router = express.Router();
const controladorAutenticacion = require('../controladores/controladorAutenticacion');


router.post('/login', controladorAutenticacion.iniciarSesion);
router.get('/logout', controladorAutenticacion.cerrarSesion);

// Middleware para proteger rutas de admin
const protegerRutaAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Solo admins pueden acceder.' });
    }
};

// Proteger las rutas del dashboard y otros HTML solo para admins
router.get('/dashboard', protegerRutaAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/dashboard.html'));
});

router.get('/g_proveedores', protegerRutaAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/g_proveedores.html'));
});

router.get('/g_usuarios', protegerRutaAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/g_usuarios.html'));
});

router.get('/reportes', protegerRutaAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/reportes.html'));
});

router.get('/stock', protegerRutaAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/stock.html'));
});

module.exports = router;