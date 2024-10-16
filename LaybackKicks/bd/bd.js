const { Pool } = require('pg'); // Importar el módulo para PostgreSQL

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',           // Tu usuario de PostgreSQL
  host: 'localhost',          // El host de tu base de datos
  database: 'laybackkicks',   // El nombre de la base de datos
  password: 'tomas',          // La contraseña que configuraste
  port: 5432,                 // El puerto de PostgreSQL
});

// Probar la conexión a la base de datos
pool.connect((err) => {
  if (err) {
    console.error('Error al conectar a PostgreSQL:', err);
  } else {
    console.log('Conectado a PostgreSQL');
  }
});

module.exports = pool;