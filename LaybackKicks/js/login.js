$('#login-form').submit(function(event) {
    event.preventDefault();
    
    const username = $('#username').val();
    const password = $('#password').val();

    $.ajax({
        url: 'http://localhost:3000/api/autenticacion/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password }),
        success: function(response) {
            alert('Login exitoso');
            window.location.href = '/pages/dashboard.html';
        },
        error: function(error) {
            alert(error.responseJSON.message); 
        }
    });
});