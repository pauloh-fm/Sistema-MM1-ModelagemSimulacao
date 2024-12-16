class clPacote {
    constructor() {
        this.nf = 0;
        this.ic = 0;
        this.cpf = 0;
        this.eps = 0;
        this.sps = 0;
    }
}

class clSF {
    constructor() {
        this.lambda = 0;
        this.mu = 0;
        this.P = [];
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

        this.P.push(Pn);
    }

    Simular(N) {
        for (let p = 1; p < N; p++) {
            this.Empacotar();
        }
    }

    Resumo() {
        console.log(`Simulação de Fila com λ=${this.lambda}, μ=${this.mu}`);
        console.log(`Pacotes simulados: ${this.P.length}`);
    }
}
