// Registrar el plugin de datalabels si está cargado en el HTML
if (typeof ChartDataLabels !== 'undefined') {
  Chart.register(ChartDataLabels);
}

document.addEventListener("DOMContentLoaded", function () {
  // 1. Gráfico de Rendimiento de Ganancias (Barras Apiladas Verticales)
  const ctxGain = document.getElementById('gainChart');
  if (ctxGain) {
    new Chart(ctxGain.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
          // Segmento inferior: Aporte No Tecnológico
          {
            label: 'Aporte no tecnológico',
            data: [8.0, 9.0, 9.5, 12.0, 13.5, 15.0, 13.8, 15.5, 16.2, 17.0, 17.8, 19.83],
            backgroundColor: '#163A2B', // Verde oscuro principal
            borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 },
            barPercentage: 0.6,
            categoryPercentage: 0.8
          },
          // Segmento superior: Aporte Tecnológico
          {
            label: 'Aporte tecnológico',
            data: [4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.2, 7.5, 7.8, 8.0, 8.2, 8.62],
            backgroundColor: '#86CEAB', // Verde menta brillante
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true // Apila los segmentos horizontalmente sobre el eje X
          },
          y: {
            stacked: true, // Apila los segmentos verticalmente sobre el eje Y
            beginAtZero: true,
            ticks: {
              callback: function(value) { return '$' + value + 'M'; }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { size: 12 }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: $${context.raw}M`;
              },
              footer: function(tooltipItems) {
                let total = 0;
                tooltipItems.forEach(function(item) {
                  total += item.raw;
                });
                return 'Ganancia Total: $' + total.toFixed(2) + 'M';
              }
            }
          },
          // Muestra las etiquetas numéricas dentro de cada segmento de barra
          datalabels: {
            color: function(context) {
              return context.datasetIndex === 0 ? '#FFFFFF' : '#163A2B';
            },
            font: {
              weight: 'bold',
              size: 9
            },
            formatter: function(value) {
              return '$' + value.toFixed(1) + 'M';
            }
          }
        }
      }
    });
  }

  // 2. Gráfico de Impacto Tecnológico (Dona / ROI)
  const ctxImpact = document.getElementById('impactChart');
  if (ctxImpact) {
    new Chart(ctxImpact.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Inversión Retornada', 'Optimización Pendiente'],
        datasets: [{
          data: [3.4, 1.6],
          backgroundColor: ['#163A2B', '#E8F5EE'],
          borderWidth: 0
        }]
      },
      options: {
        rotation: -90,
        circumference: 180,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false }
        }
      }
    });
  }
});