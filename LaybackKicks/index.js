const express = require('express');
const cors = require('cors');
const connection = require('./bd/conexion');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});