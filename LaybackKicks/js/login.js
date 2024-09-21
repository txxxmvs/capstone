$(document).ready(function() {
    $('#login-form').submit(function(e) {
        e.preventDefault();
        
        const username = $('#username').val();
        const password = $('#password').val();
        
        $.ajax({
            url: 'http://localhost:3000/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function(response) {
                alert('Login exitoso');
                window.location.href = '/pages/dashboard.html'; 
            },
            error: function(error) {
                alert('Error en el login: ' + error.responseJSON.message);
            }
        });
    });
});