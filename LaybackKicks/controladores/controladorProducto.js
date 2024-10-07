const pool = require('../bd/bd');
const axios = require('axios');

// Obtener todos los productos
const obtenerProductos = (req, res) => {
    pool.query('SELECT * FROM productos', (err, result) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            res.status(500).json({ message: 'Error al obtener productos' });
        } else {
            res.json(result.rows);
        }
    });
};

// Insertar nuevo producto, con opción de publicar en Instagram
const insertarProducto = async (req, res) => {
    const { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq, publicarInstagram, descripcionInstagram, imagenesInstagram } = req.body;

    const query = `
    INSERT INTO productos (marca, modelo, talla, condicion, cantidad, cantidad_original, precio_compra, precio_venta, fecha_adquisicion)
    VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8) RETURNING *`;
    const values = [marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq];

    try {
        const result = await pool.query(query, values);
        const nuevoProducto = result.rows[0];

        // Verificar si se debe publicar en Instagram
        if (publicarInstagram) {
            const descripcion = descripcionInstagram || `${marca} ${modelo} talla ${talla}`;
            await publicarEnInstagram(imagenesInstagram, descripcion);
        }

        res.status(200).json({ message: 'Producto guardado exitosamente', producto: nuevoProducto });
    } catch (err) {
        console.error('Error al insertar producto:', err);
        res.status(500).json({ message: 'Error al guardar el producto' });
    }
};

// Función para publicar en Instagram usando la API de Instagram Graph
const publicarEnInstagram = async (imagenes, descripcion) => {
    const tokenDeAcceso = 'IGQWROWEV1WE5hcHpqbW4tWWhIeGVfWjRMNTdCMXlhSnZA4TDdNTUpvSVMyR0x1ejdEd3ZAWVXVxdUFMRTJick0yRzJWcHNWRkV5Skd6dkRyMEFNZAmxQeUVCVkt5NDZAxakcwWFAxS0dYYWhkc2d5alptc2JlTElicjgZD';  // Coloca tu token de acceso aquí
    const userId = '70086410698';  // Coloca tu ID de Instagram aquí

    try {
        for (let imagen of imagenes) {
            // Subir imagen a Instagram
            const resSubida = await axios.post(`https://graph.facebook.com/v17.0/${userId}/media`, {
                image_url: imagen, // La URL de la imagen
                caption: descripcion,
                access_token: tokenDeAcceso
            });

            const mediaId = resSubida.data.id;

            // Publicar la imagen en Instagram
            await axios.post(`https://graph.facebook.com/v17.0/${userId}/media_publish`, {
                creation_id: mediaId,
                access_token: tokenDeAcceso
            });
        }
    } catch (error) {
        console.error('Error al publicar en Instagram:', error);
    }
};

// Actualizar producto
const actualizarProducto = (req, res) => {
    const idProducto = parseInt(req.params.id, 10);
    const { marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq } = req.body;

    if (isNaN(idProducto)) {
        return res.status(400).json({ message: 'ID de producto no válido' });
    }

    const query = `
    UPDATE productos 
    SET marca = $1, modelo = $2, talla = $3, condicion = $4, cantidad = $5, precio_compra = $6, precio_venta = $7, fecha_adquisicion = $8
    WHERE id_producto = $9 RETURNING *`;

    const values = [marca, modelo, talla, condicion, cantidad, precio_compra, precio_venta, fecha_adq, idProducto];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            return res.status(500).json({ message: 'Error al actualizar el producto' });
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    });
};

// Eliminar producto
const eliminarProducto = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM productos WHERE id_producto = $1';

    pool.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar producto:', err);
            res.status(500).json({ message: 'Error al eliminar el producto' });
        } else if (result.rowCount === 0) {
            res.status(404).json({ message: 'Producto no encontrado' });
        } else {
            res.status(200).json({ message: 'Producto eliminado exitosamente' });
        }
    });
};

// Obtener producto por ID
const obtenerProductoPorId = (req, res) => {
    const id = req.params.id;
    pool.query('SELECT * FROM productos WHERE id_producto = $1', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener el producto' });
        } else if (result.rows.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            res.json(result.rows[0]);
        }
    });
};

module.exports = {
    obtenerProductos,
    insertarProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProductoPorId
};
