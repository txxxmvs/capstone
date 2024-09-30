const pool = require('../bd/bd');

// Ruta para login
const iniciarSesion = (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM usuario WHERE email = $1 AND contrasena = $2';
  
    pool.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error al verificar credenciales:', err);
            res.status(500).json({ message: 'Error al verificar las credenciales' });
        } else if (results.rows.length > 0) {
            const user = results.rows[0];
            req.session.user = {
                id: user.id_usuario,
                rol: user.rol
            };
            res.json({ rol: user.rol });
        } else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    });
};

// Cerrar sesión
const cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};

module.exports = {
    iniciarSesion,
    cerrarSesion
};