document.addEventListener('DOMContentLoaded', function() {
    const generarFacturaBtn = document.getElementById('generar-factura-seleccionada');
    const filtrarFacturasBtn = document.getElementById('filtrar-facturas');
    const mesSelect = document.getElementById('mes-select');
    const yearSelect = document.getElementById('year-select');
    const listaProductos = document.getElementById('lista-productos-vendidos');

    // Poblamos el selector de años dinámicamente (una sola vez)
    const startYear = 2023;
    const endYear = 2029;

    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearSelect.appendChild(option);
    }

    // Función para cargar productos vendidos con filtrado por mes y año
    function cargarProductosVendidos(mes = null, año = null) {
        let url = 'http://localhost:3000/api/facturas/vendidos';

        // Convertir mes y año a números
        mes = Number(mes);
        año = Number(año);

        // Agregar mes y año a la URL si están presentes
        if (mes && año) {
            url += `?mes=${mes}&año=${año}`;
        } else if (mes) {
            url += `?mes=${mes}`;
        } else if (año) {
            url += `?año=${año}`;
        }

        fetch(url)
            .then(response => response.json())  // Asume que la respuesta siempre será correcta
            .then(data => {
                listaProductos.innerHTML = '';  // Limpiar la tabla

                // Iterar sobre los productos recibidos y mostrarlos en la tabla
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

    // Filtrar productos vendidos por mes y año cuando se hace clic en "Filtrar Facturas"
    filtrarFacturasBtn.addEventListener('click', function() {
        const mes = Number(mesSelect.value);  // Convertir el mes seleccionado a número
        const año = Number(yearSelect.value);  // Convertir el año seleccionado a número
    
        console.log(`Filtrando facturas para mes: ${mes} y año: ${año}`);  // Verificar los valores
        
        cargarProductosVendidos(mes, año);  // Filtrar por mes y año
    });    

    // Generar factura para los productos seleccionados
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

    cargarProductosVendidos(); 
});