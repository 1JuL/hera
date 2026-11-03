document.addEventListener("DOMContentLoaded", function () {
  // 1. Gráfico de Rendimiento de ganancias (Barras Comparativas)[cite: 6]
  const ctxGain = document.getElementById('gainChart').getContext('2d');
  new Chart(ctxGain, {
    type: 'bar',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: 'Ganancia total',
          data: [12, 14, 15, 18, 20, 22, 21, 23, 24, 25, 26, 28.45],
          backgroundColor: '#163A2B'
        },
        {
          label: 'Aporte tecnológico',
          data: [4, 5, 5.5, 6, 6.5, 7, 7.2, 7.5, 7.8, 8, 8.2, 8.62],
          backgroundColor: '#86CEAB'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } }
    }
  });

  // 2. Gráfico de Impacto Tecnológico (Dona / Semicírculo)[cite: 6]
  const ctxImpact = document.getElementById('impactChart').getContext('2d');
  new Chart(ctxImpact, {
    type: 'doughnut',
    data: {
      labels: ['Inversión Retornada', 'Pendiente'],
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
      plugins: { legend: { display: false } }
    }
  });
});