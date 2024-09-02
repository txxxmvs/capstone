$(document).ready(function() {
    $.ajax({
        url: 'http://localhost:3000/api/dashboard',
        method: 'GET',
        success: function(data) {
            $('#monto-invertido').text(data.montoInvertido);
            $('#posible-retorno').text(data.posibleRetorno);
        },
        error: function(error) {
            console.error('Error al cargar los datos del dashboard', error);
        }
    });
});