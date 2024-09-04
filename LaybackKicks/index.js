const express = require('express');
const cors = require('cors');
const connection = require('./bd/conexion');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

app.post('/api/guardar_producto', (req, res) => {
  const { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq } = req.body;

  const sql = `
    INSERT INTO Productos (marca, modelo, talla, condicion, precio_compra, precio_venta, fecha_adquisicion, cantidad)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(sql, [marca, modelo, talla, condicion, precio_compra, precio_venta, fecha_adq, cantidad], (err, result) => {
    if (err) {
      console.error('Error al insertar producto:', err);
      res.status(500).json({ message: 'Error al guardar el producto' });
    } else {
      res.status(200).json({ message: 'Producto guardado exitosamente' });
    }
  });
});

app.get('/api/productos', (req, res) => {
  const sql = 'SELECT * FROM Productos';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      res.status(500).json({ message: 'Error al obtener productos' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM Productos WHERE id_producto = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener producto:', err);
      res.status(500).json({ message: 'Error al obtener el producto' });
    } else if (result.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
    } else {
      res.json(result[0]);
    }
  });
});

app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq } = req.body;

  const sql = `
    UPDATE Productos SET marca = ?, modelo = ?, talla = ?, condicion = ?, cantidad = ?, precio_compra = ?, precio_venta = ?, fecha_adquisicion = ?
    WHERE id_producto = ?
  `;

  connection.query(sql, [marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar producto:', err);
      res.status(500).json({ message: 'Error al actualizar el producto' });
    } else {
      res.json({ message: 'Producto actualizado exitosamente' });
    }
  });
});

app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Productos WHERE id_producto = ?';

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar producto:', err);
      res.status(500).json({ message: 'Error al eliminar el producto' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
    } else {
      res.json({ message: 'Producto eliminado exitosamente' });
    }
  });
});

app.get('/api/dashboard', (req, res) => {
  const sql = 'SELECT precio_compra, precio_venta, cantidad FROM Productos';

  connection.query(sql, (err, productos) => {
    if (err) {
      console.error('Error al obtener los datos del dashboard:', err);
      res.status(500).json({ message: 'Error al obtener los datos del dashboard' });
    } else {
      let montoInvertido = 0;
      let posibleRetorno = 0;

      productos.forEach(producto => {
        montoInvertido += producto.precio_compra * producto.cantidad;
        posibleRetorno += producto.precio_venta * producto.cantidad;
      });

      res.json({
        montoInvertido,
        posibleRetorno
      });
    }
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Intentando iniciar sesión con:', { username, password });

  const query = 'SELECT * FROM usuario WHERE email = ? AND contraseña = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error al verificar credenciales:', err);
      res.status(500).json({ message: 'Error al verificar las credenciales' });
    } else if (results.length > 0) {
      console.log('Inicio de sesión exitoso:', results);
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