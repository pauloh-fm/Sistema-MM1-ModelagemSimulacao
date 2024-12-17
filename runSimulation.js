let systemId = 1; // ID incremental para cada sistema de fila criado
const pageSize = 100; // Tamanho da página na tabela de pacotes

function createResultComponent(simulation, serverDetails) {
    const resultsContainer = document.getElementById('resultsContainer');

    // Calcular estatísticas
    const stats = calculateStatistics(simulation);

    // Determinar a cor do sistema com base em U
    const utilization = stats.U; // U é a utilização
    let cardClass = 'bg-light'; // Cor padrão
    if (utilization < 0.60) {
        cardClass = 'bg-success text-white'; // Verde claro
    } else if (utilization >= 0.60 && utilization < 0.75) {
        cardClass = 'bg-success'; // Verde mais vivo
    } else if (utilization == 0.75) {
        cardClass = 'bg-success bg-opacity-75'; // Verde ideal
    } else {
        cardClass = 'bg-danger'; // Vermelho (acima de 100%)
    }

    // Criar o componente principal do sistema
    const systemDiv = document.createElement('div');
    systemDiv.className = `card mb-3 ${cardClass}`;

    const systemHeader = document.createElement('div');
    systemHeader.className = 'card-header';
    systemHeader.innerHTML = `
        <h5 class="mb-0">
            Sistema de Fila (#${systemId})
            <button class="btn btn-link float-end" type="button" data-bs-toggle="collapse" data-bs-target="#systemDetails${systemId}">
                Expandir
            </button>
        </h5>
    `;
    systemDiv.appendChild(systemHeader);

    // Criar os detalhes da simulação
    const systemDetails = document.createElement('div');
    systemDetails.className = 'collapse';
    systemDetails.id = `systemDetails${systemId}`;

    const statsTable = generateStatsTable(stats); // Gerar tabela de estatísticas
    const serverInfo = generateServerInfo(serverDetails); // Informações do servidor
    const packetsTable = generatePacketsTable(simulation.P); // Gerar tabela de pacotes com paginação

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

    // Paginação da tabela de pacotes
    setupPagination(simulation.P, systemId);

    systemId++; // Incrementar ID para o próximo sistema

    // Limpar os campos de entrada
    clearInputFields();
}

function generateServerInfo(details) {
    let info = `
        <table class="table table-bordered">
            <tr><th>Tipo de Servidor</th><td>${details.type}</td></tr>
    `;

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

    return `
        <table class="table table-bordered table-striped">
            ${tableRows}
        </table>
    `;
}

function setupPagination(packets, systemId) {
    const totalPages = Math.ceil(packets.length / pageSize);
    const pagination = document.getElementById(`pagination${systemId}`);
    pagination.innerHTML = ''; // Limpar paginação

    for (let i = 0; i < totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item';
        pageItem.innerHTML = `
            <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
        `;
        pageItem.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            const packetsTable = generatePacketsTable(packets, page * pageSize);
            document.getElementById(`packetsTable${systemId}`).innerHTML = packetsTable;
        });
        pagination.appendChild(pageItem);
    }
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

    const stats = simulation.calculateStatistics(); // Chama a função diretamente
    createResultComponent(simulation, serverDetails, stats);
}


document.getElementById('runSimulation').addEventListener('click', runSimulation);
