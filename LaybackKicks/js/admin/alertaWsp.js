async function enviarAlertaSms() {
    try {
        const response = await fetch('http://localhost:3000/api/enviar-alerta-sms', { method: 'GET' });
        const data = await response.json();
        alert(data.message || "Alertas enviadas correctamente por SMS.");
    } catch (error) {
        console.error('Error al enviar la alerta:', error);
        alert('Hubo un error al enviar las alertas de SMS.');
    }
}

document.getElementById('enviar-alerta-btn').addEventListener('click', enviarAlertaSms);

function guardarConfiguracion(event) {
    event.preventDefault();

    const telefono = document.getElementById('telefono').value;
    const meses = document.getElementById('meses').value;

    // Guardamos la configuración en el local storage
    localStorage.setItem('configTelefono', telefono);
    localStorage.setItem('configMeses', meses);

    // Verificamos que se haya guardado correctamente
    console.log("Número guardado:", localStorage.getItem('configTelefono'));
    console.log("Meses guardados:", localStorage.getItem('configMeses'));

    alert("Configuración guardada correctamente.");

    // Programar la alerta automática
    programarAlertaAutomatica();
}

