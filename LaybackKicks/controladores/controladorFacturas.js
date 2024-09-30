const pool = require('../bd/bd');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');

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

        // Cargar el contenido HTML desde el archivo formato.html
        const htmlFilePath = path.join(__dirname, '../pages/formato/formato.html');
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        // Generar la tabla de productos vendidos
        let productosHTML = '';
        let total = 0;

        productos.forEach(producto => {
            const subtotal = producto.precio_final * producto.cantidad_venta;
            total += subtotal;

            productosHTML += `
                <tr>
                    <td>${producto.cantidad_venta}</td>
                    <td>${producto.marca} ${producto.modelo}, Talla: ${producto.talla}</td>
                    <td>$${producto.precio_final.toLocaleString()}</td>
                    <td>$${subtotal.toLocaleString()}</td>
                </tr>
            `;
        });

        // Reemplazar los placeholders en el HTML con los datos generados
        const fechaFactura = new Date().toLocaleDateString();
        htmlContent = htmlContent.replace('{TABLA_PRODUCTOS}', productosHTML);
        htmlContent = htmlContent.replace('{TOTAL}', `$${total.toLocaleString()}`);
        htmlContent = htmlContent.replace('{FECHA_FACTURA}', fechaFactura);

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
    generarFactura,
    obtenerProductosVendidos
};