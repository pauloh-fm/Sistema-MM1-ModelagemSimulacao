document.addEventListener('DOMContentLoaded', () => {
    const steps = {
        package: document.getElementById('definePackage'),
        server: document.getElementById('defineServer'),
        simulation: document.getElementById('runSimulation'),
    };

    const stepForms = {
        package: document.getElementById('stepPackage'),
        server: document.getElementById('stepServer'),
    };

    // Mostrar ou ocultar os formulários com base no botão clicado
    function showStepForm(step) {
        document.getElementById('configurationForm').classList.remove('d-none');
        Object.values(stepForms).forEach(form => form.classList.add('d-none')); // Ocultar todos os formulários

        if (step === 'package') {
            stepForms.package.classList.remove('d-none'); // Mostrar Definir Pacote
        } else if (step === 'server') {
            stepForms.server.classList.remove('d-none'); // Mostrar Definir Servidor
        }
    }

    // Adicionar eventos de clique aos botões
    steps.package.addEventListener('click', () => showStepForm('package'));
    steps.server.addEventListener('click', () => showStepForm('server'));
});
