const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Importar el módulo para PostgreSQL

const app = express();
const port = 3000;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',           // Tu usuario de PostgreSQL
  host: 'localhost',          // El host de tu base de datos
  database: 'laybackkicks',   // El nombre de la base de datos
  password: 'asddsa',  // La contraseña que configuraste
  port: 5432,                 // El puerto de PostgreSQL
});

// Probar la conexión a la base de datos
pool.connect(err => {
  if (err) {
    console.error('Error al conectar a PostgreSQL:', err);
  } else {
    console.log('Conectado a PostgreSQL');
  }
});

app.use(cors());
app.use(express.json());
app.use('/pages', express.static(__dirname + '/pages'));


// Ruta para servir la página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Ruta para guardar un producto
app.post('/api/guardar_producto', (req, res) => {
  const { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq } = req.body;

   // Log de los valores recibidos
   console.log('Valores recibidos:', { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq });

  const query = `
    INSERT INTO productos (marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adquisicion)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const values = [marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al insertar producto:', err);
      res.status(500).json({ message: 'Error al guardar el producto' });
    } else {
      res.status(200).json({ message: 'Producto guardado exitosamente' });
    }
  });
});

// Ruta para obtener todos los productos
app.get('/api/productos', (req, res) => {
  const query = 'SELECT * FROM productos';

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      res.status(500).json({ message: 'Error al obtener productos' });
    } else {
      res.json(results.rows);
    }
  });
});

// Ruta para obtener un producto por id
app.get('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM productos WHERE id = $1';

  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener producto:', err);
      res.status(500).json({ message: 'Error al obtener el producto' });
    } else if (result.rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
    } else {
      res.json(result.rows[0]);
    }
  });
});

// Ruta para actualizar un producto por id
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq } = req.body;

  const query = `
    UPDATE productos SET marca = $1, modelo = $2, talla = $3, condicion = $4, cantidad = $5, 
    precio_compra = $6, precio_venta = $7, fecha_adquisicion = $8 WHERE id = $9
  `;
  const values = [marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq, id];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar producto:', err);
      res.status(500).json({ message: 'Error al actualizar el producto' });
    } else {
      res.status(200).json({ message: 'Producto actualizado exitosamente' });
    }
  });
});

// Ruta para eliminar un producto por id
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM productos WHERE id = $1';

  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar producto:', err);
      res.status(500).json({ message: 'Error al eliminar el producto' });
    } else if (result.rowCount === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
    } else {
      res.status(200).json({ message: 'Producto eliminado exitosamente' });
    }
  });
});

// Ruta para obtener el dashboard (información de resumen)
app.get('/api/dashboard', (req, res) => {
  const query = 'SELECT precio_compra, precio_venta, cantidad FROM productos';

  pool.query(query, (err, productos) => {
    if (err) {
      console.error('Error al obtener los datos del dashboard:', err);
      res.status(500).json({ message: 'Error al obtener los datos del dashboard' });
    } else {
      let montoInvertido = 0;
      let posibleRetorno = 0;

      productos.rows.forEach(producto => {
        montoInvertido += producto.precio_compra * producto.cantidad;
        posibleRetorno += producto.precio_venta * producto.cantidad;
      });

      res.json({ montoInvertido, posibleRetorno });
    }
  });
});

// Ruta para login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Intentando iniciar sesión con:', { username, password });

  const query = 'SELECT * FROM usuario WHERE email = $1 AND contrasena = $2';
  
  pool.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error al verificar credenciales:', err);
      res.status(500).json({ message: 'Error al verificar las credenciales' });
    } else if (results.rows.length > 0) {
      console.log('Inicio de sesión exitoso:', results.rows);
      res.json({ message: 'Inicio de sesión exitoso' });
    } else {
      console.warn('Credenciales inválidas');
      res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
