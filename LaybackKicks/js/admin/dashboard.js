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
