$(document).ready(function () {
    const yearSelect = $('#year-select-logistica');
    const monthSelect = $('#month-select-logistica');
    const estadoSelect = $('#estado-select-logistica');

    // Establecer los valores por defecto (mes y año actuales)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    $('#year-select-logistica').val(currentYear);
    $('#month-select-logistica').val(currentMonth);

    // Verificar que se capturan correctamente los valores seleccionados
    console.log('Año seleccionado:', yearSelect.val());
    console.log('Mes seleccionado:', monthSelect.val());
    console.log('Estado seleccionado:', estadoSelect.val());

    $('#filter-button-logistica').click(function () {
        const mes = $('#month-select-logistica').val();
        const año = $('#year-select-logistica').val();
        const estado = $('#estado-select-logistica').val();
    
        console.log('Año seleccionado:', año);
        console.log('Mes seleccionado:', mes);
        console.log('Estado seleccionado:', estado);
    
    
        cargarProductosEstado(mes, año, estado);
    });

    // Función para cargar los productos filtrados
    function cargarProductosEstado(mes, año, estado) {
        
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
    
    window.cambiarEstadoLogistico = function(idProducto, nuevoEstado) {
        fetch(`http://localhost:3000/api/logistica/${idProducto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado_logistico: nuevoEstado })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Estado actualizado:', data);
        })
        .catch(error => {
            console.error('Error al actualizar el estado logístico:', error);
        });
    };
});