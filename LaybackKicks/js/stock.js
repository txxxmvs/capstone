$(document).ready(function() {
    cargarProductos();

    // Función para formatear el número con separadores de miles y símbolo de $
    function formatearPrecio(valor) {
        if (typeof valor !== 'string') {
            valor = valor.toString();  // Asegurar que sea un string
        }
        // Remover todo lo que no sea números
        const num = valor.replace(/\D/g, '');
        return num ? '$' + Number(num).toLocaleString('es-CL') : '';
    }

    // Función para limpiar el formato del precio antes de enviarlo al servidor
    function limpiarPrecio(formato) {
        return formato.replace(/\./g, '').replace('$', '');
    }

    // Validación para que solo se puedan ingresar números y aplicar formato en tiempo real
    $('#precio-compra, #precio-venta').on('input', function() {
        // Obtener valor limpio sin formato
        const valorLimpio = this.value.replace(/\D/g, '');
        // Aplicar el formato con separadores de miles y símbolo $
        this.value = formatearPrecio(valorLimpio);
    });

    // Cargar productos en la tabla
    function cargarProductos() {
        $.ajax({
            url: 'http://localhost:3000/api/productos',
            method: 'GET',
            success: function(productos) {
                let filas = '';
                productos.forEach(function(producto) {
                    filas += `
                        <tr>
                            <td>${producto.id_producto}</td>
                            <td>${producto.modelo}</td>
                            <td>${producto.marca}</td>
                            <td>${producto.talla}</td>
                            <td>${producto.condicion}</td>
                            <td>${producto.cantidad}</td>
                            <td>${formatearPrecio(producto.precio_compra)}</td>
                            <td>${formatearPrecio(producto.precio_venta)}</td>
                            <td>
                                <button class="btn btn-warning btn-sm editar" data-id="${producto.id_producto}">Editar</button>
                                <button class="btn btn-danger btn-sm eliminar" data-id="${producto.id_producto}">Eliminar</button>
                                <button class="btn btn-success btn-sm vender" data-id="${producto.id_producto}" data-cantidad="${producto.cantidad}">Vender</button>
                            </td>
                        </tr>
                    `;
                });
                $('#product-list').html(filas);
            },
            error: function(error) {
                console.error('Error al cargar los productos', error);
            }
        });
    }

    // Procesar el formulario de nuevo producto
    $('#nuevo-producto').submit(function(e) {
        e.preventDefault();
        
        const nuevoProducto = {
            marca: $('#marca').val(),
            modelo: $('#modelo').val(),
            talla: $('#talla').val(),
            condicion: $('#condicion').val(),
            cantidad: $('#cantidad').val(),
            precio_compra: limpiarPrecio($('#precio-compra').val()),  // Limpiar formato antes de enviar
            precio_venta: limpiarPrecio($('#precio-venta').val()),    // Limpiar formato antes de enviar
            fecha_adq: $('#fecha-adq').val(),
        };

        $.ajax({
            url: 'http://localhost:3000/api/guardar_producto',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(nuevoProducto),
            success: function(response) {
                alert('Producto agregado con éxito');
                cargarProductos();  // Volver a cargar los productos después de agregar uno nuevo
                $('#nuevo-producto')[0].reset();
            },
            error: function(error) {
                alert('Error al agregar el producto');
                console.error(error);
            }
        });
    });
    $(document).ready(function() {
        // Mostrar el modal de venta cuando se haga clic en el botón "Vender"
        $(document).on('click', '.vender', function() {
            const idProducto = $(this).data('id');
            const cantidadDisponible = $(this).data('cantidad');
            
            // Pasar el id del producto al modal
            $('#venta-id-producto').val(idProducto);
            
            // Limpiar campos y asegurar que no se pueda vender más de lo disponible
            $('#fecha-venta').val('');
            $('#precio-final').val('');
            $('#cantidad-venta').val('').attr('max', cantidadDisponible);
    
            // Mostrar el modal de venta
            $('#ventaModal').modal('show');
        });
    
        // Registrar la venta cuando se haga clic en el botón "Registrar Venta"
        $('#registrar-venta-btn').click(function() {
            const idProducto = $('#venta-id-producto').val();  // Producto seleccionado
            const fechaVenta = $('#fecha-venta').val();
            const precioFinal = $('#precio-final').val();
            const cantidadVenta = $('#cantidad-venta').val();
            const maxCantidad = $('#cantidad-venta').attr('max');
        
            // Validar que la cantidad vendida no sea mayor que la cantidad disponible
            if (parseInt(cantidadVenta) > parseInt(maxCantidad)) {
                alert('No puedes vender más cantidad de la disponible.');
                return;
            }
            
            // Validar que la fecha de venta y el precio final no estén vacíos
            if (!fechaVenta || !precioFinal || cantidadVenta <= 0) {
                alert('Por favor, completa todos los campos correctamente.');
                return;
            }
    
            // Enviar datos de la venta, el id_usuario será gestionado en el backend
            $.ajax({
                url: `http://localhost:3000/api/vender_producto/${idProducto}`,  // Cambia al puerto correcto si es necesario
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    fecha_venta: fechaVenta,
                    precio_final: precioFinal,
                    cantidad_venta: cantidadVenta
                }),
                success: function(response) {
                    alert('Venta registrada con éxito');
                    $('#ventaModal').modal('hide');
                    cargarProductos();  // Recargar los productos
                },
                error: function(error) {
                    alert('Error al registrar la venta');
                    console.error(error);
                }
            });
        });
    });
    
    // Actualizar producto
    $('#editar-producto').submit(function(e) {
        e.preventDefault();

        const idProducto = $('#edit-id-producto').val();
        const productoActualizado = {
            marca: $('#edit-marca').val(),
            modelo: $('#edit-modelo').val(),
            talla: $('#edit-talla').val(),
            condicion: $('#edit-condicion').val(),
            cantidad: $('#edit-cantidad').val(),
            precio_compra: limpiarPrecio($('#edit-precio-compra').val()),  // Limpiar formato
            precio_venta: limpiarPrecio($('#edit-precio-venta').val()),    // Limpiar formato
            fecha_adq: $('#edit-fecha-adq').val(),
        };

        $.ajax({
            url: `http://localhost:3000/api/productos/${idProducto}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(productoActualizado),
            success: function(response) {
                alert('Producto actualizado con éxito');
                $('#editModal').modal('hide');
                cargarProductos();
            },
            error: function(error) {
                alert('Error al actualizar el producto');
                console.error(error);
            }
        });
    });

    // Eliminar producto
    $(document).on('click', '.eliminar', function() {
        const idProducto = $(this).data('id');
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            $.ajax({
                url: `http://localhost:3000/api/productos/${idProducto}`,
                method: 'DELETE',
                success: function(response) {
                    alert('Producto eliminado con éxito');
                    cargarProductos();
                },
                error: function(error) {
                    alert('Error al eliminar el producto');
                    console.error(error);
                }
            });
        }
    });
});