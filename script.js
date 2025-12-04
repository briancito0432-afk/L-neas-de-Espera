// Función auxiliar para calcular factoriales (necesaria para Erlang C)
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

// Algoritmo principal: Calcula una fila de la tabla
function calcularMMS(lam, mu, s, cs, cw) {
    // 1. Utilización
    let rho = lam / (s * mu);

    // Si el sistema no da abasto, retornamos null
    if (rho >= 1) return null;

    // 2. Calcular P0 (Probabilidad de vacío) - Fórmula compleja
    let sumatoria = 0;
    for (let n = 0; n < s; n++) {
        sumatoria += Math.pow(lam / mu, n) / factorial(n);
    }
    let terminoCola = Math.pow(lam / mu, s) / (factorial(s) * (1 - rho));
    let p0 = 1 / (sumatoria + terminoCola);

    // 3. Calcular Lq (Longitud promedio de la cola)
    let lq = (p0 * Math.pow(lam / mu, s) * rho) / (factorial(s) * Math.pow(1 - rho, 2));

    // 4. Calcular Ls (Longitud promedio en el sistema = Cola + Servicio)
    let ls = lq + (lam / mu);

    // 5. Calcular Wq (Tiempo promedio en cola)
    let wq = lq / lam;

    // 6. Calcular Costos
    let costoServicioTotal = s * cs;
    let costoEsperaTotal = ls * cw; // Usamos Ls porque el cliente cuesta desde que llega
    let costoTotal = costoServicioTotal + costoEsperaTotal;

    return {
        s: s,
        rho: (rho * 100).toFixed(1) + "%",
        lq: lq.toFixed(2),
        wq: (wq * 60).toFixed(2) + " min", // Convertimos horas a minutos para que se entienda mejor
        costoTotal: costoTotal.toFixed(2),
        valorCosto: costoTotal // Valor numérico para comparar
    };
}

function generarEscenarios() {
    // Obtener valores del HTML
    let lambda = parseFloat(document.getElementById('lambda').value);
    let mu = parseFloat(document.getElementById('mu').value);
    let cs = parseFloat(document.getElementById('costServer').value);
    let cw = parseFloat(document.getElementById('costWait').value);

    if (!lambda || !mu || !cs || !cw) {
        alert("Por favor llena todos los campos numéricos.");
        return;
    }

    // Limpiar tabla previa
    let tbody = document.querySelector("#tablaResultados tbody");
    tbody.innerHTML = "";

    // Variables para encontrar el ganador
    let minCosto = Infinity;
    let mejorS = 0;
    let resultados = [];

    // Definir cuántos servidores probar
    // Empezamos con el mínimo necesario (Entero superior de Lambda/Mu)
    let sMin = Math.floor(lambda / mu) + 1;
    let sMax = sMin + 4; // Probamos 5 escenarios en total

    // Bucle de cálculo
    for (let s = sMin; s <= sMax; s++) {
        let datos = calcularMMS(lambda, mu, s, cs, cw);
        if (datos) {
            resultados.push(datos);
            // Checar si es el más barato hasta ahora
            if (parseFloat(datos.valorCosto) < minCosto) {
                minCosto = parseFloat(datos.valorCosto);
                mejorS = s;
            }
        }
    }

    // Renderizar (Dibujar) la tabla
    resultados.forEach(dato => {
        let fila = document.createElement("tr");

        // Si es el ganador, le ponemos la clase especial
        if (dato.s === mejorS) {
            fila.classList.add("winner-row");
        }

        fila.innerHTML = `
            <td>${dato.s}</td>
            <td>${dato.rho}</td>
            <td>${dato.lq}</td>
            <td>${dato.wq}</td>
            <td>$${dato.costoTotal}</td>
        `;
        tbody.appendChild(fila);
    });

    // Mostrar el bloque de resultados y conclusión
    document.getElementById("output").style.display = "block";
    document.getElementById("conclusionText").innerHTML = `
        <strong>Decisión Óptima:</strong><br>
        Para minimizar los costos totales, la empresa debería contratar <strong>${mejorS} servidores</strong>.<br>
        Esto resulta en un costo total de <strong>$${minCosto.toFixed(2)}/hora</strong>.
    `;
}