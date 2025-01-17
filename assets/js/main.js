const apiUrl = 'https://mindicador.cl/api';
const selectMoneda = document.getElementById('moneda');
const resultado = document.getElementById('resultado');
const errorMensaje = document.getElementById('error');
let chartInstance = null;

async function cargarMonedas() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Error al obtener los datos de la API');
        }

        const data = await response.json();
        const monedas = Object.keys(data).filter(key => data[key].unidad_medida === 'Dólar' || key === 'uf' || data[key].unidad_medida === 'Pesos');

        const monedasAleatorias = monedas.sort(() => 0.5 - Math.random()).slice(0, 3);

        selectMoneda.innerHTML = '<option value="">Seleccione moneda</option>';
        monedasAleatorias.forEach(moneda => {
            const option = document.createElement('option');
            option.value = moneda;
            option.textContent = `${data[moneda].nombre} (${moneda.toUpperCase()})`;
            selectMoneda.appendChild(option);
        });
    } catch (error) {
        errorMensaje.textContent = error.message;
    }
} 

async function convertirMoneda() {
    try {
        const monto = parseFloat(document.getElementById('monto').value);
        const moneda = selectMoneda.value;

        if (isNaN(monto) || !moneda) {
            resultado.textContent = 'Por favor, ingrese un monto válido y seleccione una moneda.';
            return;
        }

        const response = await fetch(`${apiUrl}/${moneda}`);
        if (!response.ok) {
            throw new Error('Error al obtener los datos de la moneda seleccionada');
        }

        const data = await response.json();
        const tasaCambio = data.serie[0].valor;
        const montoConvertido = monto / tasaCambio;
        resultado.textContent = `Resultado: ${montoConvertido.toFixed(2)} ${data.nombre}`;

        mostrarGrafico(data);
    } catch (error) {
        errorMensaje.textContent = error.message;
    }
}

function mostrarGrafico(data) {
    const ctx = document.getElementById('exchangeChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    const etiquetas = data.serie.slice(0, 10).map(item => new Date(item.fecha).toLocaleDateString());
    const valores = data.serie.slice(0, 10).map(item => item.valor);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: [{
                label: `Tasa de cambio (${data.nombre})`,
                data: valores,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

cargarMonedas();