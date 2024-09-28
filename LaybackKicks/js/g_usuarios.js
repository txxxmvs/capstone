$(document).ready(function() {
    cargarUsuarios();

    function cargarUsuarios() {
        $.ajax({
            url: 'http://localhost:3000/api/usuario',
            method: 'GET',
            success: function(usuarios) {
                let filas = '';
                usuarios.forEach(function(usuario) {
                    filas += `
                        <tr>
                            <td>${usuario.id_usuario}</td>
                            <td>${usuario.email}</td>
                            <td>${usuario.rol}</td>
                            <td>
                                <button class="btn btn-warning btn-sm editar" data-id="${usuario.id_usuario}">Enviar Correo</button>
                                <button class="btn btn-danger btn-sm eliminar" data-id="${usuario.id_usuario}">Eliminar</button>
                            </td>
                        </tr>
                    `;
                });
                $('#usuarios-list').html(filas);
            },
            error: function(error) {
                console.error('Error al cargar los usuarios', error);
            }
        });
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

        const nuevoUsuario = { email, contrasena, rol };

        $.ajax({
            url: 'http://localhost:3000/api/usuario',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(nuevoUsuario),
            success: function() {
                alert('Usuario agregado con éxito');
                cargarUsuarios();
                $('#usuario-form')[0].reset();
            },
            error: function(error) {
                alert('Error al agregar el usuario');
                console.error(error);
            }
        });
    });

    // Al hacer clic en el botón de editar, enviar un correo
    $(document).on('click', '.editar', function() {
        const idUsuario = $(this).data('id');
        
        $.ajax({
            url: `http://localhost:3000/api/usuario/${idUsuario}`,
            method: 'GET',
            success: function(usuario) {
                // Lógica para enviar el correo (se simula aquí, debes reemplazar con la lógica de envío de correo)
                alert(`Se ha enviado un correo a ${usuario.email} para el cambio de contraseña.`);
                // Aquí puedes realizar la llamada para enviar el correo a través del backend
            },
            error: function(error) {
                alert('Error al cargar los datos del usuario');
                console.error(error);
            }
        });
    });

    // Eliminar usuario
    $(document).on('click', '.eliminar', function() {
        const idUsuario = $(this).data('id');

        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            $.ajax({
                url: `http://localhost:3000/api/usuario/${idUsuario}`,
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
});