const pool = require('../bd/bd');

// Obtener datos del dashboard filtrados por mes y año
const obtenerDatosDashboard = (req, res) => {
    // Convertir mes y año a números
    const mes = Number(req.query.mes);
    const año = Number(req.query.año);

    if (!mes || !año) {
        return res.status(400).json({ message: 'Mes o año inválido' });
    }

    // Consulta para obtener productos del mes y año
    const queryProductos = `
        SELECT precio_compra, precio_venta, cantidad_original 
        FROM productos
        WHERE EXTRACT(MONTH FROM fecha_adquisicion) = $1 
        AND EXTRACT(YEAR FROM fecha_adquisicion) = $2
    `;

    // Consulta para obtener ventas del mes y año
    const queryVentas = `
        SELECT precio_final, cantidad_venta 
        FROM venta 
        WHERE EXTRACT(MONTH FROM fecha_venta) = $1 
        AND EXTRACT(YEAR FROM fecha_venta) = $2
    `;

    // Ejecutar la consulta para productos
    pool.query(queryProductos, [mes, año], (err, productos) => {
        if (err) {
            console.error('Error al obtener los productos del dashboard:', err);
            return res.status(500).json({ message: 'Error al obtener los productos del dashboard' });
        }

        let montoInvertido = 0;
        let posibleRetorno = 0;
        let totalProductos = 0;  // Nueva métrica para contar productos

        // Calcular monto invertido y posible retorno sumando los valores
        productos.rows.forEach(producto => {
            montoInvertido += producto.precio_compra * producto.cantidad_original;
            posibleRetorno += producto.precio_venta * producto.cantidad_original;
            totalProductos += producto.cantidad_original;  // Contamos los productos
        });

        // Ejecutar la consulta para ventas
        pool.query(queryVentas, [mes, año], (err, ventasResult) => {
            if (err) {
                console.error('Error al obtener el total de ventas:', err);
                return res.status(500).json({ message: 'Error al obtener el total de ventas' });
            }

            let totalVentas = 0;
            let totalCantidadVendida = 0;
            let sumaPreciosVenta = 0;  // Para calcular el promedio

            // Calcular el total de ventas sumando los valores
            ventasResult.rows.forEach(venta => {
                totalVentas += venta.precio_final * venta.cantidad_venta;
                totalCantidadVendida += venta.cantidad_venta;
                sumaPreciosVenta += venta.precio_final * venta.cantidad_venta;
            });

            const promedioPrecioVenta = totalCantidadVendida ? sumaPreciosVenta / totalCantidadVendida : 0;
            const gananciaEstimada = posibleRetorno - montoInvertido;

            // Enviar la respuesta con los resultados
            res.json({
                montoInvertido,
                posibleRetorno,
                totalVentas,
                totalProductos,  // Nueva métrica
                gananciaEstimada,  // Nueva métrica
                promedioPrecioVenta  // Nueva métrica
            });
        });
    });
};

module.exports = {
    obtenerDatosDashboard
};
