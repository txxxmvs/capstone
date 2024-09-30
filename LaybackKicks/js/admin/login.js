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
            if (response.rol === 'admin') {
                window.location.href = '/pages/admin/dashboard.html'; 
            } else if (response.rol === 'vendedor') {
                window.location.href = '/pages/vendedor/v_stock.html';
            }
        },
        error: function(error) {
            alert(error.responseJSON.message); 
        }
    });
});