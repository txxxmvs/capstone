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

    // Consulta para contar productos por estado logístico
    const queryEstadoLogistico = `
        SELECT estado_logistico, COUNT(*) as cantidad
        FROM productos
        WHERE EXTRACT(MONTH FROM fecha_adquisicion) = $1 
        AND EXTRACT(YEAR FROM fecha_adquisicion) = $2
        GROUP BY estado_logistico
    `;

    // Consulta para obtener ventas mensuales en el año
    const queryVentasMensuales = `
        SELECT EXTRACT(MONTH FROM fecha_venta) AS mes, SUM(precio_final * cantidad_venta) AS total_ventas
        FROM venta
        WHERE EXTRACT(YEAR FROM fecha_venta) = $1
        GROUP BY mes
        ORDER BY mes
    `;

    const queryVentasAnuales = `
        SELECT EXTRACT(YEAR FROM fecha_venta) AS año, SUM(precio_final * cantidad_venta) AS total_ventas
        FROM venta
        GROUP BY año
        ORDER BY año
    `;

    const queryVentasPorMarca = `
    SELECT p.marca, SUM(v.precio_final * v.cantidad_venta) AS total_ventas
    FROM venta v
    JOIN productos p ON v.productos_id_producto = p.id_producto
    WHERE EXTRACT(YEAR FROM v.fecha_venta) = $1
    GROUP BY p.marca
    ORDER BY total_ventas DESC
    `;

    // Consulta para obtener relación entre precio y cantidad vendida
    const queryDispersionPrecioCantidad = `
        SELECT precio_final AS precio, cantidad_venta AS cantidad
        FROM venta
        WHERE EXTRACT(YEAR FROM fecha_venta) = $1
    `;

    // Ejecutar la consulta para productos
    pool.query(queryProductos, [mes, año], (err, productos) => {
        if (err) {
            console.error('Error al obtener los productos del dashboard:', err);
            return res.status(500).json({ message: 'Error al obtener los productos del dashboard' });
        }

        let montoInvertido = 0;
        let posibleRetorno = 0;
        let totalProductos = 0;

        productos.rows.forEach(producto => {
            montoInvertido += producto.precio_compra * producto.cantidad_original;
            posibleRetorno += producto.precio_venta * producto.cantidad_original;
            totalProductos += producto.cantidad_original;
        });

        pool.query(queryVentas, [mes, año], (err, ventasResult) => {
            if (err) {
                console.error('Error al obtener el total de ventas:', err);
                return res.status(500).json({ message: 'Error al obtener el total de ventas' });
            }

            let totalVentas = 0;
            let totalCantidadVendida = 0;
            let sumaPreciosVenta = 0;

            ventasResult.rows.forEach(venta => {
                totalVentas += venta.precio_final * venta.cantidad_venta;
                totalCantidadVendida += venta.cantidad_venta;
                sumaPreciosVenta += venta.precio_final * venta.cantidad_venta;
            });

            const promedioPrecioVenta = totalCantidadVendida ? sumaPreciosVenta / totalCantidadVendida : 0;
            const gananciaEstimada = posibleRetorno - montoInvertido;

            pool.query(queryEstadoLogistico, [mes, año], (err, estadoLogisticoResult) => {
                if (err) {
                    console.error('Error al obtener el estado logístico:', err);
                    return res.status(500).json({ message: 'Error al obtener el estado logístico' });
                }

                const estadoLogistico = {};
                estadoLogisticoResult.rows.forEach(row => {
                    estadoLogistico[row.estado_logistico] = Number(row.cantidad);
                });

                pool.query(queryVentasMensuales, [año], (err, ventasMensualesResult) => {
                    if (err) {
                        console.error('Error al obtener las ventas mensuales:', err);
                        return res.status(500).json({ message: 'Error al obtener las ventas mensuales' });
                    }

                    const ventasMensuales = Array(12).fill(0);
                    ventasMensualesResult.rows.forEach(row => {
                        ventasMensuales[row.mes - 1] = parseInt(row.total_ventas);
                    });

                    pool.query(queryVentasAnuales, (err, ventasAnualesResult) => {
                        if (err) {
                            console.error('Error al obtener la distribución de ventas por año:', err);
                            return res.status(500).json({ message: 'Error al obtener la distribución de ventas por año' });
                        }

                        const ventasAnuales = {};
                        ventasAnualesResult.rows.forEach(row => {
                            ventasAnuales[row.año] = Number(row.total_ventas);
                        });

                        pool.query(queryDispersionPrecioCantidad, [año], (err, dispersionResult) => {
                            if (err) {
                                console.error('Error al obtener la relación entre precio y cantidad:', err);
                                return res.status(500).json({ message: 'Error al obtener la relación entre precio y cantidad' });
                            }

                            const dispersionPrecioCantidad = dispersionResult.rows.map(row => ({
                                x: row.precio,
                                y: row.cantidad
                            }));

                            // Nueva consulta para ventas por marca
                            pool.query(queryVentasPorMarca, [año], (err, ventasPorMarcaResult) => {
                                if (err) {
                                    console.error('Error al obtener las ventas por marca:', err);
                                    return res.status(500).json({ message: 'Error al obtener las ventas por marca' });
                                }

                                const ventasPorMarca = {};
                                ventasPorMarcaResult.rows.forEach(row => {
                                    ventasPorMarca[row.marca] = Number(row.total_ventas);
                                });

                                // Respuesta final con todos los datos
                                res.json({
                                    montoInvertido,
                                    posibleRetorno,
                                    totalVentas,
                                    totalProductos,
                                    gananciaEstimada,
                                    promedioPrecioVenta,
                                    estadoLogistico,
                                    ventasMensuales,
                                    ventasAnuales,
                                    dispersionPrecioCantidad,
                                    ventasPorMarca // Nueva métrica para el gráfico de ventas por marca
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports = {
    obtenerDatosDashboard
};
