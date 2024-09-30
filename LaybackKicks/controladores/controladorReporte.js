const pool = require('../bd/bd'); 
const pdf = require('html-pdf'); 

// Función para generar reportes según el tipo y el periodo
const generarReporte = (req, res) => {
  const { tipo } = req.params;
  const { periodo } = req.query;

  let consulta = '';
  let filtroFecha = '';

  // Construcción de la consulta SQL según el tipo de reporte
  switch (tipo) {
    case 'todos':
      consulta = `SELECT id_producto, marca, modelo, talla, condicion, precio_compra, precio_venta, fecha_adquisicion, cantidad, vendido FROM productos`;
      break;
    case 'vendidos':
      consulta = `SELECT v.id_venta, v.usuario_id_usuario, v.productos_id_producto, v.fecha_venta, v.cantidad_venta, v.precio_final, p.precio_compra, p.fecha_adquisicion
                  FROM venta v JOIN productos p ON v.productos_id_producto = p.id_producto`;
      break;
    case 'no-vendidos':
      consulta = `SELECT id_producto, marca, modelo, talla, condicion, precio_compra, precio_venta, fecha_adquisicion, cantidad, vendido FROM productos WHERE vendido = false`;
      break;
  }

  // Filtros de periodo
  switch (periodo) {
    case 'mensual':
      filtroFecha = `fecha_adquisicion >= NOW() - INTERVAL '1 month'`;
      break;
    case '3meses':
      filtroFecha = `fecha_adquisicion >= NOW() - INTERVAL '3 months'`;
      break;
    case '6meses':
      filtroFecha = `fecha_adquisicion >= NOW() - INTERVAL '6 months'`;
      break;
    case 'anual':
      filtroFecha = `fecha_adquisicion >= NOW() - INTERVAL '1 year'`;
      break;
  }

  // Añadir el filtro de fecha a la consulta
  if (filtroFecha) {
    if (consulta.includes('WHERE')) {
      consulta += ` AND ${filtroFecha}`;
    } else {
      consulta += ` WHERE ${filtroFecha}`;
    }
  }

  // Ejecutar la consulta
  pool.query(consulta, (err, result) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ message: 'Error al generar el reporte' });
    } else {
      res.json(result.rows);
    }
  });
};

// Función para generar el PDF a partir de HTML
const generarPDF = (req, res) => {
  const { html, nombreArchivo } = req.body;

  pdf.create(html).toFile(`./reportes/${nombreArchivo}`, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.sendFile(result.filename); 
  });
};

module.exports = { 
  generarReporte, 
  generarPDF
};