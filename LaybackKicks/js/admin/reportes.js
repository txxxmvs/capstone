document.getElementById('report-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const tipoReporte = document.getElementById('tipo-reporte').value;
  const periodo = document.getElementById('periodo').value;

  fetch(`http://localhost:3000/api/reportes/${tipoReporte}?periodo=${periodo}`)
    .then(response => response.json())
    .then(data => {
      // Definir estilo CSS para aplicar tanto en pantalla como en el PDF
      const cssStyles = `
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      `;

      let htmlContent = `${cssStyles}<table class="table table-bordered text-center"><thead><tr>`;

      if (tipoReporte === 'vendidos') {
        htmlContent += `<th>ID Venta</th><th>ID Usuario</th><th>ID Producto</th><th>Fecha Venta</th><th>Cantidad</th><th>Precio Venta Real</th><th>Precio Compra</th><th>Fecha de Compra</th>`;
      } else {
        htmlContent += `<th>ID Producto</th><th>Marca</th><th>Modelo</th><th>Talla</th><th>Condición</th><th>Precio Compra</th><th>Precio Estimado Venta</th><th>Fecha de Compra</th><th>Cantidad</th><th>Vendido</th>`;
      }

      htmlContent += `</tr></thead><tbody>`;

      data.forEach(row => {
        htmlContent += `<tr>`;
        for (let key in row) {
          if (key.includes('fecha')) {
            // Formatear las fechas
            htmlContent += `<td>${new Date(row[key]).toISOString().split('T')[0]}</td>`;
          } else if (key.includes('precio')) {
            // Agregar símbolo "$" a los precios
            htmlContent += `<td>$${row[key]}</td>`;
          } else {
            htmlContent += `<td>${row[key]}</td>`;
          }
        }
        htmlContent += `</tr>`;
      });

      htmlContent += `</tbody></table>`;

      // Mostrar el reporte en pantalla y mantenerlo visible
      document.getElementById('report-result').innerHTML = htmlContent;
      document.getElementById('report-result').style.maxHeight = '400px'; 
      document.getElementById('report-result').style.overflow = 'auto';    
      // Ahora, se generará el PDF sin eliminar la vista del reporte
      const currentDate = new Date();
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();

      // Crear un botón para generar el PDF solo después de mostrar el reporte en pantalla
      const generatePDFButton = document.createElement('button');
      generatePDFButton.innerText = 'Descargar PDF';
      generatePDFButton.classList.add('btn', 'btn-secondary', 'mt-3');
      generatePDFButton.onclick = function() {
        fetch('http://localhost:3000/api/reportes/generar-pdf', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              html: htmlContent,  // HTML con estilo incluido
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
      };

      // Añadir el botón de descargar PDF debajo del reporte
      document.getElementById('report-result').appendChild(generatePDFButton);
    })
    .catch(error => console.error('Error al obtener el reporte:', error));
});