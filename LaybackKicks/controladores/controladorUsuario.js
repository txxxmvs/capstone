const pool = require('../bd/bd');

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
    pool.query('INSERT INTO usuario (email, contrasena, rol) VALUES ($1, $2, $3)', [email, contrasena, rol], (err) => {
        if (err) {
            console.error('Error al insertar usuario:', err);
            res.status(500).json({ message: 'Error al insertar usuario' });
        } else {
            res.json({ message: 'Usuario insertado con éxito' });
        }
    });
};

// Actualizar usuario
const actualizarUsuario = (req, res) => {
    const { id } = req.params;
    const { email, contrasena, rol } = req.body;
    pool.query('UPDATE usuario SET email = $1, contrasena = $2, rol = $3 WHERE id_usuario = $4', [email, contrasena, rol, id], (err) => {
        if (err) {
            console.error('Error al actualizar usuario:', err);
            res.status(500).json({ message: 'Error al actualizar usuario' });
        } else {
            res.json({ message: 'Usuario actualizado con éxito' });
        }
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

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    insertarUsuario, 
    actualizarUsuario,
    eliminarUsuario
};