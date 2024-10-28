const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();
const puerto = 3000;

// Configurar la sesión
app.use(session({
    secret: 'clave-secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/pages', express.static(__dirname + '/pages')); 

// Importar rutas
const rutasUsuarios = require('./rutas/rutasUsuarios');
const rutasProductos = require('./rutas/rutasProductos');
const rutasProveedores = require('./rutas/rutasProveedores');
const rutasDashboard = require('./rutas/rutasDashboard');
const rutasReportes = require('./rutas/rutasReportes');
const rutasAutenticacion = require('./rutas/rutasAutenticacion');
const rutasVentas = require('./rutas/rutasVentas');
const rutasFacturas = require('./rutas/rutasFacturas'); 
const rutasLogistica = require('./rutas/rutasLogistica');

// Usar las rutas
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/productos', rutasProductos);
app.use('/api/proveedores', rutasProveedores);
app.use('/api/dashboard', rutasDashboard);
app.use('/api/reportes', rutasReportes);
app.use('/api/autenticacion', rutasAutenticacion); 
app.use('/api/ventas', rutasVentas);
app.use('/api/facturas', rutasFacturas);  
app.use('/api/logistica', rutasLogistica); 

// Iniciar el servidor
app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});