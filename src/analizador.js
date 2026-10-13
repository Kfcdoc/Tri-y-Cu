// Precedencia de operadores ('neg' es el menos unario)
const PRECEDENCIA = { '+': 1, '-': 1, '*': 2, '/': 2, neg: 3, '^': 4 };

const esNumero = (token) => /^\d+(\.\d+)?$/.test(token);

// 1. Convierte el texto en una lista de tokens
const tokenizar = (texto) => {
  const tokens = texto.match(/\d+(\.\d+)?|\S/g);
  if (!tokens) throw new Error('Escribe una expresión');

  const salida = [];

  tokens.forEach((token) => {
    if (!esNumero(token) && !/^[-+*/^()]$/.test(token)) {
      throw new Error(`Carácter no válido: "${token}"`);
    }
    const previo = salida[salida.length - 1];
    const esInicio = previo === undefined || previo === '(' || previo in PRECEDENCIA;
    salida.push(token === '-' && esInicio ? 'neg' : token);
  });

  return salida;
};

// 2. Convierte los tokens a notación postfija (algoritmo Shunting Yard)
const aPostfijo = (tokens) => {
  const salida = [];
  const pila = [];

  tokens.forEach((token) => {
    if (esNumero(token)) {
      salida.push(token);
    } else if (token === '(' || token === 'neg') {
      pila.push(token);
    } else if (token === ')') {
      while (pila.length && pila[pila.length - 1] !== '(') salida.push(pila.pop());
      if (!pila.length) throw new Error('Paréntesis sin abrir');
      pila.pop();
    } else {
      while (pila.length) {
        const tope = pila[pila.length - 1];
        const sale = tope !== '(' && (PRECEDENCIA[tope] > PRECEDENCIA[token] ||
          (PRECEDENCIA[tope] === PRECEDENCIA[token] && token !== '^'));
        if (!sale) break;
        salida.push(pila.pop());
      }
      pila.push(token);
    }
  });

  while (pila.length) {
    const op = pila.pop();
    if (op === '(') throw new Error('Paréntesis sin cerrar');
    salida.push(op);
  }
  return salida;
};

// 3. Calcula el valor de una operación
const operar = (op, a, b) => {
  if (op === '/' && b === 0) throw new Error('No se puede dividir entre cero');
  return { '+': a + b, '-': a - b, '*': a * b, '/': a / b, '^': a ** b, neg: -b }[op];
};

// 4. Genera cuádruplos, triplos y resultado desde el postfijo
const generar = (postfijo) => {
  const pila = [];
  const cuadruplos = [];
  const triplos = [];

  postfijo.forEach((token) => {
    if (esNumero(token)) {
      pila.push({ cuadruplo: token, triplo: token, valor: parseFloat(token) });
      return;
    }

    const unario = token === 'neg';
    const b = pila.pop();
    const a = unario ? null : pila.pop();
    if (!b || (!unario && !a)) throw new Error('Expresión incompleta');

    const n = cuadruplos.length + 1;
    const op = unario ? '-' : token;
    const arg1 = unario ? b : a;
    const arg2 = unario ? null : b;

    cuadruplos.push([op, arg1.cuadruplo, arg2 ? arg2.cuadruplo : '_', `T${n}`]);
    triplos.push([`(${n})`, op, arg1.triplo, arg2 ? arg2.triplo : '_']);

    pila.push({
      cuadruplo: `T${n}`,
      triplo: `(${n})`,
      valor: operar(token, a ? a.valor : 0, b.valor),
    });
  });

  if (pila.length !== 1) throw new Error('Expresión inválida');
  return { cuadruplos, triplos, resultado: Number(pila[0].valor.toFixed(6)) };
};

// Función principal: texto -> { cuadruplos, triplos, resultado }
export const analizar = (texto) => generar(aPostfijo(tokenizar(texto)));
