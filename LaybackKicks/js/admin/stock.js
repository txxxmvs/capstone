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

    // Función para mostrar u ocultar los campos de Instagram
    function toggleInstagramFields() {
        const instagramFields = document.getElementById('instagramFields');
        const publicarInstagram = document.getElementById('publicarInstagram');
        if (publicarInstagram.checked) {
            instagramFields.style.display = 'block';
        } else {
            instagramFields.style.display = 'none';
        }
    }

    $('#precio-compra, #precio-venta, #edit-precio-compra, #edit-precio-venta').on('input', function() {
        const valorLimpio = this.value.replace(/\D/g, '');
        if (!isNaN(valorLimpio) && valorLimpio.length > 0) {
            this.value = formatearPrecio(valorLimpio);
        } else {
            this.value = ''; 
        }
    });

    function cargarProductos() {
        $.ajax({
            url: 'http://localhost:3000/api/productos',
            method: 'GET',
            success: function(productos) {
                // Obtener valores de los filtros
                const filtroMarca = $('#filtro-marca').val();
                const filtroId = $('#filtro-id').val();  
                const filtroTalla = $('#filtro-talla').val();  
                const filtroCondicion = $('#filtro-condicion').val();
    
                // Filtrar productos basados en los filtros seleccionados
                const productosFiltrados = productos.filter(producto => {
                    return (filtroMarca === '' || producto.marca.toLowerCase() === filtroMarca.toLowerCase()) &&
                           (filtroId === '' || producto.id_producto == filtroId) &&
                           (filtroTalla === '' || producto.talla.toString() === filtroTalla) && 
                           (filtroCondicion === '' || producto.condicion.toLowerCase() === filtroCondicion.toLowerCase());
                });

                            // Ordenar los productos por id_producto de mayor a menor si no hay filtros
                if (filtroMarca === '' && filtroId === '' && filtroTalla === '' && filtroCondicion === '') {
                    productosFiltrados.sort((a, b) => b.id_producto - a.id_producto);
                }
    
                // Ordenar y mostrar los productos filtrados
                let filas = '';
                productosFiltrados.forEach(function(producto) {
                    filas += `
                        <tr>
                            <td>${producto.id_producto}</td>
                            <td>${producto.marca}</td>
                            <td>${producto.modelo}</td>
                            <td>${producto.talla}</td>
                            <td>${producto.condicion}</td>
                            <td>${producto.cantidad}</td>
                            <td>${formatearPrecio(producto.precio_compra)}</td>
                            <td>${formatearPrecio(producto.precio_venta)}</td>
                            <td>
                                <button class="btn btn-warning btn-sm editar" data-id="${producto.id_producto}">Editar</button>
                                <button class="btn btn-danger btn-sm eliminar" data-id="${producto.id_producto}">Eliminar</button>
                                ${producto.cantidad > 0 ? `<button class="btn btn-success btn-sm vender" data-id="${producto.id_producto}" data-cantidad="${producto.cantidad}">Vender</button>` : ''}
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

    $('#btn-filtrar').click(function() {
        cargarProductos();
    });
    
    $('#btn-limpiar').click(function() {
        $('#filtro-id').val(''); 
        $('#filtro-marca').val(''); 
        $('#filtro-talla').val('');
        $('#filtro-condicion').val('');
        
        cargarProductos();
    });

    // Procesar el formulario de nuevo producto
    $('#nuevo-producto').submit(function(e) {
        e.preventDefault();
    
        const marca = $('#marca').val().trim();
        const modelo = $('#modelo').val().trim();
        const talla = $('#talla').val().trim();
        const condicion = $('#condicion').val().trim();
        const cantidad = $('#cantidad').val().trim();
        const precio_compra = limpiarPrecio($('#precio-compra').val().trim());
        const precio_venta = limpiarPrecio($('#precio-venta').val().trim());
        const fecha_adq = $('#fecha-adq').val().trim();
        const publicarInstagram = $('#publicarInstagram').is(':checked');
        const descripcionInstagram = $('#instagramDescripcion').val().trim();
        const imagenesInstagram = $('#instagramImagenes')[0].files;

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
            publicarInstagram: publicarInstagram,
            descripcionInstagram: descripcionInstagram,
            imagenesInstagram: []
        };

        // Procesar imágenes seleccionadas para Instagram
        if (imagenesInstagram.length > 0) {
            for (let i = 0; i < imagenesInstagram.length; i++) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    nuevoProducto.imagenesInstagram.push(e.target.result);
                };
                reader.readAsDataURL(imagenesInstagram[i]);
            }
        }

        $.ajax({
            url: 'http://localhost:3000/api/productos',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(nuevoProducto),
            success: function(response) {
                alert('Producto agregado con éxito');
                cargarProductos(); 
                $('#nuevo-producto')[0].reset();
                $('#instagramFields').hide();  // Ocultar campos de Instagram
            },
            error: function(error) {
                alert('Error al agregar el producto');
                console.error(error);
            }
        });
    });

    // Función para mostrar los campos de Instagram si se marca la opción
    $('#publicarInstagram').change(function() {
        toggleInstagramFields();
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
