function calculateStatistics(simulation) {
    const N = simulation.P.length;
    const stats = {
        lambda: simulation.lambda,
        mu: simulation.mu,
        N: N,
        T: 0,
        U: 0,
        E: [0, 0, 0], // Médias: ts, tsf, nf
        D: [0, 0, 0], // Desvios padrão
    };

    let Sx = [0, 0, 0]; // Somatórios
    let Sxx = [0, 0, 0]; // Somatórios dos quadrados

    for (let p = 0; p < N; p++) {
        const ts = simulation.P[p].sps - simulation.P[p].eps; // Tempo de serviço
        const tsf = simulation.P[p].sps - simulation.P[p].cpf; // Tempo no sistema
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
        stats.E[i] = Sx[i] / N; // Média
        stats.D[i] = Math.sqrt(Sxx[i] / N - stats.E[i] * stats.E[i]); // Desvio padrão
    }

    return stats;
}
