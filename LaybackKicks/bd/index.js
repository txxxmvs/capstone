const express = require('express');
const axios = require('axios');
const SneaksAPI = require('sneaks-api');
const sneaks = new SneaksAPI();
const app = express();
const cors = require('cors');

// Configuración del servidor
app.use(cors());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Ruta principal para ver el catálogo de zapatillas
app.get('/', (req, res) => {
    sneaks.getMostPopular(50, (err, shoes) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las zapatillas' });
        }
        console.log(shoes); // Agrega esta línea para ver la estructura
        res.render('sneakers', { shoes });
    });
});

// Ruta de búsqueda de zapatillas
app.get('/search', (req, res) => {
    const query = req.query.q;
    sneaks.getProducts(query, 10, (err, shoes) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la búsqueda' });
        }
        res.render('sneakers', { shoes });
    });
});

// Ruta para ver los precios de una zapatilla específica
app.get('/sneaker/:id', (req, res) => {
    const id = req.params.id;
    sneaks.getProductPrices(id, (err, shoe) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los detalles' });
        }
        res.render('details', { shoe });
    });
});

// Iniciar el servidor en el puerto 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log('Servidor escuchando en el puerto ${PORT}');
});

app.get('/sneakers', (req, res) => {
    res.render('sneakers'); // Asegúrate de que el nombre coincide con tu archivo sneakers.ejs
});