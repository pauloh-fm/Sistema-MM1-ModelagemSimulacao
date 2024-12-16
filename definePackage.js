let lambda = 0; // Taxa de chegada de pacotes
let packageSizeBits = 0; // Tamanho do pacote em bits

document.getElementById('calculateLambda').addEventListener('click', () => {
    const packagesPerMonth = parseFloat(document.getElementById('packagesPerMonth').value) || 0;
    const packageSizeMB = parseFloat(document.getElementById('packageSize').value) || 0;

    // Cálculo
    lambda = packagesPerMonth / (30 * 24 * 60 * 60); // Pacotes por segundo
    packageSizeBits = packageSizeMB * 8 * 1e6; // Convertendo MB para bits

    // Log no console (debug)
    console.log(`DefinePackage: lambda: ${lambda}, packageSizeBits: ${packageSizeBits}`);

    // Atualizar a visualização da equação
    const equationView = `
        <p class="mt-3"><strong>Equação de λ:</strong></p>
        <p>λ = \\( \\frac{${packagesPerMonth}}{30 \\times 24 \\times 60 \\times 60} \\)</p>
        <p>Resultado: λ = <strong>${lambda.toFixed(5)} pacotes/segundo</strong></p>
    `;

    // Inserir no HTML
    const lambdaResult = document.getElementById('lambdaResult');
    lambdaResult.classList.remove('d-none');
    lambdaResult.innerHTML = equationView;

    // Renderizar fórmulas matemáticas usando MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
});
