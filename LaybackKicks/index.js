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

app.post('/api/guardar_producto', (req, res) => {
  const { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq } = req.body;

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

app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq } = req.body;

  const query = `
    UPDATE productos SET marca = $1, modelo = $2, talla = $3, condicion = $4, cantidad = $5, 
    precio_compra = $6, precio_venta = $7, fecha_adquisicion = $8 WHERE id_producto = $9
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

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
