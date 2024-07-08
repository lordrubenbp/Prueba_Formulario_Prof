document.addEventListener('DOMContentLoaded', function() {
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            window.preconfigurations = data.preconfigurations;
        });

    // Manejo de eventos globales
    initializeAdvancedOptions();
    initializeFormHandlers();
});
