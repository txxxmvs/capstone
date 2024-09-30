const pool = require('../bd/bd');
const pdf = require('html-pdf');

const obtenerProductosVendidos = (req, res) => {
    const query = `
        SELECT v.id_venta, v.productos_id_producto, v.fecha_venta, v.cantidad_venta, v.precio_final, p.marca, p.modelo, p.talla
        FROM venta v
        JOIN productos p ON v.productos_id_producto = p.id_producto
        WHERE v.cantidad_venta > 0
        ORDER BY v.fecha_venta DESC
    `;
    
    pool.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener los productos vendidos' });
        }
        res.json(result.rows);
    });
};

const generarFactura = (req, res) => {
    const { ventas } = req.body;

    if (!ventas || ventas.length === 0) {
        return res.status(400).json({ message: 'No se seleccionaron ventas' });
    }

    const consulta = `SELECT v.id_venta, v.productos_id_producto, v.fecha_venta, v.cantidad_venta, v.precio_final, p.marca, p.modelo, p.talla 
                      FROM venta v JOIN productos p ON v.productos_id_producto = p.id_producto WHERE v.id_venta = ANY($1::int[])`;

    pool.query(consulta, [ventas], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ message: 'Error al generar la factura' });
        }

        const productos = result.rows;

        // Definir el HTML de la factura
        let htmlContent = `
            <h1>Factura Electrónica</h1>
            <div style="border: 1px solid #000; padding: 10px;">
                <h3>Sección Emisor</h3>
                <p>Empresa XYZ</p>
                <p>RUT: 12345678-9</p>
                <p>Dirección: Calle Falsa 123, Santiago</p>
            </div>
            <div style="border: 1px solid #000; padding: 10px; margin-top: 10px;">
                <h3>Sección Receptor</h3>
                <p>Cliente: Juan Pérez</p>
                <p>RUT: 98765432-1</p>
                <p>Dirección: Calle Real 456, Santiago</p>
            </div>
            <h3>Detalles de la Venta</h3>
            <table style="width: 100%; border-collapse: collapse;" border="1">
                <thead>
                    <tr>
                        <th>ID Venta</th>
                        <th>Producto</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Talla</th>
                        <th>Cantidad</th>
                        <th>Precio Final</th>
                        <th>Fecha Venta</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let total = 0;

        productos.forEach(producto => {
            total += producto.precio_final;
            htmlContent += `
                <tr>
                    <td>${producto.id_venta}</td>
                    <td>${producto.productos_id_producto}</td>
                    <td>${producto.marca}</td>
                    <td>${producto.modelo}</td>
                    <td>${producto.talla}</td>
                    <td>${producto.cantidad_venta}</td>
                    <td>$${producto.precio_final.toLocaleString()}</td>
                    <td>${new Date(producto.fecha_venta).toLocaleDateString()}</td>
                </tr>
            `;
        });

        htmlContent += `
                </tbody>
            </table>
            <h3 style="text-align: right;">Total: $${total.toLocaleString()}</h3>
        `;

        // Generar el PDF
        pdf.create(htmlContent).toFile('./facturas/factura.pdf', (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.sendFile(result.filename);
        });
    });
};

module.exports = {
    obtenerProductosVendidos,
    generarFactura
};