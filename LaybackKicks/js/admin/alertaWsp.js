async function enviarAlertaWsp() {
    try {
        const response = await fetch('http://localhost:3000/api/enviar-alerta-wsp', { method: 'GET' });
        const data = await response.json();
        alert(data.message || "Alertas enviadas correctamente.");
    } catch (error) {
        console.error('Error al enviar la alerta:', error);
        alert('Hubo un error al enviar las alertas de WhatsApp.');
    }
}

// Asignar la función al botón en el dashboard
document.getElementById('enviar-alerta-btn').addEventListener('click', enviarAlertaWsp);