const express = require('express');
const cors = require('cors');
const pool = require('./bd/bd');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/pages', express.static(__dirname + '/pages'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Guardar un nuevo producto
app.post('/api/guardar_producto', (req, res) => {
  const { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq } = req.body;

  console.log('Valores recibidos:', { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq });

  // Verifica si todos los valores requeridos están presentes
  if (!marca || !modelo || !talla || !condicion || !cantidad || !precio_compra || !precio_venta || !fecha_adq) {
    return res.status(400).json({ message: 'Por favor, completa todos los campos' });
  }

  const query = `
    INSERT INTO productos (marca, modelo, talla, condicion, cantidad, cantidad_original, precio_compra, precio_venta, fecha_adquisicion)
    VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8) RETURNING *
  `;
  const values = [marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al insertar producto:', err);
      res.status(500).json({ message: 'Error al guardar el producto' });
    } else {
      res.status(200).json({ message: 'Producto guardado exitosamente', producto: result.rows[0] });
    }
  });
});

// Obtener todos los productos
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

// Obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM productos WHERE id_producto = $1';

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

// Ruta para actualizar un producto (PUT)
app.put('/api/productos/:id', (req, res) => {
  const idProducto = parseInt(req.params.id, 10);  // Convertimos a entero
  const { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq } = req.body;

  if (isNaN(idProducto)) {
    return res.status(400).json({ message: 'ID de producto no válido' });
  }

  const query = `
    UPDATE productos 
    SET marca = $1, modelo = $2, talla = $3, condicion = $4, cantidad = $5, precio_compra = $6, precio_venta = $7, fecha_adquisicion = $8
    WHERE id_producto = $9 RETURNING *
  `;

  const values = [marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq, idProducto];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar el producto:', err);
      return res.status(500).json({ message: 'Error al actualizar el producto' });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(result.rows[0]);
  });
});

// Eliminar producto
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM productos WHERE id_producto = $1';

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

// Ruta del Dashboard para obtener los datos filtrados por mes y año
app.get('/api/dashboard', (req, res) => {
  const { mes, año } = req.query;  // Obtenemos mes y año de la URL

  const queryProductos = `
    SELECT precio_compra, precio_venta, cantidad 
    FROM productos
    WHERE EXTRACT(MONTH FROM fecha_adquisicion) = $1 
    AND EXTRACT(YEAR FROM fecha_adquisicion) = $2
  `;

  const queryVentas = `
    SELECT SUM(precio_final) AS totalVentas 
    FROM venta 
    WHERE EXTRACT(MONTH FROM fecha_venta) = $1 
    AND EXTRACT(YEAR FROM fecha_venta) = $2
  `;

  // Ejecutamos la consulta de productos
  pool.query(queryProductos, [mes, año], (err, productos) => {
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

      // Ejecutamos la consulta de ventas
      pool.query(queryVentas, [mes, año], (err, ventasResult) => {
        if (err) {
          console.error('Error al obtener el total de ventas:', err);
          res.status(500).json({ message: 'Error al obtener el total de ventas' });
        } else {
          const totalVentas = ventasResult.rows[0].totalventas || 0;  
          res.json({ montoInvertido, posibleRetorno, totalVentas });  
        }
      });
    }
  });
});

// Registrar venta
app.put('/api/vender_producto/:id', async (req, res) => {
  const idProducto = parseInt(req.params.id); 
  const { fecha_venta, precio_final, cantidad_venta } = req.body;

  if (isNaN(idProducto)) {
    return res.status(400).json({ message: 'ID de producto no válido' });
  }

  const client = await pool.connect();  

  try {
    await client.query('BEGIN');

    const usuarioResult = await client.query('SELECT id_usuario FROM usuario LIMIT 1');
    const idUsuario = usuarioResult.rows[0].id_usuario;

    const productoResult = await client.query('SELECT cantidad FROM productos WHERE id_producto = $1', [idProducto]);
    const cantidadDisponible = productoResult.rows[0].cantidad;

    if (cantidad_venta > cantidadDisponible) {
      return res.status(400).json({ message: 'No puedes vender más cantidad de la disponible' });
    }

    const queryProducto = 'UPDATE productos SET vendido = TRUE, cantidad = cantidad - $1 WHERE id_producto = $2';
    await client.query(queryProducto, [cantidad_venta, idProducto]);

    const queryVenta = 'INSERT INTO venta (fecha_venta, precio_final, cantidad_venta, productos_id_producto, usuario_id_usuario) VALUES ($1, $2, $3, $4, $5)';
    await client.query(queryVenta, [fecha_venta, precio_final, cantidad_venta, idProducto, idUsuario]);

    await client.query('COMMIT');
    
    res.status(200).json({ message: 'Venta registrada con éxito' });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al registrar la venta:', err);
    res.status(500).json({ message: 'Error al registrar la venta' });
    
  } finally {
    client.release();
  }
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

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});