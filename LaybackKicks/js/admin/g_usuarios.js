$(document).ready(function () {
    cargarUsuarios();

    function cargarUsuarios() {
        $.ajax({
            url: 'http://localhost:3000/api/usuarios',
            method: 'GET',
            success: function (usuarios) {
                let filas = '';
                usuarios.forEach(function (usuario) {
                    filas += `
                        <tr>
                            <td>${usuario.id_usuario}</td>
                            <td>${usuario.email}</td>
                            <td>${usuario.rol}</td>
                            <td>
                                <button class="btn btn-warning btn-sm cambiar-contraseña" data-id="${usuario.id_usuario}">Cambiar Contraseña</button>
                                <button class="btn btn-danger btn-sm eliminar" data-id="${usuario.id_usuario}">Eliminar</button>
                                <select class="form-select form-select-sm rol-selector" data-id="${usuario.id_usuario}" style="width: auto; display: inline-block;">
                                    <option value="admin" ${usuario.rol === 'admin' ? 'selected' : ''}>Admin</option>
                                    <option value="vendedor" ${usuario.rol === 'vendedor' ? 'selected' : ''}>Vendedor</option>
                                </select>
                                <button class="btn btn-primary btn-sm guardar-rol" data-id="${usuario.id_usuario}" style="display: inline-block;">Guardar</button>
                            </td>
                        </tr>
                    `;
                });
                $('#usuarios-list').html(filas);
            },
            error: function (error) {
                console.error('Error al cargar los usuarios', error);
            }
        });
    }

    // Mostrar modal para cambiar contraseña
    $(document).on('click', '.cambiar-contraseña', function () {
        const idUsuario = $(this).data('id');
        $('#modalCambiarContrasena').modal('show');

        // Configurar el botón de confirmar cambio de contraseña
        $('#confirmarCambioContrasena').off('click').on('click', function () {
            const nuevaContrasena = $('#nuevaContrasena').val();
            const repetirContrasena = $('#repetirContrasena').val();

            // Verificar si las contraseñas coinciden
            if (nuevaContrasena !== repetirContrasena) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            // Realizar la solicitud para cambiar la contraseña usando la segunda contraseña
            $.ajax({
                url: `http://localhost:3000/api/usuarios/cambiar_contrasena/${idUsuario}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ nuevaContrasena: repetirContrasena }),
                success: function (response) {
                    alert(response.message);
                    $('#modalCambiarContrasena').modal('hide');
                },
                error: function (xhr, status, error) {
                    alert('Error al cambiar la contraseña.');
                }
            });
        });
    });

    // Función para verificar si el email es válido
    function esEmailValido(email) {
        const regex = /^[^\s@]+@(gmail\.com|hotmail\.com|outlook\.com)$/;
        return regex.test(email);
    }    

    // Procesar el formulario de nuevo usuario
    $('#usuario-form').submit(function(e) {
        e.preventDefault();

        const email = $('#email').val().trim();
        const contrasena = $('#contrasena').val().trim();
        const rol = $('#rol').val().trim();

        if (!email || !contrasena || !rol) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        if (!esEmailValido(email)) {
            alert('Por favor, introduce un email válido.');
            return;
        }

        const nuevoUsuario = { email, contrasena, rol };

        $.ajax({
            url: 'http://localhost:3000/api/usuarios',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(nuevoUsuario),
            success: function() {
                alert('Usuario agregado con éxito');
                cargarUsuarios();
                $('#usuario-form')[0].reset();
            },
            error: function(xhr) {
                if (xhr.status === 400) {
                    alert('Error: El email ya está registrado.');
                } else {
                    alert('Error al agregar el usuario.');
                }
            }
        });
    });

    // Eliminar usuario
    $(document).on('click', '.eliminar', function() {
        const idUsuario = $(this).data('id');

        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            $.ajax({
                url: `http://localhost:3000/api/usuarios/${idUsuario}`,
                method: 'DELETE',
                success: function() {
                    alert('Usuario eliminado con éxito');
                    cargarUsuarios();
                },
                error: function(error) {
                    alert('Error al eliminar el usuario');
                    console.error(error);
                }
            });
        }
    });

    // Actualizar el rol del usuario
    $(document).on('click', '.guardar-rol', function () {
        const idUsuario = $(this).data('id');
        const nuevoRol = $(this).siblings('.rol-selector').val(); // Obtener el valor seleccionado del rol

        $.ajax({
            url: `http://localhost:3000/api/usuarios/${idUsuario}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ rol: nuevoRol }),
            success: function (response) {
                alert('Rol del usuario actualizado con éxito');
                cargarUsuarios(); // Recargar la lista de usuarios después de actualizar
            },
            error: function (xhr, status, error) {
                alert('Error al actualizar el rol del usuario.');
            }
        });
    });

});