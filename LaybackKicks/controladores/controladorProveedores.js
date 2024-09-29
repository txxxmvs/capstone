const pool = require('../bd/bd');

// Verificar si el ID del producto existe en la tabla productos
const verificarProducto = (productos_id_producto) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM productos WHERE id_producto = $1', [productos_id_producto], (err, result) => {
            if (err) return reject(err);
            if (result.rows.length === 0) {
                return reject(new Error('ID de producto no válido'));
            }
            resolve();
        });
    });
};

// Verificar si el ID del producto ya está asociado a otro proveedor
const verificarProductoDuplicado = (productos_id_producto) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM proveedores WHERE productos_id_producto = $1', [productos_id_producto], (err, result) => {
            if (err) return reject(err);
            if (result.rows.length > 0) {
                return reject(new Error('Este producto ya está asociado a otro proveedor'));
            }
            resolve();
        });
    });
};

// Función para obtener la lista de proveedores
const obtenerProveedores = (req, res) => {
    pool.query('SELECT * FROM proveedores', (err, result) => {
        if (err) {
            console.error('Error al obtener los proveedores:', err);
            res.status(500).json({ message: 'Error al obtener los proveedores' });
        } else {
            res.json(result.rows);
        }
    });
};

// Obtener un proveedor por su ID
const obtenerProveedorPorId = (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM proveedores WHERE id_proveedores = $1', [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el proveedor por ID:', err);
            res.status(500).json({ message: 'Error al obtener el proveedor por ID' });
        } else if (result.rows.length === 0) {
            res.status(404).json({ message: 'Proveedor no encontrado' });
        } else {
            res.json(result.rows[0]);
        }
    });
};

// Insertar un nuevo proveedor
const insertarProveedor = async (req, res) => {
    const { nombre, email, telefono, productos_id_producto } = req.body;
    try {
        await verificarProducto(productos_id_producto);
        await verificarProductoDuplicado(productos_id_producto); 
        pool.query('INSERT INTO proveedores (nombre, email, telefono, productos_id_producto) VALUES ($1, $2, $3, $4)', [nombre, email, telefono, productos_id_producto], (err) => {
            if (err) {
                console.error('Error al insertar proveedor:', err);
                res.status(500).json({ message: 'Error al insertar proveedor' });
            } else {
                res.json({ message: 'Proveedor insertado con éxito' });
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Actualizar proveedor
const actualizarProveedor = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, productos_id_producto } = req.body;
    try {
        await verificarProducto(productos_id_producto); 
        await verificarProductoDuplicado(productos_id_producto); 
        pool.query('UPDATE proveedores SET nombre = $1, email = $2, telefono = $3, productos_id_producto = $4 WHERE id_proveedores = $5', [nombre, email, telefono, productos_id_producto, id], (err) => {
            if (err) {
                console.error('Error al actualizar proveedor:', err);
                res.status(500).json({ message: 'Error al actualizar proveedor' });
            } else {
                res.json({ message: 'Proveedor actualizado con éxito' });
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Eliminar proveedor
const eliminarProveedor = (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM proveedores WHERE id_proveedores = $1', [id], (err) => {
        if (err) {
            console.error('Error al eliminar el proveedor:', err);
            res.status(500).json({ message: 'Error al eliminar el proveedor' });
        } else {
            res.json({ message: 'Proveedor eliminado con éxito' });
        }
    });
};

module.exports = {
    obtenerProveedores,
    insertarProveedor,
    actualizarProveedor,
    eliminarProveedor,
    obtenerProveedorPorId
};