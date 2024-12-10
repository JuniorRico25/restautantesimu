// Variables globales
const canvas = document.getElementById('restaurantCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1600; 
canvas.height = 900;
let maxQueueSize = 5;  // Límite inicial de la cola de espera
let newWaitingQueue = [];  // Cola de espera
let dynamicQueueSize = maxQueueSize;  // Tamaño dinámico de la cola
let simulationTimer = null; // Cronómetro
let elapsedSimulationTime = 0; // Tiempo transcurrido en segundos
let simulationTimeDisplay = null; // Elemento HTML para mostrar el tiempo

function addClientToQueue(client) {
    if (newWaitingQueue.length < maxQueueSize) {
        newWaitingQueue.push(client);
    } else {
        console.log('La cola está llena.');
    }
}
function initializeTimeDisplay() {
    simulationTimeDisplay = document.createElement('div');
    simulationTimeDisplay.className = 'chat-message bot';
    simulationTimeDisplay.innerHTML = `
        <img alt="Bot avatar" class="avatar rounded-full" height="40" 
             src="https://storage.googleapis.com/a1aa/image/OPj731aUdJ5LLB2infp1i40mPlaqZ3NyJtqumu7ITTCBmr8JA.jpg" width="40"/>
        <div class="message">
            <p class="text-lg">
                <strong>Tiempo total simulado:</strong> 0.00 segundos
            </p>
        </div>
    `;
    reportDiv.prepend(simulationTimeDisplay);
}

function startTimer() {
    console.log("Cronómetro iniciado");
    simulationStartTime = performance.now() / 1000;
    simulationTimer = setInterval(() => {
        elapsedSimulationTime = performance.now() / 1000 - simulationStartTime;
        console.log(`Tiempo transcurrido: ${elapsedSimulationTime.toFixed(2)} segundos`);
        updateSimulationTimeDisplay();
    }, 100);
}


function stopTimer() {
    clearInterval(simulationTimer); // Detener la actualización del cronómetro
    simulationTimer = null;
    updateSimulationTimeDisplay(); // Actualizar por última vez al detener
}

function updateSimulationTimeDisplay() {
    console.log("Actualizando tiempo en pantalla...");
    if (simulationTimeDisplay) {
        const totalSeconds = Math.floor(elapsedSimulationTime);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        simulationTimeDisplay.querySelector('.message p').innerHTML = `
            <strong>Tiempo total simulado:</strong> ${minutes} minutos y ${seconds} segundos
        `;
    } else {
        console.error("simulationTimeDisplay no está inicializado");
    }
}



// Ajustar el tamaño de la cola dinámicamente basado en las mesas libres
function adjustQueueSize() {
    let availableTables = newTables.filter(table => !table.isOccupied).length;
    maxQueueSize = Math.min(5, availableTables + 2);  // Ajuste dinámico
    console.log(`Nuevo tamaño de la cola: ${maxQueueSize}`);
}

// Modificar la función para agregar clientes a la cola
function addClientToQueue(client) {
    adjustQueueSize();  // Llamar para ajustar el tamaño de la cola
    if (newWaitingQueue.length < maxQueueSize) {
        newWaitingQueue.push(client);
        console.log(`Cliente ${client.id} agregado a la cola. Total en espera: ${newWaitingQueue.length}`);
    } else {
        console.log(`La cola está llena. Cliente ${client.id} rechazado.`);
    }
}

function processQueue() {
    if (newWaitingQueue.length > 0) {  // Si hay clientes en la cola
        let client = newWaitingQueue.shift();  // El primer cliente en la cola
        console.log(`Cliente ${client.id} movido de la cola a una mesa.`);
        assignClientToTable(client);  // Asignar al cliente a una mesa disponible
    }
}


// Liberar mesa y mover cliente de la cola a la mesa
function freeTable(tableId) {
    let table = newTables.find(t => t.id === tableId);
    if (table) {
        table.isOccupied = false;  // Liberar la mesa
        table.assignedClient = null;
        console.log(`Mesa ${tableId} liberada.`);

        // Procesar la cola y asignar un cliente
        processQueue();
    }
}

function simulateClientArrival() {
    totalClients++;
    let newClient = {
        id: totalClients,
        arrivalTime: new Date().toISOString(),
        eatingTime: Math.floor(Math.random() * (10 - 5 + 1)) + 5,  // Tiempo aleatorio de comida entre 5 y 10 segundos
    };

    console.log(`Nuevo cliente llegó: ${newClient.id} | Tiempo de comida: ${newClient.eatingTime}s`);

    // Intentar asignar el cliente a una mesa
    if (!assignClientToTable(newClient)) {
        addClientToQueue(newClient);  // Si no hay mesas, agregarlo a la cola
    }
}

function assignClientToTable(client) {
    for (let i = 0; i < newTables.length; i++) {
        if (!newTables[i].isOccupied) {  // Si la mesa está libre
            newTables[i].isOccupied = true;
            newTables[i].assignedClient = client;  // Asignar cliente a la mesa
            console.log(`Cliente ${client.id} asignado a la mesa ${newTables[i].id}`);
            startEating(client, newTables[i].id);  // Iniciar el tiempo de comida
            return true;  // Cliente asignado con éxito
        }
    }
    return false;  // No hay mesas disponibles
}

// Áreas del restaurante
let kitchenArea = { x: 100, y: 500, width: 320, height: 300 };
let barArea = { x: 636, y: 332, width: 350, height: 30 };
let waitingArea = { x: 450, y: 120, width: 700, height: 150, maxCapacity: Infinity };
let tableArea = { x: 530, y: 390, width: 700, height: 300 };

// Puntos de entrada y salida
const entryPoint = { x: 1480, y: 220 };
const exitPoint = { x: 1480, y: 220 }; // Misma puerta para entrada y salida

// Definición de rutas con waypoints en forma de Y
const mainRoute = [
    {x: 1480, y: 220}, // Puerta de entrada
    {x: 1250, y: 200}  // Punto de ramificación
];

const waitingRoute = [
    {x: 1250, y: 200}
];

const tablesRoute = [
    {x: 1250, y: 200}, // Punto de ramificación
    {x: 1250, y: 380}, // Ruta hacia mesas
    {x: 970, y: 380}    // Punto cercano a las mesas (puedes ajustar según la disposición)
];

// Ruta de salida (mismo camino que entrada)
const exitRoute = [
    {x: 1350, y: 550},   // Punto cercano a las mesas
    {x: 1350, y: 420},   // Regreso hacia punto de ramificación
    {x: 1350, y: 300},   // Punto de ramificación
    {x: 1480, y: 300}    // Puerta de salida
];

// Estados de la simulación
let numTables = 10;
let tables = [];
let lambda = 1; 
let mu = 0.5;   
let queueType = "unlimited";
let queueLimit = 10;

let simulationRunning = false;
let simulationStartTime = null;

// Clientes
let clients = [];       
let outsideQueue = [];
let systemTime = 0;      
let nextArrivalTime = 0; 

// Métricas
let totalArrivals = 0;
let lostArrivals = 0;
let servedClients = 0;

let totalWaitInQueue = 0;
let totalTimeInSystem = 0;

// Integradores para L, Lq
let lastEventTime = 0;
let areaUnderL = 0;  
let areaUnderLq = 0; 

// Distribución de estados
let maxStateTracking = 50;
let stateTime = new Array(maxStateTracking).fill(0);

// Reporte
// Inicializar el elemento de tiempo en el reporte
function initializeTimeDisplay() {
    simulationTimeDisplay = document.createElement('div');
    simulationTimeDisplay.className = 'chat-message bot';
    simulationTimeDisplay.innerHTML = `
        <img alt="Bot avatar" class="avatar rounded-full" height="40" 
             src="https://storage.googleapis.com/a1aa/image/OPj731aUdJ5LLB2infp1i40mPlaqZ3NyJtqumu7ITTCBmr8JA.jpg" width="40"/>
        <div class="message">
            <p class="text-lg">
                <strong>Tiempo total simulado:</strong> 0.00 segundos
            </p>
        </div>
    `;
    reportDiv.prepend(simulationTimeDisplay);
}
const reportDiv = document.getElementById('report');

// Imagen de fondo
const backgroundImage = new Image();
backgroundImage.src = 'assets/FondoCanvas.jpg'; 
let backgroundLoaded = false;
backgroundImage.onload = () => {
    backgroundLoaded = true;
};

// Botones
document.getElementById('startBtn').addEventListener('click', startSimulation);
document.getElementById('stopBtn').addEventListener('click', stopSimulation);

// Función para iniciar la simulación
function startSimulation() {
    if (simulationRunning) return;

    // Configuración inicial
    numTables = parseInt(document.getElementById('numTables').value);
    queueType = document.getElementById('queueType').value;
    queueLimit = parseInt(document.getElementById('queueLimit').value);
    lambda = parseFloat(document.getElementById('lambda').value);
    mu = parseFloat(document.getElementById('mu').value);

    // Validaciones
    if (isNaN(numTables) || numTables < 4 || numTables > 10) {
        alert("Número de mesas debe ser un entero entre 4 y 10.");
        return;
    }
    if (queueType === "limited" && (isNaN(queueLimit) || queueLimit < 0)) {
        alert("El límite de cola debe ser un número no negativo.");
        return;
    }
    if (isNaN(lambda) || lambda <= 0) {
        alert("Lambda debe ser un número positivo.");
        return;
    }
    if (isNaN(mu) || mu <= 0) {
        alert("Mu debe ser un número positivo.");
        return;
    }

    // Inicializar tiempo simulado y cronómetro
    initializeTimeDisplay();
    startTimer();

    // Crear mesas
    createTables();

    // Configurar simulación
    simulationRunning = true;
    simulationStartTime = performance.now() / 1000;
    systemTime = 0;
    nextArrivalTime = systemTime + expDist(lambda);

    totalArrivals = 0;
    lostArrivals = 0;
    servedClients = 0;

    totalWaitInQueue = 0;
    totalTimeInSystem = 0;
    lastEventTime = 0;
    areaUnderL = 0;
    areaUnderLq = 0;
    stateTime.fill(0);

    reportDiv.style.display = 'none';
    reportDiv.innerHTML = '';

    animate();
    scheduleNextEvent();
}



// Función para detener la simulación
function stopSimulation() {
    if (!simulationRunning) return;

    // Detener cronómetro
    stopTimer();

    simulationRunning = false;

    // Mostrar reporte
    reportDiv.style.display = 'block';

    // Cálculo de métricas
    const totalTime = systemTime; // Tiempo en segundos
    const totalMinutes = Math.floor(totalTime / 60);
    const totalSeconds = Math.floor(totalTime % 60);

    updateAreaUnderCurves();

    const avgServiceTime = 1 / mu;
    const totalServiceTimeProvided = servedClients * avgServiceTime;
    const factorUtilizacion = totalTime > 0 ? ((totalServiceTimeProvided / totalTime) / (numTables * 4)) : 0;

    const Wq = servedClients > 0 ? (totalWaitInQueue / servedClients) / TIME_SCALE : 0;
    const W = servedClients > 0 ? (totalTimeInSystem / servedClients) / TIME_SCALE : 0;
    const Lq = totalTime > 0 ? (areaUnderLq / totalTime) : 0;
    const L = totalTime > 0 ? (areaUnderL / totalTime) : 0;

    let html = `<h2>Reporte de Simulación</h2>`;
    html += `<p>Tiempo total simulado: ${totalMinutes} minutos y ${totalSeconds} segundos</p>`;
    html += `<p>Factor de Utilización: ${factorUtilizacion.toFixed(4)}</p>`;
    html += `<p>Tiempo promedio en cola (Wq): ${(Wq / 60).toFixed(4)} horas</p>`;
    html += `<p>Tiempo promedio en sistema (W): ${(W / 60).toFixed(4)} horas</p>`;
    html += `<p>Cantidad promedio en cola (Lq): ${Lq.toFixed(4)}</p>`;
    html += `<p>Cantidad promedio en sistema (L): ${L.toFixed(4)}</p>`;

    reportDiv.innerHTML = html;
}


// Función para crear mesas y sillas
function createTables() {
    tables = [];
    const cols = 5;  // Número de columnas de mesas
    const separation = 20;  // Espacio entre las mesas
    const spacingX = (tableArea.width / cols) + separation;  // Aumenta la separación
    const spacingY = (tableArea.height / Math.ceil(numTables / cols)) + separation;  // Aumenta la separación en Y
    
    for (let i = 0; i < numTables; i++) {
        let row = Math.floor(i / cols);
        let col = i % cols;
        let tableX = tableArea.x + col * spacingX + spacingX / 2;  // Posición X de la mesa
        let tableY = tableArea.y + row * spacingY + spacingY / 2;  // Posición Y de la mesa
        let table = {
            x: tableX,
            y: tableY,
            radius: 30,
            chairs: []
        };

        // Crear 4 sillas alrededor de la mesa
        const chairDistance = 45; // Distancia desde el centro de la mesa
        const chairRadius = 10;
        const angles = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]; 
        for (let ang of angles) {
            let chairX = tableX + chairDistance * Math.cos(ang);
            let chairY = tableY + chairDistance * Math.sin(ang);
            let chair = {
                x: chairX,
                y: chairY,
                radius: chairRadius,
                status: 'available', // 'available', 'reserved', 'occupied'
                client: null
            };
            table.chairs.push(chair);
        }

        tables.push(table);
    }
}

// Función de animación principal
function animate() {
    if (!simulationRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (backgroundLoaded) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    drawAreas();
    drawRoutes();
    drawTables();
    drawClients();
    requestAnimationFrame(animate);

}

// Función para dibujar las áreas del restaurante
function drawAreas() {

   
}

// Función para dibujar las rutas
function drawRoutes() {
    // Dibujamos las rutas definidas en forma de Y
    drawLine(mainRoute, 'rgba(0, 0, 0, 0)');
    drawLine(waitingRoute, 'rgba(0, 0, 0, 0)');
    drawLine(tablesRoute, 'rgba(0, 0, 0, 0)');
    drawLine(exitRoute, 'rgba(0, 0, 0, 0)');
}

// Función auxiliar para dibujar líneas
function drawLine(points, color) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

// Cargar la imagen de la mesa
let tableImage = new Image();
tableImage.src = 'assets/mes2.png';  // Cambia esta ruta con la ubicación de tu imagen de mesa

// Cargar la imagen de la silla
let chairImage = new Image();
chairImage.src = 'assets/sillita.png';  // Cambia esta ruta con la ubicación de tu imagen de silla

// Función para dibujar mesas y sillas con medio punto detrás de cada silla
function drawTables() {
    for (let table of tables) {
        // Asegurarnos de que la imagen de la mesa esté cargada antes de dibujarla
        if (tableImage.complete) {
            // Definir un tamaño fijo para la mesa (por ejemplo, un radio fijo)
            const fixedSize = table.radius * 3;  // Ancho y alto de la mesa, siempre igual al diámetro

            // Obtener las dimensiones originales de la imagen
            const imageWidth = tableImage.width;
            const imageHeight = tableImage.height;

            // Calcular el factor de escala para que la imagen se ajuste al tamaño fijo de la mesa
            const scaleFactor = Math.min(fixedSize / imageWidth, fixedSize / imageHeight);

            // Calcular el tamaño final de la imagen para que se ajuste proporcionalmente
            const finalWidth = imageWidth * scaleFactor;
            const finalHeight = imageHeight * scaleFactor;

            // Dibujar la imagen ajustada al tamaño de la mesa
            ctx.drawImage(
                tableImage, 
                table.x - finalWidth / 2, // Coordenada X para centrar la imagen
                table.y - finalHeight / 2, // Coordenada Y para centrar la imagen
                finalWidth,               // Ancho de la imagen ajustado
                finalHeight              // Alto de la imagen ajustado
            );
        }

        for (let chair of table.chairs) {
            // Asegurarnos de que la imagen de la silla esté cargada antes de dibujarla
            if (chairImage.complete) {
                const chairSize = 20;  // Tamaño fijo de la silla (ajustable)

                // Calcular el ángulo de rotación entre la mesa y la silla
                const dx = chair.x - table.x;
                const dy = chair.y - table.y;
                let angle = Math.atan2(dy, dx); // El ángulo entre la silla y la mesa (en radianes)

                angle -= Math.PI / 2;  // Corregir la orientación

                // Guardar el contexto actual
                ctx.save();

                // Mover el canvas al centro de la silla para que la rotación sea alrededor de su centro
                ctx.translate(chair.x, chair.y);

                // Rotar el canvas según el ángulo corregido
                ctx.rotate(angle);

                // Dibujar la imagen de la silla con la rotación aplicada
                ctx.drawImage(
                    chairImage,
                    -chairSize / 2, // Centrar la imagen de la silla (al rededor de su punto de referencia)
                    -chairSize / 2, // Centrar la imagen de la silla (al rededor de su punto de referencia)
                    chairSize,      // Ancho de la silla (ajustable)
                    chairSize       // Alto de la silla (ajustable)
                );

                // Restaurar el contexto para no afectar el resto de los dibujos
                ctx.restore();
            }

            // Obtener el color del punto según el estado de la silla
            ctx.fillStyle = getChairPointColor(chair.status); // Llamada a la función para obtener el color

            // Posicionar el medio punto detrás de la silla
            const pointX = chair.x;  // Posicionar el punto alineado con la silla
            const pointY = chair.y + 10; // Colocar el punto un poco más abajo, detrás de la silla

            // Dibujar un "medio punto" (semicírculo) detrás de la silla
            const radius = 6;  // Radio del punto

            // Dibujar un semicírculo (medio círculo)
            ctx.beginPath();
            ctx.arc(pointX, pointY, radius, Math.PI, 2 * Math.PI); // Solo dibujamos la mitad inferior del círculo
            ctx.fill();  // Rellenar el semicírculo con el color correspondiente

            // Opcional: Agregar un brillo o resplandor alrededor del círculo
            ctx.shadowBlur = 5; // Ajustar el resplandor
            ctx.shadowColor = ctx.fillStyle; // El mismo color que el círculo para el brillo
        }
    }
}

// Función para obtener el color del punto según el estado de la silla (con neón)
function getChairPointColor(status) {
    switch (status) {
        case 'available':
            return 'lime'; // Color brillante (neón) verde para disponible
        case 'reserved':
            return 'orange'; // Color brillante (neón) naranja para reservada
        case 'occupied':
            return 'red'; // Color brillante (neón) rojo para ocupada
        default:
            return 'gray'; // Color por defecto si no tiene estado
    }
}



// Cargar el GIF del cliente (caminando)
let clientImage = new Image();
clientImage.src = 'assets/caminando.gif';  // Cambia esta ruta con la ubicación de tu GIF


// Función para dibujar clientes (caminando con GIF)
function drawClients() {
    for (let client of clients) {
        // Comprobamos si la imagen del GIF está completamente cargada
        if (clientImage.complete) {
            const clientSize = 30;  // Tamaño fijo del cliente (ajustable)

            // Dibujar el GIF del cliente caminando
            ctx.drawImage(
                clientImage,
                client.x - clientSize / 2,  // Coordenada X para centrar la imagen
                client.y - clientSize / 2,  // Coordenada Y para centrar la imagen
                clientSize,                 // Ancho de la imagen (tamaño fijo o ajustable)
                clientSize                  // Alto de la imagen (tamaño fijo o ajustable)
            );
        }
    }

    // Dibujar clientes afuera, alineados verticalmente
let outsideOffsetY = entryPoint.y;  // Empieza en la posición inicial de Y
for (let c of outsideQueue) {
    ctx.beginPath();
    ctx.arc(entryPoint.x, outsideOffsetY, 10, 0, 2 * Math.PI);  // Coordenada X fija, Y cambia
    ctx.fillStyle = 'blue';  // Cambiar de 'gray' a 'blue'
    ctx.fill();
    ctx.closePath();
    outsideOffsetY += 20;  // Mueve la siguiente persona 20 píxeles más abajo
}

}


// Función para programar el siguiente evento
function scheduleNextEvent() {
    if (!simulationRunning) return;
    setTimeout(simulationStep, 10); // 100 ms por paso
}

// Paso de la simulación
function simulationStep() {
    if (!simulationRunning) return;
    let now = performance.now() / 1000;
    systemTime = now - simulationStartTime;

    // Llegadas
    if (systemTime >= nextArrivalTime) {
        newArrival();
        nextArrivalTime = systemTime + expDist(lambda);
    }

    updateClients();
    updateAreaUnderCurves();
    scheduleNextEvent();
}
let verticalPosition = 220;  // Coordenada Y inicial fuera del establecimiento
// Función para manejar nuevas llegadas de clientes
const TIME_SCALE = 60; // 1 segundo equivale a 1 minuto en simulación
const OUTSIDE_QUEUE_LIMIT = 10; // Límite fijo de personas en la cola exterior

function newArrival() {
    totalArrivals++;
    let inService = getTotalInService();
    let waiting = clients.filter(c => c.state === 'waitingQueue').length;
    let waitingInWaitingArea = clients.filter(c => c.state === 'waitingArea').length;
    let waitingOutside = clients.filter(c => c.state === 'waitingOutside').length;
    let systemSize = inService + waiting;
    let effectiveLimit = (queueType === 'limited') ? (numTables * 4 + queueLimit) : Infinity;

    if (systemSize < effectiveLimit) {
        // Si hay espacio en las mesas
        let client = {
            arrivalTime: systemTime,
            state: 'waitingQueue',
            x: entryPoint.x,
            y: entryPoint.y,
            path: [...mainRoute], // Copia de la ruta principal
            currentWaypoint: 0,
            targetX: mainRoute[1].x,
            targetY: mainRoute[1].y,
            speed: 80, // píxeles por segundo
            targetChair: null,
            eatingStartTime: null,
            eatingDuration: expDist(mu) * TIME_SCALE, // Duración de la comida determinada por mu
            assignedTable: null, // Mesa asignada
            avoidanceAttempts: 0
        };
        clients.push(client);
    } else if (waitingInWaitingArea < queueLimit) {
        // Si no hay espacio en las mesas pero hay espacio en la sala de espera
        let client = {
            arrivalTime: systemTime,
            state: 'waitingArea',
            x: 500 + (waitingInWaitingArea * 25), // Coordenada X para apilar en X
            y: 200, // Coordenada Y fija para sala de espera
            path: [],
            currentWaypoint: 0,
            speed: 80, // píxeles por segundo
            targetChair: null,
            eatingStartTime: null,
            eatingDuration: expDist(mu) * TIME_SCALE, // Duración de la comida determinada por mu
            assignedTable: null // Mesa asignada
        };
        clients.push(client);
    } else if (waitingOutside < OUTSIDE_QUEUE_LIMIT) {
        // Si no hay espacio en la sala de espera pero hay espacio afuera
        let client = {
            arrivalTime: systemTime,
            state: 'waitingOutside',
            x: 1580, // Coordenada X fija para la cola exterior
            y: 220 + (waitingOutside * 25), // Coordenada Y para apilar en Y
            path: [],
            currentWaypoint: 0,
            speed: 0, // No se mueve hasta que haya espacio en la sala de espera
            targetChair: null,
            eatingStartTime: null,
            eatingDuration: null, // No aplica hasta que ingrese al sistema
            assignedTable: null
        };
        clients.push(client);
    } else {
        // Si la cola exterior está llena, incrementar el conteo de llegadas perdidas
        lostArrivals++;
    }
}




// Función para obtener el total de clientes en servicio
function getTotalInService() {
    return clients.filter(c => ['walkingToChair', 'eating', 'leaving'].includes(c.state)).length;
}

// Función para mover clientes de la cola de afuera a la sala de espera
function moveFromOutsideToWaiting() {
    if (outsideQueue.length > 0 && (clients.filter(c => c.state === 'waitingQueue').length < numTables * 4)) {
        let client = outsideQueue.shift(); // Mover al primer cliente de la calle
        client.state = 'waitingQueue'; // Cambiar su estado a "esperando mesa"
        waitingQueue.push(client); // Agregarlo a la sala de espera
    }
}


// Función para asignar mesas a los clientes en espera
function assignTableFromWaitingQueue() {
    // Recorremos las mesas para encontrar una mesa libre
    for (let table of tables) {
        // Si hay sillas disponibles en la mesa
        if (table.chairs.some(chair => chair.status === 'available')) {
            // Si hay un cliente en la cola
            if (waitingQueue.length > 0) {
                let client = waitingQueue.shift(); // Sacamos al primer cliente de la cola

                // Asignamos la mesa y la silla al cliente
                let availableChair = table.chairs.find(chair => chair.status === 'available');
                availableChair.status = 'reserved'; // Marcamos la silla como reservada
                client.assignedTable = table;
                client.targetChair = availableChair;

                // Actualizamos la ruta del cliente
                client.path = [entryPoint, ...mainRoute, ...tablesRoute, {x: client.targetChair.x, y: client.targetChair.y}];
                client.currentWaypoint = 0;

                // Actualizamos el estado del cliente a "en camino a la silla"
                client.state = 'walkingToChair';
                clients.push(client); // Agregarlo a la lista de clientes activos
            }
        }
    }
}


// Función para asignar sillas disponibles a los clientes en cola
function tryToAssignClients() {
    for (let client of clients) {
        if (client.state === 'waitingQueue') {
            let freeChair = findNearestFreeChair(client.x, client.y);
            if (freeChair) {
                // Asignar al cliente a la silla
                freeChair.status = 'reserved'; // Cambiado de 'occupied' a 'reserved'
                freeChair.client = client;

                // Configurar estado de cliente
                client.state = 'walkingToChair';
                client.targetChair = freeChair;
                client.assignedTable = getAssignedTable(client);

                // Configurar la ruta hacia la silla
                client.path = calculatePath(mainRoute, waitingRoute, tablesRoute, freeChair);
                client.currentWaypoint = 0;
                if (client.path.length > 0) {
                    client.targetX = client.path[0].x;
                    client.targetY = client.path[0].y;
                }

                // Registrar tiempo de espera
                let waitTime = systemTime - client.arrivalTime;
                totalWaitInQueue += waitTime;
            }
        }
    }
}

// Función para encontrar la silla disponible más cercana
function findNearestFreeChair(x, y) {
    let nearestChair = null;
    let minDistance = Infinity;
    for (let table of tables) {
        for (let chair of table.chairs) {
            if (chair.status === 'available') {
                let dist = distance(x, y, chair.x, chair.y);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestChair = chair;
                }
            }
        }
    }
    return nearestChair;
}

// Función para obtener la mesa asignada a un cliente
function getAssignedTable(client) {
    if (client.targetChair) {
        for (let table of tables) {
            if (table.chairs.includes(client.targetChair)) {
                return table;
            }
        }
    }
    return null;
}

// Función para calcular la ruta hacia una silla específica
function calculatePath(mainRoute, waitingRoute, tablesRoute, chair) {
    // Combinar las rutas principales y de espera hacia las mesas
    let path = [...mainRoute, ...waitingRoute, ...tablesRoute];
    path.push({x: chair.x, y: chair.y});
    return path;
}

// Función para actualizar la posición y estado de los clientes
function updateClients() {
    // Asignar sillas si es posible
    tryToAssignClients();

    for (let client of clients) {
        if (['walkingToChair', 'leaving'].includes(client.state)) {
            moveAlongPath(client);
        } else if (client.state === 'eating') {
            // Verificar si ha terminado de comer
            if (systemTime >= client.eatingStartTime + client.eatingDuration) {
                client.state = 'leaving';
                client.path = [...exitRoute];
                client.currentWaypoint = 0;
                client.targetX = exitRoute[1].x;
                client.targetY = exitRoute[1].y;

                // Liberar la silla
                if (client.targetChair) {
                    client.targetChair.status = 'available';
                    client.targetChair.client = null;
                }
            }
        }
    }

    // Remover clientes que han salido
    clients = clients.filter(c => c.state !== 'finished');
}

// Función para mover un cliente a lo largo de su ruta con detección y evitación de colisiones
function moveAlongPath(client) {
    if (client.currentWaypoint >= client.path.length) {
        if (client.state === 'leaving') {
            // Cliente ha salido del restaurante
            servedClients++;
            let waitInQueue = (client.eatingStartTime || 0) - client.arrivalTime;
            let timeInSystem = systemTime - client.arrivalTime;
            totalWaitInQueue += waitInQueue;
            totalTimeInSystem += timeInSystem;

            // Marcar como finalizado
            client.state = 'finished';
        }
        return;
    }

    let target = client.path[client.currentWaypoint];
    let dx = target.x - client.x;
    let dy = target.y - client.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let step = client.speed * 0.1; // velocidad * deltaTime (100ms)

    if (dist < step) {
        client.x = target.x;
        client.y = target.y;
        client.currentWaypoint++;
        if (client.currentWaypoint < client.path.length) {
            target = client.path[client.currentWaypoint];
            client.targetX = target.x;
            client.targetY = target.y;
        } else {
            if (client.state === 'walkingToChair') {
                // Llegó a la silla, empieza a comer
                client.state = 'eating';
                client.eatingStartTime = systemTime;
                client.eatingDuration = expDist(mu);

                // Marcar la silla como ocupada
                if (client.targetChair) {
                    client.targetChair.status = 'occupied';
                }
            } else if (client.state === 'leaving') {
                // Ha salido del restaurante
                // Será removido en la siguiente actualización
            }
        }
    } else {
        // Propuesta nueva posición
        let proposedX = client.x + (dx / dist) * step;
        let proposedY = client.y + (dy / dist) * step;

        // Obtener la mesa asignada al cliente
        let assignedTable = getAssignedTable(client);

        // Verificar colisión con otras mesas
        if (isColliding(proposedX, proposedY, assignedTable)) {
            // Evitación con múltiples intentos
            let anglesToTry = [Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2];
            let moved = false;

            for (let angleOffset of anglesToTry) {
                let angle = Math.atan2(dy, dx) + angleOffset;
                let newDx = Math.cos(angle);
                let newDy = Math.sin(angle);
                let newProposedX = client.x + newDx * step;
                let newProposedY = client.y + newDy * step;

                if (!isColliding(newProposedX, newProposedY, assignedTable)) {
                    client.x = newProposedX;
                    client.y = newProposedY;
                    moved = true;
                    break;
                }
            }

            if (!moved) {
                // Añadir pequeñas variaciones aleatorias para evitar bloqueos permanentes
                let randomAngle = (Math.random() - 0.5) * Math.PI / 4; // +/- 22.5 grados
                let randomDx = Math.cos(Math.atan2(dy, dx) + randomAngle);
                let randomDy = Math.sin(Math.atan2(dy, dx) + randomAngle);
                client.x += randomDx * step;
                client.y += randomDy * step;
            }
        } else {
            // No hay colisión, mover normalmente
            client.x += (dx / dist) * step;
            client.y += (dy / dist) * step;
        }
    }
}

// Función para verificar colisiones con otras mesas
function isColliding(x, y, assignedTable) {
    for (let table of tables) {
        if (table === assignedTable) continue;
        let dist = distance(x, y, table.x, table.y);
        if (dist < (table.radius + 10 + 2)) { // radio de la mesa + radio del cliente + buffer reducido a 2
            return true;
        }
    }
    return false;
}

// Función para calcular distancia entre dos puntos
function distance(x1, y1, x2, y2) {
    return Math.sqrt( (x2 - x1)**2 + (y2 - y1)**2 );
}

// Función para actualizar las áreas bajo las curvas
function updateAreaUnderCurves() {
    let currentTime = systemTime;
    let delta = currentTime - lastEventTime;
    if (delta > 0) {
        let inService = getTotalInService();
        let waiting = clients.filter(c => c.state === 'waitingQueue').length;
        let n = inService + waiting;

        areaUnderL += n * delta;
        areaUnderLq += waiting * delta;

        if (n < maxStateTracking) {
            stateTime[n] += delta;
        } else {
            stateTime[maxStateTracking - 1] += delta;
        }

        lastEventTime = currentTime;
    }
}

// Función para generar distribución exponencial
function expDist(rate) {
    return -Math.log(1 - Math.random()) / rate;
}
 // Crear botón para exportar a Excel
 const exportButton = document.createElement('button');
 exportButton.innerText = 'Exportar a Excel';
 exportButton.addEventListener('click', exportToExcel);
 reportDiv.appendChild(exportButton);


function exportToExcel() {
 const reportData = [
     ['Métrica', 'Valor'],
     ['Tiempo total simulado (horas)', (systemTime).toFixed(2)],
     ['Factor de Utilización', factorUtilizacion.toFixed(4)],
     ['Tiempo promedio en cola (horas)', (totalWaitInQueue / servedClients / TIME_SCALE / 60).toFixed(4)],
     ['Tiempo promedio en sistema (horas)', (totalTimeInSystem / servedClients / TIME_SCALE / 60).toFixed(4)],
     ['Cantidad promedio en cola', Lq.toFixed(4)],
     ['Cantidad promedio en sistema', L.toFixed(4)],
     ['Lambda Efectiva (clientes/seg)', lambdaEfectiva.toFixed(4)],
     ['Lambda Pérdida (clientes/seg)', lambdaPerdida.toFixed(4)],
     ['Número promedio de sillas ocupadas', avgActiveServers.toFixed(4)],
     ['Número promedio de sillas disponibles', avgInactiveServers.toFixed(4)],
     ['Total de clientes rechazados', lostArrivals]
 ];

 let csvContent = 'data:text/csv;charset=utf-8,';
 reportData.forEach(row => {
     csvContent += row.join(',') + '\n';
 });

 const encodedUri = encodeURI(csvContent);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download', 'reporte_simulacion.csv');
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
}
document.getElementById('exportReport').addEventListener('click', exportToExcel);
