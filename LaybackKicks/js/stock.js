$(document).ready(function() {
    cargarProductos();

    $('#nuevo-producto').submit(function(e) {
        e.preventDefault();
        
        const nuevoProducto = {
            marca: $('#marca').val(),
            modelo: $('#modelo').val(),
            talla: $('#talla').val(),
            condicion: $('#condicion').val(),
            cantidad: $('#cantidad').val(),
            precio_compra: $('#precio-compra').val(),
            precio_venta: $('#precio-venta').val(),
            fecha_adq: $('#fecha-adq').val(),
        };

        $.ajax({
            url: 'http://localhost:3000/api/guardar_producto',
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
                            <td>${producto.precio_compra}</td>
                            <td>${producto.precio_venta}</td>
                            <td>
                                <button class="btn btn-warning btn-sm editar" data-id="${producto.id_producto}">Editar</button>
                                <button class="btn btn-danger btn-sm eliminar" data-id="${producto.id_producto}">Eliminar</button>
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

    $(document).on('click', '.editar', function() {
        const idProducto = $(this).data('id');
        
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
                $('#edit-precio-compra').val(producto.precio_compra);
                $('#edit-precio-venta').val(producto.precio_venta);
                $('#edit-fecha-adq').val(producto.fecha_adquisicion);

                $('#editModal').modal('show');
            },
            error: function(error) {
                alert('Error al obtener los detalles del producto');
                console.error(error);
            }
        });
    });

    $('#editar-producto').submit(function(e) {
        e.preventDefault();

        const idProducto = $('#edit-id-producto').val();
        const productoActualizado = {
            marca: $('#edit-marca').val(),
            modelo: $('#edit-modelo').val(),
            talla: $('#edit-talla').val(),
            condicion: $('#edit-condicion').val(),
            cantidad: $('#edit-cantidad').val(),
            precio_compra: $('#edit-precio-compra').val(),
            precio_venta: $('#edit-precio-venta').val(),
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