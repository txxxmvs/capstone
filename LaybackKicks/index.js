const express = require('express');
const cors = require('cors');
const app = express();
const puerto = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/paginas', express.static(__dirname + '/paginas')); 

// Importar rutas
const rutasUsuarios = require('./rutas/rutasUsuarios');
const rutasProductos = require('./rutas/rutasProductos');
const rutasProveedores = require('./rutas/rutasProveedores');
const rutasDashboard = require('./rutas/rutasDashboard');
const rutasReportes = require('./rutas/rutasReportes');
const rutasAutenticacion = require('./rutas/rutasAutenticacion');
const rutasVentas = require('./rutas/rutasVentas');
const rutasFacturas = require('./rutas/rutasFacturas'); 

// Usar las rutas
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/productos', rutasProductos);
app.use('/api/proveedores', rutasProveedores);
app.use('/api/dashboard', rutasDashboard);
app.use('/api/reportes', rutasReportes);
app.use('/api/autenticacion', rutasAutenticacion); 
app.use('/api/ventas', rutasVentas);
app.use('/api/facturas', rutasFacturas);  

// Iniciar el servidor
app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});