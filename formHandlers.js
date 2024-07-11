const fields = ['role', 'action', 'conditions', 'additionalGuidance', 'formatRestrictions', 'temperature', 'diversityPenalty', 'topK', 'topP', 'repetitionPenalty', 'lengthPenalty', 'promptImportance', 'maxTokens'];

function initializeFormHandlers() {
    document.getElementById('preconfig').addEventListener('change', handlePreconfigChange);
    document.getElementById('infoForm').addEventListener('submit', handleSubmit);
    document.getElementById('additionalGuidanceCheckbox').addEventListener('change', handleAdditionalGuidanceChange);
}

document.addEventListener('DOMContentLoaded', (event) => {
    checkOutputContainer();

    // Si el contenido de outputContainer cambia dinámicamente, observa los cambios.
    const observer = new MutationObserver(checkOutputContainer);
    observer.observe(document.getElementById('outputContainer'), { childList: true, subtree: true });
});

function checkOutputContainer() {
    const outputContainer = document.getElementById('outputContainer');
    const copyButton = document.getElementById('copyButton');
    const cleanButton = document.getElementById('cleanButton');
    const text = outputContainer.innerText.trim();

    if (text === '') {
        copyButton.disabled = true;
        copyButton.className = 'btn btn-secondary btn-lg mr-2';
        cleanButton.disabled = true;
        cleanButton.className = 'btn btn-secondary btn-lg mr-2';
    } else {
        copyButton.disabled = false;
        copyButton.className = 'btn btn-primary btn-lg mr-2';
        cleanButton.disabled = false;
        cleanButton.className = 'btn btn-primary btn-lg mr-2';
    }
}

function cleanConfigValue(value) {

    try {
    let regex = /\{\{([^:}]+):[^}]+\}\}/g;
    return value.replace(regex, (match, p1) => `{{${p1}}}`);
    }catch(error){

    return value;
    }
}

function handlePreconfigChange() {

    document.getElementById('outputContainer').innerText = '';

    const preconfig = this.value;
    const roleFields = document.getElementById('roleFields');
    const conditionsFields = document.getElementById('conditionsFields');
    const formatFields = document.getElementById('formatFields');
    const actionFields = document.getElementById('actionFields');

    roleFields.innerHTML = ''; // Limpiar campos
    conditionsFields.innerHTML = ''; // Limpiar campos
    formatFields.innerHTML = ''; // Limpiar campos
    actionFields.innerHTML = ''; // Limpiar campos

    if (preconfig && window.preconfigurations && window.preconfigurations[preconfig]) {
        const config = window.preconfigurations[preconfig];

        console.log(config);

        activateAdvancedFields(config);

        fields.forEach(field => {
            if (config[field] !== undefined) {
                const element = document.getElementById(field);
                if (element) {
                    element.value = cleanConfigValue(config[field]);
                    element.readOnly = true;
                }
            }
        });

        if (config.additionalGuidance !== undefined) {
            console.log
            document.getElementById('additionalGuidanceCheckbox').checked = true;
        }else{

            document.getElementById('additionalGuidance').value ='';
            document.getElementById('additionalGuidanceCheckbox').checked = false;
        }

        // Crear campos dinámicos
        createDynamicFields('role', config.role, roleFields);
        createDynamicFields('conditions', config.conditions, conditionsFields);
        createDynamicFields('formatRestrictions', config.formatRestrictions, formatFields);
        createDynamicFields('action', config.action, actionFields);

        roleFields.style.display = 'block';
        conditionsFields.style.display = 'block';
        formatFields.style.display = 'block';
        actionFields.style.display = 'block';

    } else {

        resetForm();

    }
}

function createDynamicFields(fieldType, template, container) {
    const matches = template.match(/{{(.*?)}}/g);
    if (matches) {
        matches.forEach(match => {
            const cleanText = match.replace(/{{|}}/g, '').trim();
            const input = document.createElement('input');
            input.type = cleanText.split(":")[1].trim();
            input.className = 'form-control form-control-sm mt-2';
            input.placeholder = cleanText.split(":")[0].trim();;
            input.dataset.template = match;
            container.appendChild(input);
        });
    }
}



function handleAdditionalGuidanceChange() {
    const additionalGuidance = document.getElementById('additionalGuidance');
    additionalGuidance.disabled = !this.checked;
    if (!this.checked) {
        additionalGuidance.value = '';
    }
}

function handleSubmit(event) {
    event.preventDefault();

    const preconfig = document.getElementById('preconfig').value;
    if (preconfig && !allRequiredFieldsFilled()) {
        alert('Por favor, complete todos los campos requeridos antes de generar el texto.');
        return;
    }

    let outputText = generateOutputText(preconfig);

    const advancedFields = [
        { checkbox: 'temperatureCheckbox', field: 'temperature', label: 'Grado de temperatura' },
        { checkbox: 'diversityPenaltyCheckbox', field: 'diversityPenalty', label: 'Diversity Penalty' },
        { checkbox: 'maxTokensCheckbox', field: 'maxTokens', label: 'Max Tokens' },
        { checkbox: 'topKCheckbox', field: 'topK', label: 'Top-k' },
        { checkbox: 'topPCheckbox', field: 'topP', label: 'Top-p' },
        { checkbox: 'repetitionPenaltyCheckbox', field: 'repetitionPenalty', label: 'Repetition Penalty' },
        { checkbox: 'lengthPenaltyCheckbox', field: 'lengthPenalty', label: 'Length Penalty' },
        { checkbox: 'promptImportanceCheckbox', field: 'promptImportance', label: 'Prompt Importance' }
    ];

    advancedFields.forEach(({ checkbox, field, label }) => {
        if (document.getElementById(checkbox).checked) {
            outputText += `\n${label}: ${document.getElementById(field).value}`;
        }
    });

    document.getElementById('outputContainer').innerText = outputText;
}

function generateOutputText(preconfig) {
    let outputText = '';

    if (preconfig) {
        const config = window.preconfigurations[preconfig];
        let role = config.role;
        let conditions = config.conditions;
        let action = config.action;
        let formatRestrictions = config.formatRestrictions;

        role = replacePlaceholders(role, 'roleFields');
        conditions = replacePlaceholders(conditions, 'conditionsFields');
        action = replacePlaceholders(action, 'actionFields');
        formatRestrictions = replacePlaceholders(formatRestrictions, 'formatFields');

        outputText = `Rol: ${role}\nAcción: ${action}\nCondiciones: ${conditions}\nRestricciones obligatorias del formato: ${formatRestrictions}`;
    } else {
        outputText = `Rol: ${document.getElementById('role').value}\nAcción: ${document.getElementById('action').value}\nCondiciones: ${document.getElementById('conditions').value}\nRestricciones obligatorias del formato: ${document.getElementById('formatRestrictions').value}`;
    }

    if (document.getElementById('additionalGuidanceCheckbox').checked) {
        outputText += `\nOrientación adicional: ${document.getElementById('additionalGuidance').value}`;
    }

    return outputText;
}

function replacePlaceholders(template, containerId) {
    const container = document.getElementById(containerId);
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        template = template.replace(input.dataset.template, input.value);
    });
    return template;
}



function copyText() {
    const outputContainer = document.getElementById('outputContainer');
    const text = outputContainer.innerText.trim(); // Eliminar espacios en blanco

    if (text === '') {
        return; // No copiar ni mostrar mensajes si no hay texto
    }

    navigator.clipboard.writeText(text).then(() => {
        alert('Texto copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar el texto: ', err);
    });
}

function resetForm() {
    document.getElementById('infoForm').reset();
    document.getElementById('outputContainer').innerText = '';

    // Ocultar y limpiar campos dinámicos
    document.getElementById('roleFields').innerHTML = '';
    document.getElementById('conditionsFields').innerHTML = '';
    document.getElementById('formatFields').innerHTML = '';
    document.getElementById('actionFields').innerHTML = '';

    document.getElementById('toggleAdvancedOptions').textContent = 'Mostrar opciones avanzadas';
    
    deactivateAdvancedFields();

    // Desbloquear campos de texto
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.readOnly = false;
        }
    });
}
function allRequiredFieldsFilled() {
    const roleFields = document.getElementById('roleFields');
    const actionFields = document.getElementById('actionFields');
    const conditionsFields = document.getElementById('conditionsFields');
    const formatFields = document.getElementById('formatFields');

    const allFields = [...roleFields.querySelectorAll('input'), ...conditionsFields.querySelectorAll('input'), ...formatFields.querySelectorAll('input'), ...actionFields.querySelectorAll('input')];
    return allFields.every(input => input.value.trim() !== '');
}