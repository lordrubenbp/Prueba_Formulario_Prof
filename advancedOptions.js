function initializeAdvancedOptions() {
    const toggleAdvancedOptionsBtn = document.getElementById('toggleAdvancedOptions');
    const advancedOptionsDiv = document.getElementById('advancedOptions');

    toggleAdvancedOptionsBtn.addEventListener('click', function() {
        if (advancedOptionsDiv.style.display === 'none') {
            advancedOptionsDiv.style.display = 'block';
            toggleAdvancedOptionsBtn.textContent = 'Ocultar opciones avanzadas';
        } else {
            advancedOptionsDiv.style.display = 'none';
            toggleAdvancedOptionsBtn.textContent = 'Mostrar opciones avanzadas';
        }
    });

    // Mostrar valores de los deslizadores
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        const valueDisplay = document.getElementById(`${slider.id}Value`);
        valueDisplay.textContent = slider.value;
        slider.addEventListener('input', function() {
            valueDisplay.textContent = slider.value;
        });
    });

    // Habilitar o deshabilitar campos avanzados según el checkbox
    const advancedFields = [
        { checkbox: 'temperatureCheckbox', field: 'temperature' },
        { checkbox: 'diversityPenaltyCheckbox', field: 'diversityPenalty' },
        { checkbox: 'maxTokensCheckbox', field: 'maxTokens' },
        { checkbox: 'topKCheckbox', field: 'topK' },
        { checkbox: 'topPCheckbox', field: 'topP' },
        { checkbox: 'repetitionPenaltyCheckbox', field: 'repetitionPenalty' },
        { checkbox: 'lengthPenaltyCheckbox', field: 'lengthPenalty' },
        { checkbox: 'promptImportanceCheckbox', field: 'promptImportance' }
    ];

    advancedFields.forEach(({ checkbox, field }) => {
        document.getElementById(checkbox).addEventListener('change', function() {
            const inputField = document.getElementById(field);
            inputField.disabled = !this.checked;
        });
    });
}

function activateAdvancedFields(config) {
    const advancedFields = [
        { field: 'temperature', value: config.temperature },
        { field: 'diversityPenalty', value: config.diversityPenalty },
        { field: 'maxTokens', value: config.maxTokens },
        { field: 'topK', value: config.topK },
        { field: 'topP', value: config.topP },
        { field: 'repetitionPenalty', value: config.repetitionPenalty },
        { field: 'lengthPenalty', value: config.lengthPenalty },
        { field: 'promptImportance', value: config.promptImportance }
    ];

    advancedFields.forEach(({ field, value }) => {
        if (value !== undefined) {
            document.getElementById(`${field}Checkbox`).checked = true;
            document.getElementById(field).disabled = false;
            document.getElementById(field).value = value;
            document.getElementById(`${field}Value`).textContent = value;
        }
    });

    document.getElementById('advancedOptions').style.display = 'block';
    document.getElementById('toggleAdvancedOptions').textContent = 'Ocultar opciones avanzadas';
}

function deactivateAdvancedFields() {
    const advancedFields = [
        'temperature',
        'diversityPenalty',
        'maxTokens',
        'topK',
        'topP',
        'repetitionPenalty',
        'lengthPenalty',
        'promptImportance'
    ];

    advancedFields.forEach(field => {
        const checkbox = document.getElementById(`${field}Checkbox`);
        const inputField = document.getElementById(field);
        const valueDisplay = document.getElementById(`${field}Value`);

        if (checkbox) checkbox.checked = false;
        if (inputField) {
            inputField.disabled = true;
            inputField.value = '';
        }
        if (valueDisplay) valueDisplay.textContent = '';
    });

    const advancedOptionsDiv = document.getElementById('advancedOptions');
    const toggleAdvancedOptionsBtn = document.getElementById('toggleAdvancedOptions');
    if (advancedOptionsDiv) advancedOptionsDiv.style.display = 'none';
    if (toggleAdvancedOptionsBtn) toggleAdvancedOptionsBtn.textContent = 'Mostrar opciones avanzadas';
}
