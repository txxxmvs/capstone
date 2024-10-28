$(document).ready(function() {
    const currentYear = new Date().getFullYear();
    const yearSelect = $('#year-select');
    
    // Llenar el selector de años
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
        yearSelect.append(new Option(year, year));
    }

    $('#year-select').val(currentYear);

    // Variables para almacenar las instancias de los gráficos
    let montoRetornoChart, estadoLogisticoChart, ventasMensualesChart, ventasPorMarcaChart, ventasAnualesChart, dispersionPrecioCantidadChart;

    // Función para cargar los datos del dashboard
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
            $('#total-productos').text(data.totalProductos);
            $('#ganancia-estimada').text(data.gananciaEstimada.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));
            $('#promedio-precio-venta').text(data.promedioPrecioVenta.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));

            // Mostrar los gráficos
            mostrarGraficoMontoRetorno(data.montoInvertido, data.posibleRetorno);
            mostrarGraficoEstadoLogistico(data.estadoLogistico);
            mostrarGraficoVentasMensuales(data.ventasMensuales);
            mostrarGraficoVentasPorMarca(data.ventasPorMarca);
            mostrarGraficoVentasAnuales(data.ventasAnuales);
            mostrarGraficoDispersionPrecioCantidad(data.dispersionPrecioCantidad);


        },
        error: function(error) {
            console.error('Error al cargar los datos del dashboard', error);
        }
    });
}


=======

        },
        error: function(error) {
            console.error('Error al cargar los datos del dashboard', error);
        }
    });
}



    // Función para mostrar el gráfico de Monto Invertido vs Posible Retorno
    function mostrarGraficoMontoRetorno(montoInvertido, posibleRetorno) {
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
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monto Invertido vs Posible Retorno',
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

        // Función para mostrar el gráfico de Estado Logístico
    function mostrarGraficoEstadoLogistico(estadoLogistico) {
        const ctx = document.getElementById('estado-logistico-chart').getContext('2d');
        if (estadoLogisticoChart) {
            estadoLogisticoChart.destroy();  // Destruir gráfico anterior si existe
        }

        if (!estadoLogistico || Object.keys(estadoLogistico).length === 0) {
            console.error("Error: 'estadoLogistico' no contiene datos válidos.");
            return;

        }

        // Crear etiquetas y valores basados en los datos de estadoLogistico
        const labels = Object.keys(estadoLogistico);
        const dataValues = Object.values(estadoLogistico);

        estadoLogisticoChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Estado Logístico de Productos',
                    data: dataValues,
                    backgroundColor: ['#1abc9c', '#3498db', '#f39c12', '#e74c3c']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución de Productos por Estado Logístico',
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    }
                }
            }
        });
    }

    
    

    function mostrarGraficoVentasMensuales(ventasMensuales) {
        const ctx = document.getElementById('ventas-mensuales-chart').getContext('2d');
        if (ventasMensualesChart) {
            ventasMensualesChart.destroy();  // Destruir gráfico anterior si existe
        }

        }

        // Crear etiquetas y valores basados en los datos de estadoLogistico
        const labels = Object.keys(estadoLogistico);
        const dataValues = Object.values(estadoLogistico);

        estadoLogisticoChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Estado Logístico de Productos',
                    data: dataValues,
                    backgroundColor: ['#1abc9c', '#3498db', '#f39c12', '#e74c3c']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución de Productos por Estado Logístico',
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    }
                }
            }
        });
    }

    
    

    function mostrarGraficoVentasMensuales(ventasMensuales) {
        const ctx = document.getElementById('ventas-mensuales-chart').getContext('2d');
        if (ventasMensualesChart) {
            ventasMensualesChart.destroy();  // Destruir gráfico anterior si existe
        }

    
        const labels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        ventasMensualesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas Mensuales',
                    data: ventasMensuales,
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.2)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolución de Ventas Mensuales',
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    

    function mostrarGraficoVentasPorMarca(ventasPorMarca) {
        const ctx = document.getElementById('ventas-por-marca-chart').getContext('2d');
        if (ventasPorMarcaChart) {
            ventasPorMarcaChart.destroy();
        }
    
        const labels = Object.keys(ventasPorMarca);
        const dataValues = Object.values(ventasPorMarca);
    
        ventasPorMarcaChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas por Marca',
                    data: dataValues,
                    backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ventas por Marca',
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    

    function mostrarGraficoVentasAnuales(ventasAnuales) {
        const ctx = document.getElementById('ventas-anuales-chart').getContext('2d');
        if (ventasAnualesChart) {
            ventasAnualesChart.destroy();  // Destruir gráfico anterior si existe
        }
    
        const labels = Object.keys(ventasAnuales).length > 0 ? Object.keys(ventasAnuales) : ['Sin Datos'];
        const dataValues = Object.keys(ventasAnuales).length > 0 ? Object.values(ventasAnuales) : [0];
    
        ventasAnualesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas Anuales',
                    data: dataValues,
                    backgroundColor: ['#2ecc71', '#3498db', '#e74c3c', '#9b59b6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución de Ventas por Año',
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    

        // Función para mostrar el gráfico de dispersión entre Precio y Cantidad Vendida
    function mostrarGraficoDispersionPrecioCantidad(dispersionData) {
        const ctx = document.getElementById('dispersion-precio-cantidad-chart').getContext('2d');
        if (dispersionPrecioCantidadChart) {
            dispersionPrecioCantidadChart.destroy();  // Destruir gráfico anterior si existe
        }

        dispersionPrecioCantidadChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Precio vs Cantidad Vendida',
                    data: dispersionData,  // Utilizar los datos proporcionados
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Relación entre Precio y Cantidad Vendida',
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Precio (CLP)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad Vendida'
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

    // Evento de clic para el zoom en las tarjetas de gráficos
    $('.dashboard-grid .card').on('click', function(event) {
        event.stopPropagation();
        $(this).toggleClass('active');

        // Redibujar el gráfico al cambiar el tamaño
        if ($(this).hasClass('active')) {
            if (this.querySelector('canvas').id === 'monto-retorno-chart') {
                montoRetornoChart.resize();
            } else if (this.querySelector('canvas').id === 'estado-logistico-chart') {
                estadoLogisticoChart.resize();
            } else if (this.querySelector('canvas').id === 'ventas-mensuales-chart') {
                ventasMensualesChart.resize();
            } else if (this.querySelector('canvas').id === 'categorias-ventas-chart') {
                categoriasVentasChart.resize();
            } else if (this.querySelector('canvas').id === 'ventas-anuales-chart') {
                ventasAnualesChart.resize();
            } else if (this.querySelector('canvas').id === 'ventas-por-marca-chart') {
                ventasPorMarcaChart.resize(); // Agrega esta línea para el gráfico de Ventas por Marca
            }
        }
    });

    // Detectar clic fuera de la tarjeta para restaurar el tamaño
    $(document).on('click', function(event) {
        if (!$(event.target).closest('.dashboard-grid .card').length) {
            $('.dashboard-grid .card').removeClass('active');
        }
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