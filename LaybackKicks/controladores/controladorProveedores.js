const pool = require('../bd/bd');

// Obtener todos los proveedores
const obtenerProveedores = (req, res) => {
    pool.query('SELECT * FROM proveedores', (err, result) => {
        if (err) {
            console.error('Error al obtener proveedores:', err);
            res.status(500).json({ message: 'Error al obtener proveedores' });
        } else {
            res.json(result.rows);
        }
    });
};

// Insertar un nuevo proveedor
const insertarProveedor = (req, res) => {
    const { nombre, email, telefono } = req.body;
    pool.query('INSERT INTO proveedores (nombre, email, telefono) VALUES ($1, $2, $3)', [nombre, email, telefono], (err) => {
        if (err) {
            console.error('Error al insertar proveedor:', err);
            res.status(500).json({ message: 'Error al insertar proveedor' });
        } else {
            res.json({ message: 'Proveedor insertado con éxito' });
        }
    });
};

// Actualizar proveedor
const actualizarProveedor = (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono } = req.body;
    pool.query('UPDATE proveedores SET nombre = $1, email = $2, telefono = $3 WHERE id_proveedores = $4', [nombre, email, telefono, id], (err) => {
        if (err) {
            console.error('Error al actualizar proveedor:', err);
            res.status(500).json({ message: 'Error al actualizar proveedor' });
        } else {
            res.json({ message: 'Proveedor actualizado con éxito' });
        }
    });
};

// Eliminar proveedor
const eliminarProveedor = (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM proveedores WHERE id_proveedores = $1', [id], (err) => {
        if (err) {
            console.error('Error al eliminar proveedor:', err);
            res.status(500).json({ message: 'Error al eliminar proveedor' });
        } else {
            res.json({ message: 'Proveedor eliminado con éxito' });
        }
    });
};

module.exports = {
    obtenerProveedores,
    insertarProveedor,
    actualizarProveedor,
    eliminarProveedor
};