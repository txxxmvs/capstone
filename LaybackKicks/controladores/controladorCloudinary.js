const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary con tus credenciales
cloudinary.config({
    cloud_name: 'dsjloy2vm', // Reemplaza con tu Cloud Name
    api_key: '963765146714647', // Reemplaza con tu API Key
    api_secret: 'MXxn7rC7kKqQgjVbubQkQx4TV6w' // Reemplaza con tu API Secret
});

// Función para subir imagen a Cloudinary
const subirImagenACloudinary = async (imagenPath) => {
    try {
        const resultado = await cloudinary.uploader.upload(imagenPath, {
            folder: 'productos' // Carpeta en Cloudinary donde se almacenarán las imágenes
        });
        return resultado.secure_url; // Devuelve la URL segura de la imagen subida
    } catch (error) {
        console.error('Error al subir imagen a Cloudinary:', error);
        throw new Error('Error al subir la imagen');
    }
};

module.exports = { subirImagenACloudinary };
