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

document.getElementById('themeSwitch').addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.setAttribute('data-bs-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    }
});

