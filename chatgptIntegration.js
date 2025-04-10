/**
 * chatgptIntegration.js - Integración directa con ChatGPT
 * Permite probar directamente el prompt generado en ChatGPT.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el botón para probar en ChatGPT
    initializeChatGPTIntegration();

    // Comprobar estado del botón al cargar la página
    checkTestButtonState();

    // Si el contenido de outputContainer cambia dinámicamente, observa los cambios
    const observer = new MutationObserver(checkTestButtonState);
    observer.observe(document.getElementById('outputContainer'), { childList: true, subtree: true });
});

/**
 * Inicializa la funcionalidad de integración con ChatGPT
 */
function initializeChatGPTIntegration() {
    const testPromptButton = document.getElementById('testPromptButton');
    
    if (testPromptButton) {
        testPromptButton.addEventListener('click', function() {
            // Obtener el prompt generado
            const outputContainer = document.getElementById('outputContainer');
            const promptText = outputContainer.innerText.trim();
            
            if (!promptText) {
                // Mostrar alerta si no hay prompt generado
                showAlert('warning', 'No hay ningún prompt generado para probar en ChatGPT.');
                return;
            }
            
            // Enviar a ChatGPT
            sendToOpenAI(promptText);
        });
        
        // Añadir efectos visuales al botón
        testPromptButton.addEventListener('mouseover', function() {
            this.classList.add('btn-test-hover');
        });
        
        testPromptButton.addEventListener('mouseout', function() {
            this.classList.remove('btn-test-hover');
        });
        
        testPromptButton.addEventListener('click', function() {
            if (document.getElementById('outputContainer').innerText.trim() !== '') {
                this.classList.add('btn-test-active');
                
                setTimeout(() => {
                    this.classList.remove('btn-test-active');
                }, 1000);
            }
        });
    }
}

/**
 * Verifica el estado del botón para habilitarlo o deshabilitarlo
 */
function checkTestButtonState() {
    const outputContainer = document.getElementById('outputContainer');
    const testPromptButton = document.getElementById('testPromptButton');
    const text = outputContainer.innerText.trim();

    if (text === '') {
        testPromptButton.disabled = true;
        testPromptButton.classList.add('disabled');
    } else {
        testPromptButton.disabled = false;
        testPromptButton.classList.remove('disabled');
    }
}

/**
 * Envía el prompt a OpenAI (ChatGPT)
 * @param {string} promptText - El texto del prompt a enviar
 */
function sendToOpenAI(promptText) {
    // URL de ChatGPT con el prompt codificado
    const chatgptURL = `https://chat.openai.com/?model=gpt-4`;
    
    // Abrir una nueva ventana/pestaña con ChatGPT
    const newWindow = window.open(chatgptURL, '_blank');
    
    if (newWindow) {
        // Mostrar modal con instrucciones
        showInstructionsModal(promptText);
    } else {
        // Si el navegador bloquea la ventana emergente
        showAlert('danger', 'El navegador ha bloqueado la ventana emergente. Por favor, permite las ventanas emergentes para este sitio e intenta de nuevo.');
    }
}

/**
 * Muestra un modal con instrucciones para el usuario
 * @param {string} promptText - El texto del prompt a copiar
 */
function showInstructionsModal(promptText) {
    // Crea un elemento modal
    const modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'chatgptInstructionsModal';
    modalEl.tabIndex = '-1';
    modalEl.setAttribute('aria-labelledby', 'chatgptInstructionsModalLabel');
    modalEl.setAttribute('aria-hidden', 'true');
    
    modalEl.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title" id="chatgptInstructionsModalLabel">
                        <i class="fas fa-info-circle me-2"></i>Prueba tu prompt en ChatGPT
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Se ha abierto una nueva pestaña con ChatGPT. Sigue los pasos a continuación para probar tu prompt.
                    </div>
                    
                    <ol class="instruction-steps">
                        <li>Espera a que ChatGPT cargue completamente en la nueva pestaña</li>
                        <li>Una vez cargado, pega el siguiente prompt en el campo de entrada:</li>
                    </ol>
                    
                    <div class="border rounded p-3 bg-light mb-3">
                        <pre class="mb-0" id="promptPreview">${promptText}</pre>
                    </div>
                    
                    <p class="mb-0">Verás los resultados de tu prompt directamente en la interfaz de ChatGPT.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-success" id="copyChatGPTPromptBtn">
                        <i class="fas fa-copy me-2"></i>Copiar prompt
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalEl);
    
    // Mostrar el modal
    const instructionsModal = new bootstrap.Modal(document.getElementById('chatgptInstructionsModal'));
    instructionsModal.show();
    
    // Configurar el botón para copiar el prompt
    document.getElementById('copyChatGPTPromptBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(promptText)
            .then(() => {
                // Cambiar temporalmente el botón para dar feedback visual
                const copyBtn = document.getElementById('copyChatGPTPromptBtn');
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check me-2"></i>¡Copiado!';
                copyBtn.classList.add('btn-outline-success');
                copyBtn.classList.remove('btn-success');
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.classList.remove('btn-outline-success');
                    copyBtn.classList.add('btn-success');
                }, 2000);
            })
            .catch(err => {
                console.error('Error al copiar el prompt:', err);
                showAlert('danger', 'Error al copiar el prompt al portapapeles.');
            });
    });
    
    // Eliminar el modal del DOM cuando se cierre
    document.getElementById('chatgptInstructionsModal').addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(document.getElementById('chatgptInstructionsModal'));
    });
}

/**
 * Muestra una alerta al usuario
 * @param {string} type - Tipo de alerta (success, warning, danger, info)
 * @param {string} message - Mensaje a mostrar
 */
function showAlert(type, message) {
    // Crear elemento de alerta
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type} alert-dismissible fade show position-fixed bottom-0 end-0 m-3`;
    alertEl.role = 'alert';
    alertEl.style.zIndex = '9999';
    alertEl.style.maxWidth = '400px';
    
    alertEl.innerHTML = `
        <div class="d-flex">
            <div class="me-3">
                <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : type === 'danger' ? 'times-circle' : 'info-circle'} fa-lg"></i>
            </div>
            <div>
                ${message}
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Añadir al DOM
    document.body.appendChild(alertEl);
    
    // Configurar auto-cierre
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertEl);
        bsAlert.close();
    }, 5000);
    
    // Eliminar del DOM después de cerrarse
    alertEl.addEventListener('closed.bs.alert', () => {
        document.body.removeChild(alertEl);
    });
}