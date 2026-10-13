import { analizar } from '../src/analizador.js';

const entrada = document.getElementById('expresion');
const alerta = document.getElementById('alerta');
const resultados = document.getElementById('resultados');

// Arma una tabla HTML con encabezados y filas
const crearTabla = (encabezados, filas) => `
  <table>
    <tr>${encabezados.map((h) => `<th>${h}</th>`).join('')}</tr>
    ${filas.map((f) => `<tr>${f.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}
  </table>`;

const mostrarAlerta = (mensaje) => {
  alerta.textContent = mensaje;
  alerta.classList.remove('oculto');
  resultados.classList.add('oculto');
};

const calcular = () => {
  alerta.classList.add('oculto');
  try {
    const { cuadruplos, triplos, resultado } = analizar(entrada.value);

    document.getElementById('cuadruplos').innerHTML =
      crearTabla(['Operador', 'Argumento 1', 'Argumento 2', 'Resultado'], cuadruplos);
    document.getElementById('triplos').innerHTML =
      crearTabla(['#', 'Operador', 'Argumento 1', 'Argumento 2'], triplos);
    document.getElementById('resultado').textContent = `${entrada.value} = ${resultado}`;

    resultados.classList.remove('oculto');
  } catch (error) {
    mostrarAlerta(error.message);
  }
};

const limpiar = () => {
  entrada.value = '';
  alerta.classList.add('oculto');
  resultados.classList.add('oculto');
  entrada.focus();
};

document.getElementById('btnCalcular').addEventListener('click', calcular);
document.getElementById('btnLimpiar').addEventListener('click', limpiar);
entrada.addEventListener('keydown', (e) => e.key === 'Enter' && calcular());
