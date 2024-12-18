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
    const repairButton = parseFloat(stats.U) > 0.75 ? generateRepairButton(systemId, stats.lambda, stats.mu) : '';

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

    if (parseFloat(U).toFixed(10) === (0.75).toFixed(10)) {
        flagColor = 'bg-warning';
        text = '=75%';
    } else if (parseFloat(U) > 0.75) {
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

// Ajusta a frequência para garantir U <= 75% com margem de segurança
function adjustTo75(id, lambda) {
    const targetU = 0.72; // Utilização desejada com margem de segurança
    const system = simulations[id];
    const serverType = system.serverDetails.type; // Tipo de servidor: CPU ou RAM
    let adjustedFrequency = 0; // Frequência ajustada
    let newMu = lambda / targetU; // Cálculo inicial para μ ajustado

    // Ajusta para o tipo CPU
    if (serverType === 'cpu') {
        const threads = parseFloat(system.serverDetails.parameters['Número de Threads']) || 1;
        const qpc = parseFloat(system.serverDetails.parameters['Quantidade de Dados por Ciclo (Bytes)']) || 1;

        // Calcular a nova frequência ajustada para CPU
        adjustedFrequency = (newMu * system.serverDetails.parameters['Tamanho do Pacote (bits)']) /
                            (threads * qpc * 1024);
        system.serverDetails.parameters['Frequência Ajustada (GHz)'] = adjustedFrequency.toFixed(10);
    }
    // Ajusta para o tipo RAM
    else if (serverType === 'ram') {
        const bandwidth = parseFloat(system.serverDetails.parameters['Largura do Barramento (bits)']) || 1;

        // Calcular a nova frequência ajustada para RAM
        adjustedFrequency = (newMu * 8) / (bandwidth * 1024);
        system.serverDetails.parameters['Frequência Ajustada (GHz)'] = adjustedFrequency.toFixed(10);
    }

    // Criar um novo sistema com os valores ajustados
    const adjustedSimulation = new clSF();
    adjustedSimulation.Iniciar(lambda, newMu);
    adjustedSimulation.Simular(5000);

    // Calcular as novas estatísticas
    const newStats = adjustedSimulation.calculateStatistics();
    system.serverDetails.parameters['μ Ajustado'] = newMu.toFixed(10);

    // Criar novo resultado com valores ajustados
    createResultComponent(adjustedSimulation, system.serverDetails, newStats);
}

// Gera a tabela de estatísticas
function generateStatsTable(stats) {
    const formatValue = (value) => {
        if (parseFloat(value) < 1e-10) {
            return '<1e-10';
        }
        return parseFloat(value).toFixed(10);
    };

    return `
        <table class="table table-bordered">
            <tr><th>λ (Taxa de Chegada)</th><td>${formatValue(stats.lambda)} pacotes/segundo</td></tr>
            <tr><th>μ (Taxa de Serviço)</th><td>${formatValue(stats.mu)} pacotes/segundo</td></tr>
            <tr><th>N (Pacotes Simulados)</th><td>${stats.N}</td></tr>
            <tr><th>T (Duração)</th><td>${formatValue(stats.T)} segundos</td></tr>
            <tr><th>U (Utilização)</th><td>${formatValue(stats.U)}</td></tr>
            <tr><th>E[tsf] (Média Tempo no Sistema)</th><td>${stats.E[1]} segundos</td></tr>
            <tr><th>E[nf] (Média Pacotes na Fila)</th><td>${stats.E[2]}</td></tr>
            <tr><th>D[tsf] (Desvio Padrão Tempo no Sistema)</th><td>${stats.D[1]} segundos</td></tr>
            <tr><th>D[nf] (Desvio Padrão Pacotes na Fila)</th><td>${stats.D[2]}</td></tr>
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

    const formatValue = (value) => {
        if (value < 1e-10) {
            return '<1e-10';
        }
        return value.toFixed(10);
    };

    for (let i = start; i < end; i++) {
        tableRows += `
            <tr>
                <td>${i + 1}</td>
                <td>${i === 0 ? 0 : formatValue(packets[i].ic)}</td>
                <td>${i === 0 ? 0 : formatValue(packets[i].cpf)}</td>
                <td>${i === 0 ? 0 : formatValue(packets[i].eps)}</td>
                <td>${i === 0 ? 0 : formatValue(packets[i].sps)}</td>
                <td>${i === 0 ? 0 : packets[i].nf}</td>
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
