const fields = ['role', 'action', 'conditions', 'additionalGuidance', 'formatRestrictions', 'temperature', 'diversityPenalty', 'topK', 'topP', 'repetitionPenalty', 'lengthPenalty', 'promptImportance', 'maxTokens'];

function initializeFormHandlers() {
    document.getElementById('preconfig').addEventListener('change', handlePreconfigChange);
    document.getElementById('infoForm').addEventListener('submit', handleSubmit);
    document.getElementById('additionalGuidanceCheckbox').addEventListener('change', handleAdditionalGuidanceChange);
    
    // Add animation class to form sections for fade-in effect
    document.querySelectorAll('.form-section').forEach((section, index) => {
        section.style.opacity = '0';
        section.style.animation = `fadeIn 0.5s ease forwards ${0.1 * index}s`;
    });

    initializeButtonEffects();
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
        copyButton.classList.add('disabled');
        cleanButton.disabled = true;
        cleanButton.classList.add('disabled');
    } else {
        copyButton.disabled = false;
        copyButton.classList.remove('disabled');
        cleanButton.disabled = false;
        cleanButton.classList.remove('disabled');
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
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'dynamic-fields p-3 border rounded bg-light';
        
        // Add header for dynamic fields
        const header = document.createElement('h6');
        header.className = 'mb-3 text-primary';
        header.innerHTML = '<i class="fas fa-edit me-2"></i>Complete los campos a continuación:';
        fieldGroup.appendChild(header);
        
        // Create fields
        matches.forEach(match => {
            const cleanText = match.replace(/{{|}}/g, '').trim();
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'mb-3';
            
            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = cleanText.split(":")[0].trim();
            
            const input = document.createElement('input');
            input.type = cleanText.split(":")[1].trim();
            input.className = 'form-control mb-2';
            input.placeholder = `Introduzca ${cleanText.split(":")[0].trim()}...`;
            input.dataset.template = match;
            
            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
            fieldGroup.appendChild(fieldContainer);
        });
        
        container.appendChild(fieldGroup);
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
    const text = outputContainer.innerText.trim();
    const copyButton = document.getElementById('copyButton');

    if (text === '') {
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        // Cambiar temporalmente el botón para dar feedback visual
        const originalContent = copyButton.querySelector('.btn-content').innerHTML;
        copyButton.querySelector('.btn-content').innerHTML = '<i class="fas fa-check me-2"></i><span>¡Copiado!</span>';
        copyButton.classList.add('btn-copy-success');
        
        setTimeout(() => {
            copyButton.querySelector('.btn-content').innerHTML = originalContent;
            copyButton.classList.remove('btn-copy-success');
        }, 2000);
        
        // Notificación estilo toast
        const toastEl = document.createElement('div');
        toastEl.className = 'position-fixed bottom-0 end-0 p-3';
        toastEl.style.zIndex = '5';
        toastEl.innerHTML = `
            <div id="copyToast" class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-check-circle me-2"></i>Texto copiado al portapapeles
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        document.body.appendChild(toastEl);
        
        const toast = new bootstrap.Toast(document.getElementById('copyToast'));
        toast.show();
        
        // Remove toast element after it's hidden
        setTimeout(() => {
            document.body.removeChild(toastEl);
        }, 3000);
    }).catch(err => {
        console.error('Error al copiar el texto: ', err);
        alert('Error al copiar al portapapeles: ' + err);
    });
}

function resetForm() {
    // Mostrar confirmación solo si hay contenido
    if (document.getElementById('outputContainer').innerText.trim() !== '') {
        if (!confirm('¿Estás seguro de que deseas limpiar todos los campos?')) {
            return;
        }
    }
    
    // Añadir animación de limpieza
    const cleanButton = document.getElementById('cleanButton');
    cleanButton.classList.add('btn-clean-active');
    
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
    
    // Desactivar los botones
    checkOutputContainer();
    
    // Eliminar la clase activa después de la animación
    setTimeout(() => {
        cleanButton.classList.remove('btn-clean-active');
    }, 500);
}

function allRequiredFieldsFilled() {
    const roleFields = document.getElementById('roleFields');
    const actionFields = document.getElementById('actionFields');
    const conditionsFields = document.getElementById('conditionsFields');
    const formatFields = document.getElementById('formatFields');

    const allFields = [...roleFields.querySelectorAll('input'), ...conditionsFields.querySelectorAll('input'), ...formatFields.querySelectorAll('input'), ...actionFields.querySelectorAll('input')];
    return allFields.every(input => input.value.trim() !== '');
}

// Añadir efectos visuales al botón de generar texto
function initializeButtonEffects() {
    const generateButton = document.getElementById('generateButton');
    
    if (generateButton) {
        generateButton.addEventListener('click', function() {
            // La animación se disparará con CSS cuando el formulario sea válido
            if (allRequiredFieldsFilled()) {
                this.classList.add('btn-generate-active');
                
                setTimeout(() => {
                    this.classList.remove('btn-generate-active');
                }, 1000);
            }
        });
    }
}