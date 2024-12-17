function generateStatsTable(stats) {
    return `
        <table class="table table-bordered">
            <tr><th>λ (Taxa de Chegada)</th><td>${stats.lambda.toFixed(5)} pacotes/segundo</td></tr>
            <tr><th>μ (Taxa de Serviço)</th><td>${stats.mu.toFixed(5)} pacotes/segundo</td></tr>
            <tr><th>N (Pacotes Simulados)</th><td>${stats.N}</td></tr>
            <tr><th>T (Duração da Simulação)</th><td>${stats.T.toFixed(5)} segundos</td></tr>
            <tr><th>E[tsf] (Média Tempo no Sistema)</th><td>${stats.E[1].toFixed(5)} segundos</td></tr>
            <tr><th>E[nf] (Média Pacotes na Fila)</th><td>${stats.E[2].toFixed(5)}</td></tr>
            <tr><th>D[tsf] (Desvio Padrão Tempo no Sistema)</th><td>${stats.D[1].toFixed(5)}</td></tr>
            <tr><th>D[nf] (Desvio Padrão Pacotes na Fila)</th><td>${stats.D[2].toFixed(5)}</td></tr>
            <tr><th>U (Utilização do Servidor)</th><td>${stats.U.toFixed(5)}</td></tr>
        </table>
    `;
}
