const pool = require('../bd/bd');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');

const generarFactura = (req, res) => {
    const { ventas } = req.body;

    if (!ventas || ventas.length === 0) {
        return res.status(400).json({ message: 'No se seleccionaron ventas' });
    }

    // Consulta para obtener el número de la última factura
    const consultaUltimaFactura = `SELECT numero_factura FROM factura ORDER BY numero_factura DESC LIMIT 1`;

    pool.query(consultaUltimaFactura, (err, result) => {
        if (err) {
            console.error('Error al obtener el número de la última factura:', err);
            return res.status(500).json({ message: 'Error al generar el número de factura' });
        }

        let numeroFactura = '000001'; // Número inicial si no existen facturas

        if (result.rows.length > 0) {
            const ultimaFactura = result.rows[0].numero_factura;
            numeroFactura = (parseInt(ultimaFactura, 10) + 1).toString().padStart(6, '0');
        }

        // Continuar con la generación de la factura una vez que se tiene el número
        generarFacturaConNumero(req, res, numeroFactura);
    });
};

const generarFacturaConNumero = (req, res, numeroFactura) => {
    const { ventas } = req.body;

    const consulta = `
        SELECT v.id_venta, v.productos_id_producto, v.fecha_venta, v.cantidad_venta, v.precio_final, 
               p.marca, p.modelo, p.talla 
        FROM venta v 
        JOIN productos p ON v.productos_id_producto = p.id_producto 
        WHERE v.id_venta = ANY($1::int[])
    `;

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
        htmlContent = htmlContent.replace('{NUMERO_FACTURA}', numeroFactura); // Insertar el número de factura

        // Insertar el número de factura en la tabla `factura`
        const insertarFactura = `
            INSERT INTO factura (numero_factura, fecha)
            VALUES ($1, NOW())
        `;

        pool.query(insertarFactura, [numeroFactura], (err) => {
            if (err) {
                console.error('Error al insertar el número de la factura:', err);
                return res.status(500).json({ message: 'Error al insertar el número de la factura' });
            }

            // Generar el PDF
            pdf.create(htmlContent).toFile(`./facturas/factura_${numeroFactura}.pdf`, (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.sendFile(result.filename);
            });
        });
    });
};

module.exports = {
    generarFactura
};
