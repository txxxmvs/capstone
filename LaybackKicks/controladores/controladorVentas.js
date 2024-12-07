const pool = require('../bd/bd');

const registrarVenta = async (req, res) => {
    const idProducto = parseInt(req.params.id);
    const { fecha_venta, precio_final, cantidad_venta } = req.body;

    if (isNaN(idProducto)) {
        return res.status(400).json({ message: 'ID de producto no válido' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const usuarioResult = await client.query('SELECT id_usuario FROM usuario LIMIT 1');
        const idUsuario = usuarioResult.rows[0].id_usuario;

        const productoResult = await client.query('SELECT cantidad FROM productos WHERE id_producto = $1', [idProducto]);
        const cantidadDisponible = productoResult.rows[0].cantidad;

        if (cantidad_venta > cantidadDisponible) {
            return res.status(400).json({ message: 'No puedes vender más cantidad de la disponible' });
        }

        const queryProducto = 'UPDATE productos SET vendido = TRUE, cantidad = cantidad - $1 WHERE id_producto = $2';
        await client.query(queryProducto, [cantidad_venta, idProducto]);

        const queryVenta = 'INSERT INTO venta (fecha_venta, precio_final, cantidad_venta, productos_id_producto, usuario_id_usuario) VALUES ($1, $2, $3, $4, $5)';
        await client.query(queryVenta, [fecha_venta, precio_final, cantidad_venta, idProducto, idUsuario]);

        // Actualizar el estado logístico a 'Pagándose'
        const queryEstadoLogistico = 'UPDATE productos SET estado_logistico = $1 WHERE id_producto = $2';
        await client.query(queryEstadoLogistico, ['Pagándose', idProducto]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Venta registrada con éxito y estado logístico actualizado a Pagándose' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error al registrar la venta:', err);
        res.status(500).json({ message: 'Error al registrar la venta' });

    } finally {
        client.release();
    }
};

module.exports = {
    registrarVenta
};