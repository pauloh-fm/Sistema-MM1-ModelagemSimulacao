class clPacote {
    constructor() {
        this.nf = 0; // Número de pacotes na fila
        this.ic = 0; // Intervalo entre chegadas
        this.cpf = 0; // Chegada do pacote na fila
        this.eps = 0; // Entrada no servidor
        this.sps = 0; // Saída do servidor
    }
}

class clSF {
    constructor() {
        this.lambda = 0; // Taxa de chegada
        this.mu = 0; // Taxa de serviço
        this.P = []; // Array de pacotes
    }

    X(p) {
        const u = Math.random();
        return -Math.log(1 - u) / p;
    }

    Iniciar(lambda, mu) {
        this.lambda = lambda;
        this.mu = mu;
        this.P = [];
        this.P.push(new clPacote());
    }

    Empacotar() {
        const Pa = this.P[this.P.length - 1];
        const Pn = new clPacote();

        Pn.ic = this.X(this.lambda);
        Pn.cpf = Pn.ic + Pa.cpf;
        Pn.eps = Math.max(Pn.cpf, Pa.sps);
        Pn.sps = Pn.eps + this.X(this.mu);

        // Calcula o número de pacotes na fila
        Pn.nf = 0;
        for (let i = this.P.length - 1; i >= 0; i--) {
            if (Pn.cpf < this.P[i].eps) Pn.nf++;
            else break;
        }

        this.P.push(Pn);
    }

    Simular(N) {
        for (let p = 1; p < N; p++) {
            this.Empacotar();
        }
    }

    calculateStatistics() {
        const N = this.P.length;
        const stats = {
            lambda: this.lambda,
            mu: this.mu,
            N: N,
            T: 0,
            U: 0,
            E: [0, 0, 0], // Médias: ts, tsf, nf
            D: [0, 0, 0], // Desvios padrão
        };

        let Sx = [0, 0, 0]; // Somatórios
        let Sxx = [0, 0, 0]; // Somatórios dos quadrados

        for (let p = 0; p < N; p++) {
            const ts = this.P[p].sps - this.P[p].eps; // Tempo de serviço
            const tsf = this.P[p].sps - this.P[p].cpf; // Tempo no sistema
            const nf = this.P[p].nf;

            Sx[0] += ts;
            Sxx[0] += ts * ts;
            Sx[1] += tsf;
            Sxx[1] += tsf * tsf;
            Sx[2] += nf;
            Sxx[2] += nf * nf;
        }

        stats.T = this.P[N - 1].sps - this.P[0].eps;
        stats.U = Sx[0] / stats.T;

        for (let i = 0; i < 3; i++) {
            stats.E[i] = Sx[i] / N; // Média
            stats.D[i] = Math.sqrt(Sxx[i] / N - stats.E[i] * stats.E[i]); // Desvio padrão
        }

        return stats;
    }
}
