const twilio = require('twilio');
const pool = require('../bd/bd');
const moment = require('moment');

// Configuración de Twilio
const ACCOUNT_SID = 'ACe2845e8fac5cbfb5b0f6b60e4d93f3c0';
const AUTH_TOKEN = '411ef0668fad81a165a9f2f244c798a7';
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// Función para enviar alertas por SMS
const enviarAlertaSms = async (req, res) => {
    try {
        const telefono = req.query.telefono || '+56952689198';  // Número predeterminado si no se proporciona
        const meses = parseInt(req.query.meses) || 2;  // Meses predeterminados si no se proporciona

        console.log("Inicio de enviarAlertaSms");
        const productos = await pool.query(`
            SELECT id_producto, fecha_adquisicion, estado_logistico, vendido, cantidad
            FROM productos
            WHERE estado_logistico = 'En bodega' AND vendido = false AND cantidad > 0
        `);
        console.log("Productos obtenidos:", productos.rows);

        const fechaLimite = moment().subtract(meses, 'months');
        const productosAntiguos = productos.rows.filter(producto => 
            moment(producto.fecha_adquisicion).isBefore(fechaLimite)
        );

        if (productosAntiguos.length > 0) {
            // Crear el mensaje consolidado con todos los productos que llevan más tiempo en bodega
            const listaProductos = productosAntiguos.map(producto => `ID: ${producto.id_producto}`).join(', ');
            const mensaje = `Los siguientes productos llevan más de ${meses} meses en bodega y no se han vendido: ${listaProductos}.`;
            //const mensaje = `Productos en bodega por más de ${meses} meses: ${productosAntiguos.length}`;

            const message = await client.messages.create({
                from: '+14432724366',  // Número de Twilio
                body: mensaje,
                to: telefono
            });

            console.log(`Mensaje SMS enviado, SID: ${message.sid}`);
            res.status(200).json({ message: "Alerta enviada correctamente por SMS.", productos: productosAntiguos });
        } else {
            console.log("No hay productos que cumplan la condición.");
            res.status(200).json({ message: "No hay productos en bodega que cumplan con la condición de antigüedad." });
        }
    } catch (error) {
        console.error("Error enviando alertas de SMS:", error);
        res.status(500).json({ error: "Hubo un error al enviar las alertas de SMS." });
    }
};

module.exports = {
    enviarAlertaSms
};