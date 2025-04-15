import { activateAdvancedFields, deactivateAdvancedFields } from './advancedOptions.js';

const fields = ['role', 'action', 'conditions', 'additionalGuidance', 'formatRestrictions', 'temperature', 'diversityPenalty', 'topP', 'repetitionPenalty', 'maxTokens'];

export function initializeFormHandlers() {
    document.getElementById('preconfig').addEventListener('change', handlePreconfigChange);
    document.getElementById('infoForm').addEventListener('submit', handleSubmit);
    document.getElementById('additionalGuidanceCheckbox').addEventListener('change', handleAdditionalGuidanceChange);
    document.getElementById('evaluateButton').addEventListener('click', handleEvaluatePrompt);
    document.getElementById('copyButton').addEventListener('click', copyText);
    document.getElementById('cleanButton').addEventListener('click', resetForm);
    
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
    const evaluateButton = document.getElementById('evaluateButton');
    const text = outputContainer.innerText.trim();

    if (text === '') {
        copyButton.disabled = true;
        copyButton.classList.add('disabled');
        cleanButton.disabled = true;
        cleanButton.classList.add('disabled');
        evaluateButton.disabled = true;
        evaluateButton.classList.add('disabled');
    } else {
        copyButton.disabled = false;
        copyButton.classList.remove('disabled');
        cleanButton.disabled = false;
        cleanButton.classList.remove('disabled');
        evaluateButton.disabled = false;
        evaluateButton.classList.remove('disabled');
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

    // Limpiar campos dinámicos
    roleFields.innerHTML = '';
    conditionsFields.innerHTML = '';
    formatFields.innerHTML = '';
    actionFields.innerHTML = '';

    if (preconfig && window.preconfigurations && window.preconfigurations[preconfig]) {
        const config = window.preconfigurations[preconfig];

        console.log(config);

        activateAdvancedFields(config);

        // Aplicar valores a campos ocultos
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
            document.getElementById('additionalGuidanceCheckbox').checked = true;
        } else {
            document.getElementById('additionalGuidance').value = '';
            document.getElementById('additionalGuidanceCheckbox').checked = false;
        }

        // Crear campos dinámicos primero
        createDynamicFields('role', config.role, roleFields);
        createDynamicFields('conditions', config.conditions, conditionsFields);
        createDynamicFields('formatRestrictions', config.formatRestrictions, formatFields);
        createDynamicFields('action', config.action, actionFields);

        // Mostrar contenedores de campos dinámicos
        roleFields.style.display = 'block';
        conditionsFields.style.display = 'block';
        formatFields.style.display = 'block';
        actionFields.style.display = 'block';

        // Al final, ocultar los campos de texto originales
        document.querySelectorAll('.form-main-field').forEach(section => {
            // Ocultar solo los campos de texto, pero no sus contenedores de campos dinámicos
            const textareas = section.querySelectorAll('textarea');
            const labels = section.querySelectorAll('label:not([for^="roleFields"]):not([for^="actionFields"]):not([for^="conditionsFields"]):not([for^="formatFields"])');
            const helpTexts = section.querySelectorAll('small:not(.dynamic-field-help)');
            
            textareas.forEach(el => el.style.display = 'none');
            labels.forEach(el => el.style.display = 'none');
            helpTexts.forEach(el => el.style.display = 'none');
            
            // Importante: NO ocultamos la sección completa para que los campos dinámicos sigan visibles
        });

    } else {
        // Restablecer la visualización normal cuando no hay plantilla seleccionada
        document.querySelectorAll('.form-main-field').forEach(section => {
            section.querySelectorAll('*').forEach(el => {
                el.style.display = ''; // Restaurar a los valores por defecto
            });
        });

        resetForm();
    }
}

function createDynamicFields(fieldType, template, container) {
    const matches = template.match(/{{(.*?)}}/g);
    if (matches) {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'dynamic-fields p-3 border rounded mb-4';
        
        // Añadir tema oscuro compatible
        if (document.documentElement.getAttribute('data-bs-theme') === 'dark') {
            fieldGroup.classList.add('bg-dark');
        } else {
            fieldGroup.classList.add('bg-light');
        }
        
        // Create a visual representation of the template with placeholder buttons
        const templatePreview = document.createElement('div');
        templatePreview.className = 'mb-4 p-3 border rounded bg-white text-dark';
        if (document.documentElement.getAttribute('data-bs-theme') === 'dark') {
            templatePreview.classList.remove('bg-white', 'text-dark');
            templatePreview.classList.add('bg-dark', 'text-light');
        }
        
        // Create template preview with non-interactive buttons
        let previewHTML = template;
        matches.forEach(match => {
            const cleanText = match.replace(/{{|}}/g, '').trim();
            const fieldName = cleanText.split(":")[0].trim();
            const btnClass = document.documentElement.getAttribute('data-bs-theme') === 'dark' 
                ? 'btn-outline-light' 
                : 'btn-outline-primary';
            previewHTML = previewHTML.replace(
                match, 
                `<span class="btn ${btnClass} btn-sm disabled mb-1 me-1" style="cursor: not-allowed; pointer-events: none;">${fieldName}</span>`
            );
        });
        
        templatePreview.innerHTML = `
            <div class="mb-2"><small class="text-muted"><i class="fas fa-eye me-2"></i>Vista previa:</small></div>
            <div>${previewHTML}</div>
        `;
        fieldGroup.appendChild(templatePreview);
        
        // Add header for dynamic fields
        const header = document.createElement('h6');
        header.className = 'mb-3 text-primary';
        header.innerHTML = '<i class="fas fa-edit me-2"></i>Complete los campos a continuación:';
        fieldGroup.appendChild(header);
        
        // Create fields
        matches.forEach(match => {
            const cleanText = match.replace(/{{|}}/g, '').trim();
            const fieldParts = cleanText.split(":");
            const fieldName = fieldParts[0].trim();
            const fieldType = fieldParts.length > 1 ? fieldParts[1].trim() : 'text';
            
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'mb-3';
            
            const label = document.createElement('label');
            label.className = 'form-label fw-bold';
            label.textContent = fieldName;
            
            // Crear la entrada de forma sencilla sin botones no seleccionables
            const input = document.createElement('input');
            input.type = fieldType === 'textarea' ? 'text' : fieldType;
            input.className = 'form-control';
            input.placeholder = `Introduzca ${fieldName}...`;
            input.dataset.template = match;
            
            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
            
            // Agregar una descripción del tipo de campo
            const helpText = document.createElement('small');
            helpText.className = 'form-text text-muted mt-1';
            helpText.textContent = getFieldTypeDescription(fieldType);
            fieldContainer.appendChild(helpText);
            
            fieldGroup.appendChild(fieldContainer);
        });
        
        container.appendChild(fieldGroup);
        
        // Asegurarse de que el contenedor sea visible
        container.style.display = 'block';
    }
}

// Función auxiliar para obtener una descripción del tipo de campo
function getFieldTypeDescription(fieldType) {
    switch(fieldType) {
        case 'text':
            return 'Texto corto (palabras o frases)';
        case 'textarea':
            return 'Texto largo (párrafos o descripciones detalladas)';
        case 'number':
            return 'Valor numérico';
        default:
            return 'Campo de texto';
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
        { checkbox: 'temperatureCheckbox', field: 'temperature', label: 'Temperatura' },
        { checkbox: 'diversityPenaltyCheckbox', field: 'diversityPenalty', label: 'Presence Penalty' },
        { checkbox: 'maxTokensCheckbox', field: 'maxTokens', label: 'Max Tokens' },
        { checkbox: 'topPCheckbox', field: 'topP', label: 'Top-p' },
        { checkbox: 'repetitionPenaltyCheckbox', field: 'repetitionPenalty', label: 'Frequency Penalty' }
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

function handleEvaluatePrompt() {
    const outputContainer = document.getElementById('outputContainer');
    const promptText = outputContainer.innerText.trim();
    const evaluateButton = document.getElementById('evaluateButton');
    
    if (!promptText) {
        alert('No hay ningún prompt generado para evaluar.');
        return;
    }
    
    // Mostrar un indicador de carga
    const originalContent = evaluateButton.querySelector('.btn-content').innerHTML;
    evaluateButton.querySelector('.btn-content').innerHTML = '<div class="spinner-border spinner-border-sm text-light me-2" role="status"><span class="visually-hidden">Cargando...</span></div><span>Evaluando...</span>';
    evaluateButton.disabled = true;
    
    // Obtener la API key que el usuario ingresó para la generación automática
    const apiKey = document.getElementById('apiKey').value;
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
        alert('Por favor, ingrese una API key válida de OpenAI para evaluar el prompt.');
        
        // Restaurar el botón
        evaluateButton.querySelector('.btn-content').innerHTML = originalContent;
        evaluateButton.disabled = false;
        return;
    }

    // Preparar la evaluación
    const promptToEvaluate = {
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: "Eres un ingeniero experto en la redacción de prompts eficientes para IA. Tu trabajo es evaluar prompts y proporcionar retroalimentación constructiva para mejorarlos. Analiza el prompt considerando su claridad, estructura, especificidad, posibles ambigüedades y áreas de mejora. Da una calificación general del 1 al 10 y sugiere cambios concretos que mejoren su eficacia."
            },
            {
                role: "user",
                content: `Por favor, evalúa este prompt y sugiere mejoras:\n\n${promptText}`
            }
        ]
    };
    
    // Realizar la solicitud a la API de OpenAI
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(promptToEvaluate)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Mostrar la evaluación en una ventana modal
        displayEvaluation(data.choices[0].message.content);
    })
    .catch(error => {
        console.error('Error al evaluar el prompt:', error);
        alert(`Error al evaluar el prompt: ${error.message}`);
    })
    .finally(() => {
        // Restaurar el botón
        evaluateButton.querySelector('.btn-content').innerHTML = originalContent;
        evaluateButton.disabled = false;
    });
}

function displayEvaluation(evaluationText) {
    // Crear modal para mostrar la evaluación
    const modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'evaluationModal';
    modalEl.tabIndex = '-1';
    modalEl.setAttribute('aria-labelledby', 'evaluationModalLabel');
    modalEl.setAttribute('aria-hidden', 'true');
    
    // Estructurar el contenido de la evaluación (formato markdown)
    // Convertimos los saltos de línea en etiquetas <br>
    const formattedText = evaluationText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrita
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Cursiva
        .replace(/\n\n/g, '</p><p>') // Párrafos
        .replace(/\n/g, '<br>'); // Saltos de línea
    
    modalEl.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="evaluationModalLabel">
                        <i class="fas fa-star me-2"></i>Evaluación del Prompt
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="evaluation-content">
                        <p>${formattedText}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary" id="copyEvaluationBtn">
                        <i class="fas fa-copy me-2"></i>Copiar evaluación
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalEl);
    
    // Mostrar el modal
    const evaluationModal = new bootstrap.Modal(document.getElementById('evaluationModal'));
    evaluationModal.show();
    
    // Configurar el botón para copiar la evaluación
    document.getElementById('copyEvaluationBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(evaluationText)
            .then(() => {
                // Cambiar temporalmente el botón para dar feedback visual
                const copyBtn = document.getElementById('copyEvaluationBtn');
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check me-2"></i>¡Copiado!';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                }, 2000);
            })
            .catch(err => console.error('Error al copiar la evaluación:', err));
    });
    
    // Eliminar el modal del DOM cuando se cierre
    document.getElementById('evaluationModal').addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(document.getElementById('evaluationModal'));
    });
}