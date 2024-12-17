let systemId = 1; // ID incremental para cada sistema de fila criado
const pageSize = 100; // Tamanho da página da tabela de pacotes
const simulations = {}; // Armazena os dados de cada sistema criado

// Cria o componente do resultado do sistema de fila
function createResultComponent(simulation, serverDetails, stats) {
    const resultsContainer = document.getElementById('resultsContainer');

    // Criar o card do sistema
    const systemDiv = document.createElement('div');
    systemDiv.className = `card mb-3`;
    systemDiv.id = `systemDiv${systemId}`;

    // Gerar flag de utilização e botão de ajuste
    const flag = generateUtilizationFlag(stats.U);
    const repairButton = stats.U > 0.75 ? generateRepairButton(systemId, stats.lambda, stats.mu) : '';

    // Cabeçalho
    const systemHeader = document.createElement('div');
    systemHeader.className = 'card-header d-flex align-items-center justify-content-between';
    systemHeader.innerHTML = `
        <h5 class="mb-0">
            Sistema de Fila (#${systemId}) ${flag} ${repairButton}
        </h5>
        <button class="btn btn-link" type="button" data-bs-toggle="collapse" data-bs-target="#systemDetails${systemId}">
            Expandir
        </button>
    `;
    systemDiv.appendChild(systemHeader);

    // Detalhes do sistema
    const systemDetails = document.createElement('div');
    systemDetails.className = 'collapse';
    systemDetails.id = `systemDetails${systemId}`;

    const statsTable = generateStatsTable(stats);
    const serverInfo = generateServerInfo(serverDetails);
    const packetsTable = generatePacketsTable(simulation.P);

    systemDetails.innerHTML = `
        <div class="card-body">
            <h6>Indicadores de Desempenho</h6>
            ${statsTable}
            <h6 class="mt-4">Informações do Servidor</h6>
            ${serverInfo}
            <h6 class="mt-4">Pacotes</h6>
            <div id="packetsTable${systemId}">${packetsTable}</div>
            <nav>
                <ul class="pagination justify-content-center" id="pagination${systemId}"></ul>
            </nav>
        </div>
    `;

    systemDiv.appendChild(systemDetails);
    resultsContainer.appendChild(systemDiv);

    setupPagination(simulation.P, systemId);
    simulations[systemId] = { simulation, serverDetails, stats };
    systemId++;
    clearInputFields();
}

// Gera a flag de utilização com base em U
function generateUtilizationFlag(U) {
    let flagColor = 'bg-success';
    let text = '<75%';

    if (U === 0.75) {
        flagColor = 'bg-warning';
        text = '=75%';
    } else if (U > 0.75) {
        flagColor = 'bg-danger';
        text = '>75%';
    }

    return `<span class="badge ${flagColor} ms-2">${text}</span>`;
}

// Gera botão para ajustar a frequência do servidor
function generateRepairButton(id, lambda, mu) {
    return `
        <button class="btn btn-warning btn-sm ms-2" onclick="adjustTo75(${id}, ${lambda}, ${mu})">
            <img src="repair-svgrepo-com.svg" alt="Reparar" style="width: 20px; height: 20px;">
        </button>
    `;
}

// Ajusta a frequência para U = 75%
function adjustTo75(id, lambda, mu) {
    const newMu = (lambda / 0.75).toFixed(5); // Cálculo para U = 0.75
    const system = simulations[id];
    system.serverDetails.parameters['Frequência Ajustada (μ)'] = newMu;

    // Cria um novo sistema com os valores ajustados
    const newSimulation = new clSF();
    newSimulation.Iniciar(lambda, parseFloat(newMu));
    newSimulation.Simular(5000);

    const newStats = newSimulation.calculateStatistics();
    createResultComponent(newSimulation, system.serverDetails, newStats);
}

// Gera a tabela de estatísticas
function generateStatsTable(stats) {
    return `
        <table class="table table-bordered">
            <tr><th>λ (Taxa de Chegada)</th><td>${stats.lambda.toFixed(5)} pacotes/segundo</td></tr>
            <tr><th>μ (Taxa de Serviço)</th><td>${stats.mu.toFixed(5)} pacotes/segundo</td></tr>
            <tr><th>N (Pacotes Simulados)</th><td>${stats.N}</td></tr>
            <tr><th>T (Duração)</th><td>${stats.T.toFixed(5)} segundos</td></tr>
            <tr><th>U (Utilização)</th><td>${stats.U.toFixed(5)}</td></tr>
            <tr><th>E[tsf] (Média Tempo no Sistema)</th><td>${stats.E[1].toFixed(5)} segundos</td></tr>
            <tr><th>E[nf] (Média Pacotes na Fila)</th><td>${stats.E[2].toFixed(5)}</td></tr>
            <tr><th>D[tsf] (Desvio Padrão Tempo no Sistema)</th><td>${stats.D[1].toFixed(5)}</td></tr>
            <tr><th>D[nf] (Desvio Padrão Pacotes na Fila)</th><td>${stats.D[2].toFixed(5)}</td></tr>
        </table>
    `;
}

function generateServerInfo(details) {
    let info = `<table class="table table-bordered">`;
    info += `<tr><th>Tipo de Servidor</th><td>${details.type}</td></tr>`;

    for (const [key, value] of Object.entries(details.parameters)) {
        info += `<tr><th>${key}</th><td>${value}</td></tr>`;
    }
    info += `</table>`;
    return info;
}

function generatePacketsTable(packets, start = 0) {
    const end = Math.min(start + pageSize, packets.length);
    let tableRows = `
        <tr>
            <th>#</th>
            <th>ic</th>
            <th>cpf</th>
            <th>eps</th>
            <th>sps</th>
            <th>nf</th>
        </tr>
    `;

    for (let i = start; i < end; i++) {
        tableRows += `
            <tr>
                <td>${i + 1}</td>
                <td>${packets[i].ic.toFixed(5)}</td>
                <td>${packets[i].cpf.toFixed(5)}</td>
                <td>${packets[i].eps.toFixed(5)}</td>
                <td>${packets[i].sps.toFixed(5)}</td>
                <td>${packets[i].nf}</td>
            </tr>
        `;
    }

    return `<table class="table table-bordered table-striped">${tableRows}</table>`;
}

function setupPagination(packets, systemId) {
    const totalPages = Math.ceil(packets.length / pageSize);
    const pagination = document.getElementById(`pagination${systemId}`);
    pagination.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item';
        pageItem.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i + 1}</a>`;
        pageItem.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            document.getElementById(`packetsTable${systemId}`).innerHTML =
                generatePacketsTable(packets, page * pageSize);
        });
        pagination.appendChild(pageItem);
    }
}

function clearInputFields() {
    document.getElementById('serverParameters').innerHTML = '';
    document.getElementById('muResult').classList.add('d-none');
}

function runSimulation() {
    const simulation = new clSF();
    simulation.Iniciar(lambda, mu);
    simulation.Simular(5000);

    const serverDetails = {
        type: document.getElementById('serverType').value,
        parameters: Object.fromEntries(
            Array.from(document.querySelectorAll('#serverParameters input'))
                .map(input => [input.previousElementSibling.textContent, input.value])
        )
    };

    const stats = simulation.calculateStatistics();
    createResultComponent(simulation, serverDetails, stats);
}

document.getElementById('runSimulation').addEventListener('click', runSimulation);
