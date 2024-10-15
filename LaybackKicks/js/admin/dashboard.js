$(document).ready(function() {
    const currentYear = new Date().getFullYear();
    const yearSelect = $('#year-select');
    
    // Llenar el selector de años
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
        yearSelect.append(new Option(year, year));
    }

    $('#year-select').val(currentYear);

    // Variables para almacenar las instancias de los gráficos
    let montoRetornoChart, ventasProductosChart;

    function cargarDatosDashboard(mes, año) {
        $.ajax({
            url: `http://localhost:3000/api/dashboard?mes=${mes}&año=${año}`,
            method: 'GET',
            success: function(data) {
                console.log(data);  // Verificar la respuesta del servidor en la consola
    
                // Actualizar las métricas en el dashboard
                $('#monto-invertido').text(data.montoInvertido.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));
                $('#posible-retorno').text(data.posibleRetorno.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));
                $('#total-ventas').text(data.totalVentas.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));
    
                // Nuevas métricas
                $('#total-productos').text(data.totalProductos);  // Mostrar el total de productos
                $('#ganancia-estimada').text(data.gananciaEstimada.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));
                $('#promedio-precio-venta').text(data.promedioPrecioVenta.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));

                // Actualizar los gráficos
                actualizarGraficoMontoRetorno(data.montoInvertido, data.posibleRetorno);
                actualizarGraficoVentasProductos(data.totalVentas, data.totalProductos);
            },
            error: function(error) {
                console.error('Error al cargar los datos del dashboard', error);
            }
        });
    }

    // Función para actualizar el gráfico de Monto Invertido y Posible Retorno
    function actualizarGraficoMontoRetorno(montoInvertido, posibleRetorno) {
        const ctx = document.getElementById('monto-retorno-chart').getContext('2d');
        if (montoRetornoChart) {
            montoRetornoChart.destroy();  // Destruir gráfico anterior si existe
        }
        montoRetornoChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Monto Invertido', 'Posible Retorno'],
                datasets: [{
                    label: 'Monto en CLP',
                    data: [montoInvertido, posibleRetorno],
                    backgroundColor: ['#3498db', '#2ecc71']
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Función para actualizar el gráfico de Ventas y Productos Vendidos
    function actualizarGraficoVentasProductos(totalVentas, totalProductos) {
        const ctx = document.getElementById('ventas-productos-chart').getContext('2d');
        if (ventasProductosChart) {
            ventasProductosChart.destroy();  // Destruir gráfico anterior si existe
        }
        ventasProductosChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Total Ventas', 'Total Productos Vendidos'],
                datasets: [{
                    label: 'Cantidad',
                    data: [totalVentas, totalProductos],
                    backgroundColor: 'rgba(255, 255, 255, 1)',  // Fondo blanco completo
                    borderColor: '#e67e22',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#000',  // Cambiar el color de los números del eje Y a negro
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'  // Cambiar el color de las líneas de la cuadrícula
                        }
                    },
                    x: {
                        ticks: {
                            color: '#000',  // Cambiar el color de los números del eje X a negro
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'  // Cambiar el color de las líneas de la cuadrícula
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#000'  // Cambiar el color de las etiquetas de la leyenda a negro
                        }
                    }
                }
            }
        });
    }
    
    

    const currentMonth = new Date().getMonth() + 1;
    cargarDatosDashboard(currentMonth, currentYear);

    // Filtrar datos cuando se hace clic en el botón "Filtrar"
    $('#filter-button').click(function() {
        const mes = $('#month-select').val();
        const año = $('#year-select').val();
        cargarDatosDashboard(mes, año);
    });
});


$(document).ready(function () {
    const yearSelect = $('#year-select');
    const monthSelect = $('#month-select');
    const estadoSelect = $('#estado-select');

    // Establecer los valores por defecto (mes y año actuales)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    $('#year-select').val(currentYear);
    $('#month-select').val(currentMonth);

    // Verificar que se capturan correctamente los valores seleccionados
    console.log('Año seleccionado:', yearSelect.val());
    console.log('Mes seleccionado:', monthSelect.val());
    console.log('Estado seleccionado:', estadoSelect.val());

    $('#filter-button-productos').click(function () {
        const mes = $('#month-select').val();
        const año = $('#year-select').val();
        const estado = $('#estado-select').val();
    
        console.log('Año seleccionado:', año);
        console.log('Mes seleccionado:', mes);
        console.log('Estado seleccionado:', estado);
    
    
        cargarProductosEstado(mes, año, estado);
    });

    // Función para cargar los productos filtrados
    function cargarProductosEstado(mes, año, estado) {
        // Verificar los parámetros antes de enviar la petición AJAX
        const params = {
            mes: mes || '',
            año: año || '',
            estado: estado || ''
        };

        console.log('Parámetros enviados a la API:', params);

        $.ajax({
            url: `http://localhost:3000/api/logistica?mes=${encodeURIComponent(params.mes)}&año=${encodeURIComponent(params.año)}&estado=${encodeURIComponent(params.estado)}`,
            method: 'GET',
            success: function (data) {
                console.log('Respuesta de la API:', data);
                const productosList = $('#productos-list');
                productosList.empty(); // Limpiar la tabla

                if (data.length === 0) {
                    productosList.append('<tr><td colspan="3">No se encontraron productos</td></tr>');
                } else {
                    data.forEach(producto => {
                        let botones = '';

                        // Mostrar los botones según el estado actual del producto
                        if (producto.estado_logistico === 'En camino') {
                            botones += `<button onclick="cambiarEstadoLogistico(${producto.id_producto}, 'En bodega')">A Bodega</button>`;
                        } else if (producto.estado_logistico === 'En bodega') {
                            botones += `<button onclick="cambiarEstadoLogistico(${producto.id_producto}, 'Pagándose')">A Pagándose</button>`;
                        }
                        if (producto.estado_logistico !== 'Pagándose') {
                            botones += `<button onclick="cambiarEstadoLogistico(${producto.id_producto}, 'Cancelada')">Cancelar</button>`;
                        }

                        productosList.append(`
                            <tr>
                                <td>${producto.id_producto}</td>
                                <td>${producto.estado_logistico}</td>
                                <td>${botones}</td>
                            </tr>
                        `);
                    });
                }
            },
            error: function (error) {
                console.error('Error al cargar los productos:', error);
            }
        });
    }
    
    // Función para cambiar el estado logístico de un producto (la mantengo como está)
    window.cambiarEstadoLogistico = function (idProducto, nuevoEstado) {
        fetch(`/api/logistica/${idProducto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado_logistico: nuevoEstado })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Error: ' + data.error);
                } else {
                    alert('Estado logístico actualizado correctamente');
                    // Recargar la lista de productos para reflejar el cambio
                    const mes = monthSelect.val();
                    const año = yearSelect.val();
                    const estado = estadoSelect.val();
                    cargarProductosEstado(mes, año, estado);
                }
            })
            .catch(error => {
                console.error('Error al actualizar el estado logístico:', error);
            });
    };
});