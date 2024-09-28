const pool = require('../bd/bd');

// Obtener datos del dashboard filtrados por mes y año
const obtenerDatosDashboard = (req, res) => {
    const { mes, año } = req.query;

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

    pool.query(queryProductos, [mes, año], (err, productos) => {
        if (err) {
            console.error('Error al obtener los datos del dashboard:', err);
            return res.status(500).json({ message: 'Error al obtener los datos del dashboard' });
        }

        let montoInvertido = 0;
        let posibleRetorno = 0;

        productos.rows.forEach(producto => {
            montoInvertido += producto.precio_compra * producto.cantidad;
            posibleRetorno += producto.precio_venta * producto.cantidad;
        });

        pool.query(queryVentas, [mes, año], (err, ventasResult) => {
            if (err) {
                console.error('Error al obtener el total de ventas:', err);
                return res.status(500).json({ message: 'Error al obtener el total de ventas' });
            }

            const totalVentas = ventasResult.rows[0].totalventas || 0;
            res.json({ montoInvertido, posibleRetorno, totalVentas });
        });
    });
};

module.exports = {
    obtenerDatosDashboard
};