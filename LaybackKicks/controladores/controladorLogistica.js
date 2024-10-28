const pool = require('../bd/bd');


// Definir las transiciones válidas
const transicionesValidas = {
    'En camino': ['En bodega', 'Cancelada'],
    'En bodega': ['Pagándose', 'Cancelada'],
    'Pagándose': ['Cancelada']
};

// Función para verificar si una transición es válida
function esTransicionValida(estadoActual, nuevoEstado) {
    const transiciones = transicionesValidas[estadoActual];
    return transiciones && transiciones.includes(nuevoEstado);
}

// Función para actualizar el estado logístico de un producto
function actualizarEstadoLogistico(req, res) {
    console.log('Body recibido:', req.body);
    const idProducto = req.params.idProducto;
    const nuevoEstado = req.body.estado_logistico;

    // Consulta para obtener el estado logístico actual del producto
    const obtenerEstadoQuery = `SELECT estado_logistico FROM productos WHERE id_producto = $1`;

    pool.query(obtenerEstadoQuery, [idProducto], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el estado actual del producto.' });
        }

        const estadoActual = result.rows[0]?.estado_logistico;

        if (!estadoActual) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        // Verificar si la transición de estado es válida
        if (!esTransicionValida(estadoActual, nuevoEstado)) {
            return res.status(400).json({ error: 'Transición de estado no válida.' });
        }

        // Consulta para actualizar el estado logístico
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
    let { mes, año, estado } = req.query;

    // Formatear el mes para asegurarse de que tiene dos dígitos
    mes = mes.length === 1 ? `0${mes}` : mes;

    console.log('Mes recibido:', mes);
    console.log('Año recibido:', año);
    console.log('Estado recibido:', estado);

    // Base de la consulta
    let query = `
        SELECT id_producto, estado_logistico 
        FROM productos 
        WHERE EXTRACT(MONTH FROM fecha_adquisicion) = $1 
        AND EXTRACT(YEAR FROM fecha_adquisicion) = $2
    `;
    
    const params = [mes, año];

    // Si se envía un estado, lo añadimos a la consulta
    if (estado && estado !== '') {
        query += ' AND estado_logistico = $3';
        params.push(estado);
    }

    console.log('Consulta SQL:', query);
    console.log('Parámetros:', params);

    // Ejecutar la consulta
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