$(document).ready(function() {
    cargarProveedores();

    // Función para cargar la lista de proveedores
    function cargarProveedores() {
        $.ajax({
            url: 'http://localhost:3000/api/proveedores',
            method: 'GET',
            success: function(proveedores) {
                let filas = '';
                proveedores.forEach(function(proveedor) {
                    filas += `
                        <tr>
                            <td>${proveedor.id_proveedores}</td>
                            <td>${proveedor.nombre}</td>
                            <td>${proveedor.email}</td>
                            <td>${proveedor.telefono}</td>
                            <td>${proveedor.productos_id_producto}</td> <!-- Mostrar el ID del producto asociado -->
                            <td>
                                <button class="btn btn-warning btn-sm editar" data-id="${proveedor.id_proveedores}">Editar</button>
                                <button class="btn btn-danger btn-sm eliminar" data-id="${proveedor.id_proveedores}">Eliminar</button>
                            </td>
                        </tr>
                    `;
                });
                $('#proveedores-list').html(filas);
            },
            error: function(error) {
                console.error('Error al cargar los proveedores', error);
            }
        });
    }

    // Procesar el formulario de nuevo proveedor
    $('#proveedor-form').submit(function(e) {
        e.preventDefault();

        const nombre = $('#nombre').val().trim();
        const email = $('#email').val().trim();
        const telefono = $('#telefono').val().trim();
        const productos_id_producto = $('#productos_id_producto').val().trim(); // Capturando el ID del producto

        if (!nombre || !email || !telefono || !productos_id_producto) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const nuevoProveedor = { nombre, email, telefono, productos_id_producto }; // Enviando el ID del producto

        $.ajax({
            url: 'http://localhost:3000/api/proveedores',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(nuevoProveedor),
            success: function() {
                alert('Proveedor agregado con éxito');
                cargarProveedores();
                $('#proveedor-form')[0].reset();
            },
            error: function(error) {
                alert(error.responseJSON.message || 'Error al agregar el proveedor');
                console.error(error);
            }
        });
    });

    // Abre el modal de edición de proveedor
    $(document).on('click', '.editar', function() {
        const idProveedor = $(this).data('id');

        $.ajax({
            url: `http://localhost:3000/api/proveedores/${idProveedor}`,
            method: 'GET',
            success: function(proveedor) {
                $('#edit-id-proveedor').val(proveedor.id_proveedores);
                $('#edit-nombre').val(proveedor.nombre);
                $('#edit-email').val(proveedor.email);
                $('#edit-telefono').val(proveedor.telefono);
                $('#edit-productos_id_producto').val(proveedor.productos_id_producto);
                $('#editModal').modal('show');
            },
            error: function(error) {
                alert('Error al cargar los datos del proveedor');
                console.error(error);
            }
        });
    });

    // Procesar la actualización del proveedor
    $('#editar-proveedor').submit(function(e) {
        e.preventDefault();

        const idProveedor = $('#edit-id-proveedor').val();
        const proveedorActualizado = {
            nombre: $('#edit-nombre').val(),
            email: $('#edit-email').val(),
            telefono: $('#edit-telefono').val(),
            productos_id_producto: $('#edit-productos_id_producto').val() // Capturar el ID del producto en la edición
        };

        $.ajax({
            url: `http://localhost:3000/api/proveedores/${idProveedor}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(proveedorActualizado),
            success: function() {
                alert('Proveedor actualizado con éxito');
                $('#editModal').modal('hide');
                cargarProveedores();
            },
            error: function(error) {
                alert(error.responseJSON.message || 'Error al actualizar el proveedor');
                console.error(error);
            }
        });
    });

    // Eliminar proveedor
    $(document).on('click', '.eliminar', function() {
        const idProveedor = $(this).data('id');

        if (confirm('¿Estás seguro de eliminar este proveedor?')) {
            $.ajax({
                url: `http://localhost:3000/api/proveedores/${idProveedor}`,
                method: 'DELETE',
                success: function() {
                    alert('Proveedor eliminado con éxito');
                    cargarProveedores();
                },
                error: function(error) {
                    alert('Error al eliminar el proveedor');
                    console.error(error);
                }
            });
        }
    });
});