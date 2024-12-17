const serverParameters = document.getElementById('serverParameters');
let mu = 0; // Taxa de serviço

document.getElementById('serverType').addEventListener('change', function () {
    const selectedType = this.value;
    serverParameters.innerHTML = ''; // Limpa os campos anteriores

    if (selectedType === 'cpu') {
        serverParameters.innerHTML = `
            <label for="frequency" class="form-label">Frequência (GHz)</label>
            <input type="number" id="frequency" class="form-control">
            <label for="threads" class="form-label">Número de Threads</label>
            <input type="number" id="threads" class="form-control">
            <label for="qpc" class="form-label">Quantidade de Dados por Ciclo (Bytes)</label>
            <input type="number" id="qpc" class="form-control">
        `;
    } else if (selectedType === 'ram') {
        serverParameters.innerHTML = `
            <label for="frequency" class="form-label">Frequência (GHz)</label>
            <input type="number" id="frequency" class="form-control">
            <label for="bandwidth" class="form-label">Largura do Barramento (bits)</label>
            <input type="number" id="bandwidth" class="form-control">
        `;
    }
});

document.getElementById('calculateMu').addEventListener('click', () => {
    const serverType = document.getElementById('serverType').value;
    let processingRate = 0; // Largura de banda em bits/s
    let packageSizeBits = parseFloat(document.getElementById('packageSize').value);

    if (!packageSizeBits || packageSizeBits <= 0) {
        alert("Por favor, defina o tamanho do pacote em MB na etapa de definição de pacotes.");
        return;
    }

    let equation = ""; // String para armazenar a fórmula e valores

    if (serverType === 'cpu') {
        const frequency = parseFloat(document.getElementById('frequency').value) || 0;
        const threads = parseFloat(document.getElementById('threads').value) || 0;
        const qpc = parseFloat(document.getElementById('qpc').value) || 0;

        processingRate = frequency * threads * qpc; // Convertendo para bits/s
        equation = `
            \\( \\mu = \\frac{Frequência \\times Threads \\times QPC \\times 1024}{Tamanho \\ do \\ Pacote} \\) <br>
            \\( \\mu = \\frac{${frequency} \\times ${threads} \\times ${qpc} \\times 1024}{${packageSizeBits}} \\)
        `;
    } else if (serverType === 'ram') {
        const frequencyGHz = parseFloat(document.getElementById('frequency').value) || 0;
        const bandwidth = parseFloat(document.getElementById('bandwidth').value) || 0;

        processingRate = (frequencyGHz * bandwidth) / 8; // Convertendo para bits/s
        equation = `
            \\( \\mu = \\frac{Frequência \\times Largura \\ de \\ Banda \\times 1024}{8 \\times Tamanho \\ do \\ Pacote} \\) <br>
            \\( \\mu = \\frac{${frequencyGHz} \\times ${bandwidth} \\times 1024}{8 \\times ${packageSizeBits}} \\)
        `;
    }

    if (processingRate > 0) {
        mu = processingRate * 1024 / packageSizeBits; // µ em pacotes/segundo
        document.getElementById('muValue').textContent = mu.toFixed(5);
        document.getElementById('muResult').classList.remove('d-none');

        // Exibir equação formatada com MathJax
        document.getElementById('muEquationView').innerHTML = equation;
        MathJax.typesetPromise(); // Recarrega o MathJax para exibir as equações
    } else {
        alert("Por favor, preencha todos os campos necessários para o cálculo.");
    }
});
