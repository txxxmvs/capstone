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
        res.json({ message: 'Inicio de sesión exitoso' });
      } else {
        res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
      }
    });
};
  

module.exports = {
  iniciarSesion
};