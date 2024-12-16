let systemId = 1; // ID incremental para cada sistema de fila criado

function createResultComponent(simulation) {
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
    } else if (utilization >= 0.75 && utilization <= 1.00) {
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
    const packetsTable = generatePacketsTable(simulation.P); // Gerar tabela de pacotes

    systemDetails.innerHTML = `
        <div class="card-body">
            <h6>Indicadores de Desempenho</h6>
            ${statsTable}
            <h6 class="mt-4">Pacotes</h6>
            ${packetsTable}
        </div>
    `;

    systemDiv.appendChild(systemDetails);
    resultsContainer.appendChild(systemDiv);

    systemId++; // Incrementar ID para o próximo sistema

    // Limpar os campos de entrada
    clearInputFields();
}

function calculateStatistics(simulation) {
    const stats = {
        lambda: simulation.lambda,
        mu: simulation.mu,
        N: simulation.P.length,
        T: 0,
        U: 0,
        E: [0, 0, 0],
        D: [0, 0, 0],
    };

    const N = simulation.P.length;
    const Sx = [0, 0, 0];
    const Sxx = [0, 0, 0];

    for (let p = 0; p < N; p++) {
        const ts = simulation.P[p].sps - simulation.P[p].eps;
        const tsf = simulation.P[p].sps - simulation.P[p].cpf;
        const nf = simulation.P[p].nf;

        Sx[0] += ts;
        Sxx[0] += ts * ts;
        Sx[1] += tsf;
        Sxx[1] += tsf * tsf;
        Sx[2] += nf;
        Sxx[2] += nf * nf;
    }

    stats.T = simulation.P[N - 1].sps - simulation.P[0].eps;
    stats.U = Sx[0] / stats.T;
    for (let i = 0; i < 3; i++) {
        stats.E[i] = Sx[i] / N;
        stats.D[i] = Math.sqrt(Sxx[i] / N - stats.E[i] * stats.E[i]);
    }

    return stats;
}

function generateStatsTable(stats) {
    return `
        <table class="table table-bordered">
            <tr><th>λ</th><td>${stats.lambda.toFixed(5)} pacotes/segundo</td></tr>
            <tr><th>μ</th><td>${stats.mu.toFixed(5)} pacotes/segundo</td></tr>
            <tr><th>N</th><td>${stats.N}</td></tr>
            <tr><th>T</th><td>${stats.T.toFixed(5)} segundos</td></tr>
            <tr><th>E[tsf]</th><td>${stats.E[1].toFixed(5)} segundos</td></tr>
            <tr><th>E[nf]</th><td>${stats.E[2].toFixed(5)}</td></tr>
            <tr><th>D[tsf]</th><td>${stats.D[1].toFixed(5)}</td></tr>
            <tr><th>D[nf]</th><td>${stats.D[2].toFixed(5)}</td></tr>
            <tr><th>U</th><td>${stats.U.toFixed(5)}</td></tr>
        </table>
    `;
}

function generatePacketsTable(packets) {
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

    packets.forEach((packet, index) => {
        tableRows += `
            <tr>
                <td>${index + 1}</td>
                <td>${packet.ic.toFixed(5)}</td>
                <td>${packet.cpf.toFixed(5)}</td>
                <td>${packet.eps.toFixed(5)}</td>
                <td>${packet.sps.toFixed(5)}</td>
                <td>${packet.nf}</td>
            </tr>
        `;
    });

    return `
        <table class="table table-bordered">
            ${tableRows}
        </table>
    `;
}

function clearInputFields() {
    // Limpar os campos de "Definir Pacote"
    document.getElementById('packagesPerMonth').value = '';
    document.getElementById('packageSize').value = '';

    // Limpar os campos de "Definir Servidor"
    document.getElementById('serverType').value = 'cpu';
    document.getElementById('serverParameters').innerHTML = '';
    document.getElementById('muResult').classList.add('d-none');
}

function runSimulation() {
    const simulation = new clSF();
    simulation.Iniciar(lambda, mu);
    simulation.Simular(5000);
    createResultComponent(simulation); // Adiciona o resultado da simulação na interface
}

document.getElementById('runSimulation').addEventListener('click', runSimulation);
