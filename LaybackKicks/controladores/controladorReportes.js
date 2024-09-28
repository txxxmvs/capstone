const pool = require('../bd/bd');

// Generar reportes con filtros
const generarReporte = (req, res) => {
    const { tipo } = req.params;
    const { periodo } = req.query;

    let query = '';
    let filtroFecha = '';

    // Construcción de la consulta SQL
    switch (tipo) {
        case 'todos':
            query = `SELECT id_producto, marca, modelo, talla, condicion, precio_compra, precio_venta, fecha_adquisicion, cantidad, vendido FROM productos`;
            break;
        case 'vendidos':
            query = `SELECT v.id_venta, v.usuario_id_usuario, v.productos_id_producto, v.fecha_venta, v.cantidad_venta, v.precio_final, p.precio_compra, p.fecha_adquisicion
                     FROM venta v JOIN productos p ON v.productos_id_producto = p.id_producto`;
            break;
        case 'no-vendidos':
            query = `SELECT id_producto, marca, modelo, talla, condicion, precio_compra, precio_venta, fecha_adquisicion, cantidad, vendido FROM productos WHERE vendido = false`;
            break;
    }

    // Filtro por periodo
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

    if (filtroFecha) {
        if (query.includes('WHERE')) {
            query += ` AND ${filtroFecha}`;
        } else {
            query += ` WHERE ${filtroFecha}`;
        }
    }

    pool.query(query, (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta SQL:', err);
            return res.status(500).json({ message: 'Error al generar el reporte' });
        }
        res.json(result.rows);
    });
};

module.exports = {
    generarReporte
};