$(document).ready(function() {
    cargarUsuarios();

    function cargarUsuarios() {
        $.ajax({
            url: 'http://localhost:3000/api/usuarios',
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

    // Al hacer clic en el botón de editar, enviar un correo
    $(document).on('click', '.editar', function() {
        const idUsuario = $(this).data('id');
        
        $.ajax({
            url: `http://localhost:3000/api/usuarios/${idUsuario}`,
            method: 'GET',
            success: function(usuario) {
                alert(`Se ha enviado un correo a ${usuario.email} para el cambio de contraseña.`);
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
});