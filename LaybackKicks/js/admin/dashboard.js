$(document).ready(function() {
    const currentYear = new Date().getFullYear();
    const yearSelect = $('#year-select');
    
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
        yearSelect.append(new Option(year, year));
    }

    $('#year-select').val(currentYear);

    function cargarDatosDashboard(mes, año) {
        $.ajax({
            url: `http://localhost:3000/api/dashboard?mes=${mes}&año=${año}`,
            method: 'GET',
            success: function(data) {
                $('#monto-invertido').text(data.montoInvertido.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));
                $('#posible-retorno').text(data.posibleRetorno.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));
                $('#total-ventas').text(data.totalVentas.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));
            },
            error: function(error) {
                console.error('Error al cargar los datos del dashboard', error);
            }
        });
    }

    const currentMonth = new Date().getMonth() + 1;
    cargarDatosDashboard(currentMonth, currentYear);

    $('#filter-button').click(function() {
        const mes = $('#month-select').val();
        const año = $('#year-select').val();
        cargarDatosDashboard(mes, año);
    });
});