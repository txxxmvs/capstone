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
    case 'cancelado':  
      consulta = `SELECT id_producto, marca, modelo, talla, condicion, precio_compra, precio_venta, fecha_adquisicion, cantidad, estado_logistico 
                  FROM productos WHERE estado_logistico = 'Cancelada'`;
      break;
  }

  // Filtros de periodo
  switch (periodo) {
    case 'mensual':
      // Tomar desde el primer día del mes actual hasta el último día del mes
      filtroFecha = `fecha_adquisicion >= date_trunc('month', CURRENT_DATE) AND fecha_adquisicion < date_trunc('month', CURRENT_DATE) + interval '1 month'`;
      break;
    case '3meses':
      // Tomar desde el primer día de hace 2 meses hasta el último día del mes actual
      filtroFecha = `fecha_adquisicion >= date_trunc('month', CURRENT_DATE) - interval '2 months' AND fecha_adquisicion < date_trunc('month', CURRENT_DATE) + interval '1 month'`;
      break;
    case '6meses':
      // Tomar desde el primer día de hace 5 meses hasta el último día del mes actual
      filtroFecha = `fecha_adquisicion >= date_trunc('month', CURRENT_DATE) - interval '5 months' AND fecha_adquisicion < date_trunc('month', CURRENT_DATE) + interval '1 month'`;
      break;
    case 'anual':
      // Tomar desde el día exacto de hace 1 año hasta el día actual
      filtroFecha = `fecha_adquisicion >= CURRENT_DATE - interval '1 year' AND fecha_adquisicion <= CURRENT_DATE`;
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

  consulta += ` ORDER BY fecha_adquisicion DESC`;

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