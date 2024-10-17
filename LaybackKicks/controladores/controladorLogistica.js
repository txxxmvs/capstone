const pool = require('../bd/bd');


// Definir las transiciones válidas
const transicionesValidas = {
    'En camino': ['En bodega'],
    'En bodega': ['Pagándose'],
    'Pagándose': ['Cancelada']
};

// Función para verificar si una transición es válida
function esTransicionValida(estadoActual, nuevoEstado) {
    const transiciones = transicionesValidas[estadoActual];
    return transiciones && transiciones.includes(nuevoEstado);
}

// Función para actualizar el estado logístico de un producto
function actualizarEstadoLogistico(req, res) {
    const idProducto = req.params.idProducto;
    const nuevoEstado = req.body.estado_logistico;

    // Consultar el estado actual del producto antes de actualizarlo
    const obtenerEstadoQuery = `SELECT estado_logistico FROM productos WHERE id_producto = $1`;

    pool.query(obtenerEstadoQuery, [idProducto], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el estado actual del producto.' });
        }

        const estadoActual = result.rows[0]?.estado_logistico;

        if (!estadoActual) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        // Verificar si la transición es válida
        if (!esTransicionValida(estadoActual, nuevoEstado)) {
            return res.status(400).json({ error: 'Transición de estado no válida.' });
        }

        // Si la transición es válida, actualizamos el estado logístico en la base de datos
        const actualizarQuery = `UPDATE productos SET estado_logistico = $1 WHERE id_producto = $2`;

        pool.query(actualizarQuery, [nuevoEstado, idProducto], (error, result) => {
            if (error) {
                return res.status(500).json({ error: 'Error al actualizar el estado logístico.' });
            }
            res.status(200).json({ message: 'Estado logístico actualizado correctamente.' });
        });
    });
}

const filtrarLogistica = (req, res) => {
    const { mes, año, estado } = req.query;

    console.log('Mes recibido:', mes);
    console.log('Año recibido:', año);
    console.log('Estado recibido:', estado);

    let query = `
        SELECT id_producto, estado_logistico 
        FROM productos 
        WHERE EXTRACT(MONTH FROM fecha_adquisicion) = $1 
        AND EXTRACT(YEAR FROM fecha_adquisicion) = $2
    `;

    const params = [mes, año];

    // Si se envía un estado, lo añadimos a la consulta y a los parámetros
    if (estado && estado !== '') {
        query += ' AND estado_logistico = $3';
        params.push(estado);
    }

    pool.query(query, params, (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ error: 'Error al obtener los productos.' });
        }
        res.json(result.rows);
    });
};

module.exports = {
    actualizarEstadoLogistico,
    filtrarLogistica
};
