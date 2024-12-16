let lambda = 0; // Taxa de chegada de pacotes
let packageSizeBits = 0; // Tamanho do pacote em bits

document.getElementById('calculateLambda').addEventListener('click', () => {
    const packagesPerMonth = parseFloat(document.getElementById('packagesPerMonth').value) || 0;
    const packageSizeMB = parseFloat(document.getElementById('packageSize').value) || 0;

    lambda = packagesPerMonth / (30 * 24 * 60 * 60); // Pacotes por segundo
    packageSizeBits = packageSizeMB * 8 * 1e6; // Convertendo MB para bits
    console.log(`DefinePackage: lambda: ${lambda}, packageSizeBits: ${packageSizeBits}`);
    document.getElementById('lambdaValue').textContent = lambda.toFixed(5);
    document.getElementById('lambdaResult').classList.remove('d-none');
});
