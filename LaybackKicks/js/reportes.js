document.getElementById('report-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const tipoReporte = document.getElementById('tipo-reporte').value;
  const periodo = document.getElementById('periodo').value;

  fetch(`http://localhost:3000/api/reportes/${tipoReporte}?periodo=${periodo}`)
    .then(response => response.json())
    .then(data => {
      let htmlContent = `<table class="table table-striped"><thead><tr>`;

      if (tipoReporte === 'vendidos') {
        htmlContent += `<th>ID Venta</th><th>ID Usuario</th><th>ID Producto</th><th>Fecha Venta</th><th>Cantidad</th><th>Precio Venta Real</th><th>Precio Compra</th><th>Fecha de Compra</th>`;
      } else {
        htmlContent += `<th>ID Producto</th><th>Marca</th><th>Modelo</th><th>Talla</th><th>Condición</th><th>Precio Compra</th><th>Precio Estimado Venta</th><th>Fecha de Compra</th><th>Cantidad</th><th>Vendido</th>`;
      }

      htmlContent += `</tr></thead><tbody>`;

      data.forEach(row => {
        htmlContent += `<tr>`;
        for (let key in row) {
          htmlContent += `<td>${row[key]}</td>`;
        }
        htmlContent += `</tr>`;
      });

      htmlContent += `</tbody></table>`;
      document.getElementById('report-result').innerHTML = htmlContent;

      const currentDate = new Date();
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();

      fetch('http://localhost:3000/api/reportes/generar-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            html: htmlContent,
            nombreArchivo: `${tipoReporte}_${month}_${year}.pdf`
        })
      })    
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tipoReporte}_${month}_${year}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(error => console.error('Error al generar el PDF:', error));
    })
    .catch(error => console.error('Error al obtener el reporte:', error));
});