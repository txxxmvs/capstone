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

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});