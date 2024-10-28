const twilio = require('twilio');
const pool = require('../bd/bd');
const moment = require('moment'); // Para manejar fechas

// Configuración de Twilio
const ACCOUNT_SID = 'ACe2845e8fac5cbfb5b0f6b60e4d93f3c0';
const AUTH_TOKEN = '411ef0668fad81a165a9f2f244c798a7';
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// Función para enviar alertas de WhatsApp
const enviarAlertaWsp = async (req, res) => {
    try {
        console.log("Inicio de enviarAlertaWsp");
        const productos = await pool.query(`
            SELECT id_producto, fecha_adquisicion, estado_logistico, vendido, cantidad
            FROM productos
            WHERE estado_logistico = 'En bodega' AND vendido = false AND cantidad > 0
        `);
        console.log("Productos obtenidos:", productos.rows);

        const dosMesesAtras = moment().subtract(2, 'months');
        for (const producto of productos.rows) {
            const fechaAdquisicion = moment(producto.fecha_adquisicion);
            if (fechaAdquisicion.isBefore(dosMesesAtras)) {
                console.log("Enviando alerta para producto:", producto.id_producto);
                await client.messages.create({
                    from: 'whatsapp:+14155238886',
                    body: `El producto con ID ${producto.id_producto} lleva más de 2 meses en bodega y no se ha vendido.`,
                    to: 'whatsapp:+56952689198',
                });
                console.log("Mensaje enviado para producto:", producto.id_producto);
            }
        }
        res.status(200).json({ message: "Alertas enviadas correctamente." });
    } catch (error) {
        console.error("Error enviando alertas de WhatsApp:", error);
        res.status(500).json({ error: "Hubo un error al enviar las alertas de WhatsApp." });
    }
};

module.exports = {
    enviarAlertaWsp
};