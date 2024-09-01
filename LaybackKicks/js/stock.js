document.getElementById('nuevo-producto').addEventListener('submit', function(event) {
    event.preventDefault();

    const data = {
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        talla: parseInt(document.getElementById('talla').value),
        condicion: document.getElementById('condicion').value,
        cantidad: parseInt(document.getElementById('cantidad').value),
        precio_compra: parseInt(document.getElementById('precio-compra').value),
        precio_venta: parseInt(document.getElementById('precio-venta').value),
        fecha_adq: document.getElementById('fecha-adq').value
    };

    fetch('http://localhost:3000/api/guardar_producto', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});