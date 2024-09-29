const pool = require('../bd/bd');
const nodemailer = require('nodemailer');

// Función para verificar si el email ya existe en la base de datos
const verificarEmailDuplicado = (email, callback) => {
    pool.query('SELECT * FROM usuario WHERE email = $1', [email], (err, result) => {
        if (err) {
            console.error('Error al verificar el email:', err);
            callback(err, null);
        } else {
            callback(null, result.rows.length > 0); 
        }
    });
};

// Obtener todos los usuarios
const obtenerUsuarios = (req, res) => {
    pool.query('SELECT * FROM usuario', (err, result) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            res.status(500).json({ message: 'Error al obtener usuarios' });
        } else {
            res.json(result.rows);
        }
    });
};

// Obtener un usuario específico
const obtenerUsuarioPorId = (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [id], (err, result) => {
        if (err) {
            console.error('Error al obtener usuario:', err);
            res.status(500).json({ message: 'Error al obtener usuario' });
        } else if (result.rows.length === 0) {
            res.status(404).json({ message: 'Usuario no encontrado' });
        } else {
            res.json(result.rows[0]);
        }
    });
};

// Insertar un nuevo usuario
const insertarUsuario = (req, res) => {
    const { email, contrasena, rol } = req.body;

    // Verificar si el email ya está en uso
    verificarEmailDuplicado(email, (err, existe) => {
        if (err) {
            return res.status(500).json({ message: 'Error al verificar el email' });
        }
        if (existe) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Si el email no está duplicado, insertar el nuevo usuario
        pool.query('INSERT INTO usuario (email, contrasena, rol) VALUES ($1, $2, $3)', [email, contrasena, rol], (err) => {
            if (err) {
                console.error('Error al insertar usuario:', err);
                res.status(500).json({ message: 'Error al insertar usuario' });
            } else {
                res.json({ message: 'Usuario insertado con éxito' });
            }
        });
    });
};

// Eliminar usuario
const eliminarUsuario = (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM usuario WHERE id_usuario = $1', [id], (err) => {
        if (err) {
            console.error('Error al eliminar usuario:', err);
            res.status(500).json({ message: 'Error al eliminar usuario' });
        } else {
            res.json({ message: 'Usuario eliminado con éxito' });
        }
    });
};

// Actualizar solo el rol del usuario
const actualizarUsuario = (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;

    if (!rol) {
        return res.status(400).json({ message: 'El rol es requerido' });
    }

    pool.query('UPDATE usuario SET rol = $1 WHERE id_usuario = $2', [rol, id], (err) => {
        if (err) {
            console.error('Error al actualizar rol del usuario:', err);
            res.status(500).json({ message: 'Error al actualizar el rol del usuario' });
        } else {
            res.json({ message: 'Rol del usuario actualizado con éxito' });
        }
    });
};

// Actualizar solo la contraseña del usuario
const cambiarContrasena = (req, res) => {
    const { id } = req.params;
    const { nuevaContrasena } = req.body;

    pool.query('UPDATE usuario SET contrasena = $1 WHERE id_usuario = $2', [nuevaContrasena, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al cambiar la contraseña' });
        }
        res.json({ message: 'Contraseña actualizada correctamente' });
    });
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    insertarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    cambiarContrasena
};