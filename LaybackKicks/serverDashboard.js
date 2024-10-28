const express = require('express');
const cors = require('cors');
const appDashboard = express();

// Middlewares
appDashboard.use(cors());
appDashboard.use(express.json());

// Rutas para el dashboard y logística
const rutasDashboard = require('./rutas/rutasDashboard');
const rutasLogistica = require('./rutas/rutasLogistica');

// Configuración de rutas
appDashboard.use('/api/dashboard', rutasDashboard);
appDashboard.use('/api/logistica', rutasLogistica);

// Iniciar el servidor en el puerto 3000 para el dashboard
const PORT_DASHBOARD = 3000;
appDashboard.listen(PORT_DASHBOARD, () => {
    console.log(`Servidor de dashboard escuchando en el puerto ${PORT_DASHBOARD}`);
});
