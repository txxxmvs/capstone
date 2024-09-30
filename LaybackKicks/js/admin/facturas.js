document.addEventListener('DOMContentLoaded', function() {
    const generarFacturaBtn = document.getElementById('generar-factura-seleccionada');
    
    if (generarFacturaBtn) {
        generarFacturaBtn.addEventListener('click', function() {
            const seleccionados = document.querySelectorAll('.seleccionar-producto:checked');
            const ventas = Array.from(seleccionados).map(input => input.getAttribute('data-id'));

            if (ventas.length === 0) {
                alert('No se seleccionaron productos');
                return;
            }

            fetch('http://localhost:3000/api/facturas/generar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ventas })
            })
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'factura.pdf';
                link.click();
            })
            .catch(error => console.error('Error al generar la factura:', error));
        });
    } else {
        console.error('El botón de generar factura no se encuentra en el DOM');
    }

    function cargarProductosVendidos() {
        fetch('http://localhost:3000/api/facturas/vendidos')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const listaProductos = document.getElementById('lista-productos-vendidos');
                listaProductos.innerHTML = ''; 

                data.forEach(producto => {
                    const fechaVenta = new Date(producto.fecha_venta).toISOString().split('T')[0];
                    const precioFinal = `$${parseFloat(producto.precio_final).toLocaleString()}`;

                    listaProductos.innerHTML += `
                        <tr>
                            <td><input type="checkbox" class="seleccionar-producto" data-id="${producto.id_venta}"></td>
                            <td>${producto.id_venta}</td>
                            <td>${producto.productos_id_producto}</td>
                            <td>${producto.marca}</td>
                            <td>${producto.modelo}</td>
                            <td>${producto.talla}</td>
                            <td>${fechaVenta}</td>
                            <td>${producto.cantidad_venta}</td>
                            <td>${precioFinal}</td>
                        </tr>
                    `;
                });
            })
            .catch(error => console.error('Error al cargar productos vendidos:', error));
    }

    cargarProductosVendidos(); 
});