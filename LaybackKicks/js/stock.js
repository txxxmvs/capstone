$(document).ready(function() {
    cargarProductos();

    function formatearPrecio(valor) {
        if (typeof valor !== 'string') {
            valor = valor.toString(); 
        }

        const num = valor.replace(/\D/g, '');
        return num ? '$' + Number(num).toLocaleString('es-CL') : '';
    }

    function limpiarPrecio(formato) {
        return formato.replace(/\./g, '').replace('$', '');
    }

    $('#precio-compra, #precio-venta').on('input', function() {
        const valorLimpio = this.value.replace(/\D/g, '');
        this.value = formatearPrecio(valorLimpio);
    });

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
    
        // Validar que todos los campos estén completos
        const marca = $('#marca').val().trim();
        const modelo = $('#modelo').val().trim();
        const talla = $('#talla').val().trim();
        const condicion = $('#condicion').val().trim();
        const cantidad = $('#cantidad').val().trim();
        const precio_compra = limpiarPrecio($('#precio-compra').val().trim());
        const precio_venta = limpiarPrecio($('#precio-venta').val().trim());
        const fecha_adq = $('#fecha-adq').val().trim();
    
        if (!marca || !modelo || !talla || !condicion || !cantidad || !precio_compra || !precio_venta || !fecha_adq) {
            alert('Por favor, completa todos los campos.');
            return;
        }
    
        const nuevoProducto = {
            marca: marca,
            modelo: modelo,
            talla: talla,
            condicion: condicion,
            cantidad: cantidad,
            precio_compra: precio_compra,
            precio_venta: precio_venta,
            fecha_adq: fecha_adq,
        };
    
        $.ajax({
            url: 'http://localhost:3000/api/productos',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(nuevoProducto),
            success: function(response) {
                alert('Producto agregado con éxito');
                cargarProductos(); 
                $('#nuevo-producto')[0].reset();
            },
            error: function(error) {
                alert('Error al agregar el producto');
                console.error(error);
            }
        });
    });

    // Registrar venta
    $(document).on('click', '.vender', function() {
        const idProducto = $(this).data('id');
        const cantidadDisponible = $(this).data('cantidad');
        
        $('#venta-id-producto').val(idProducto);
        $('#fecha-venta').val('');
        $('#precio-final').val('');
        $('#cantidad-venta').val('').attr('max', cantidadDisponible);
        $('#ventaModal').modal('show');
    });

    $('#registrar-venta-btn').click(function() {
        const idProducto = $('#venta-id-producto').val(); 
        const fechaVenta = $('#fecha-venta').val();
        const precioFinal = $('#precio-final').val();
        const cantidadVenta = $('#cantidad-venta').val();
        const maxCantidad = $('#cantidad-venta').attr('max');
    
        if (parseInt(cantidadVenta) > parseInt(maxCantidad)) {
            alert('No puedes vender más cantidad de la disponible.');
            return;
        }
        
        if (!fechaVenta || !precioFinal || cantidadVenta <= 0) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

        $.ajax({
            url: `http://localhost:3000/api/ventas/registrar/${idProducto}`, 
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                fecha_venta: fechaVenta,
                precio_final: precioFinal,
                cantidad_venta: cantidadVenta
            }),
            success: function(response) {
                alert('Venta registrada con éxito');
                $('#ventaModal').modal('hide');
                cargarProductos();  
            },
            error: function(error) {
                alert('Error al registrar la venta');
                console.error(error);
            }
        });
    });

 // Abre el modal de edición cuando se hace clic en el botón "Editar"
    $(document).on('click', '.editar', function() {
        const idProducto = $(this).data('id');  // Obtiene el ID del producto desde el botón

        if (!idProducto || isNaN(idProducto)) {
            console.error('ID de producto no válido:', idProducto);
            alert('ID de producto no válido');
            return;
        }

        // Llenar el formulario del modal con los valores actuales del producto
        $.ajax({
            url: `http://localhost:3000/api/productos/${idProducto}`,
            method: 'GET',
            success: function(producto) {
                $('#edit-id-producto').val(producto.id_producto);
                $('#edit-marca').val(producto.marca);
                $('#edit-modelo').val(producto.modelo);
                $('#edit-talla').val(producto.talla);
                $('#edit-condicion').val(producto.condicion);
                $('#edit-cantidad').val(producto.cantidad);
                $('#edit-precio-compra').val(formatearPrecio(producto.precio_compra));
                $('#edit-precio-venta').val(formatearPrecio(producto.precio_venta));
                $('#edit-fecha-adq').val(producto.fecha_adquisicion);

                // Mostrar el modal
                $('#editModal').modal('show');
            },
            error: function(error) {
                console.error('Error al obtener los datos del producto para editar:', error);
                alert('Error al cargar los datos del producto');
            }
        });
    });

    // Procesar la actualización del producto
    $('#editar-producto').submit(function(e) {
        e.preventDefault();

        const idProducto = $('#edit-id-producto').val();
        const productoActualizado = {
            marca: $('#edit-marca').val(),
            modelo: $('#edit-modelo').val(),
            talla: $('#edit-talla').val(),
            condicion: $('#edit-condicion').val(),
            cantidad: $('#edit-cantidad').val(),
            precio_compra: limpiarPrecio($('#edit-precio-compra').val()),  
            precio_venta: limpiarPrecio($('#edit-precio-venta').val()),    
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