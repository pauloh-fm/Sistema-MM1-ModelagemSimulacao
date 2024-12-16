const serverParameters = document.getElementById('serverParameters');
let mu = 0; // Taxa de serviço

// Atualiza os campos de entrada com base no tipo de servidor selecionado
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
    // Outros tipos podem ser adicionados aqui (HD, SSD, PCIe)
});

// Calcula a taxa de serviço (μ) ao clicar no botão
document.getElementById('calculateMu').addEventListener('click', () => {
    const serverType = document.getElementById('serverType').value;
    let processingRate = 0; // Largura de banda em bits/s
    let packageSizeBits = parseFloat(document.getElementById('packageSize').value);
    if (!packageSizeBits || packageSizeBits <= 0) {
        alert("Por favor, defina o tamanho do pacote em MB na etapa de definição de pacotes.");
        return;
    }

    if (serverType === 'cpu') {
        const frequency = parseFloat(document.getElementById('frequency').value) || 0;
        const threads = parseFloat(document.getElementById('threads').value) || 0;
        const qpc = parseFloat(document.getElementById('qpc').value) || 0;

        processingRate = frequency * threads * qpc; // Convertendo para bits/s
    } else if (serverType === 'ram') {
        const frequencyGHz = parseFloat(document.getElementById('frequency').value) || 0;
        const bandwidth = parseFloat(document.getElementById('bandwidth').value) || 0;
        console.log("ram",frequencyGHz, bandwidth);
        processingRate = (frequencyGHz * bandwidth) / 8; // Convertendo para bits/s
    }

    if (processingRate > 0) {
        console.log("Define Server",processingRate, packageSizeBits);
        mu = processingRate*1024 / packageSizeBits; // Taxa de serviço (pacotes/segundo) onde 1024 mb = 1gb
        document.getElementById('muValue').textContent = mu.toFixed(5);
        document.getElementById('muResult').classList.remove('d-none');
    } else {
        alert("Por favor, preencha todos os campos necessários para o cálculo.");
    }
});
