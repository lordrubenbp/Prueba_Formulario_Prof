function initializeAdvancedOptions() {
    // Cache DOM elements
    const elements = {
        toggleBtn: document.getElementById('toggleAdvancedOptions'),
        optionsDiv: document.getElementById('advancedOptions'),
        sliders: document.querySelectorAll('input[type="range"]')
    };

    // Check if required elements exist
    if (!elements.toggleBtn || !elements.optionsDiv) {
        console.error('Advanced options elements not found in the DOM');
        return;
    }

    // Toggle advanced options visibility with animation
    elements.toggleBtn.addEventListener('click', () => {
        // Determine if panel is currently hidden
        const isHidden = !elements.optionsDiv.classList.contains('show');
        
        // Toggle class for animation
        if (isHidden) {
            elements.optionsDiv.classList.add('show');
            elements.toggleBtn.classList.add('expanded');
            elements.toggleBtn.setAttribute('aria-expanded', 'true');
            elements.toggleBtn.innerHTML = '<i class="fas fa-sliders-h me-2"></i>Ocultar opciones avanzadas';
            
            // Scroll to make options visible after a brief delay
            setTimeout(() => {
                elements.optionsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);
        } else {
            elements.optionsDiv.classList.remove('show');
            elements.toggleBtn.classList.remove('expanded');
            elements.toggleBtn.setAttribute('aria-expanded', 'false');
            elements.toggleBtn.innerHTML = '<i class="fas fa-sliders-h me-2"></i>Mostrar opciones avanzadas';
        }
    });

    // Initialize slider value displays
    if (elements.sliders.length > 0) {
        elements.sliders.forEach(initializeSlider);
    }

    // Advanced field configuration
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

    // Initialize checkbox controls for fields
    advancedFields.forEach(({ checkbox, field }) => {
        const checkboxElem = document.getElementById(checkbox);
        if (!checkboxElem) {
            console.warn(`Checkbox element ${checkbox} not found`);
            return;
        }
        
        // Set up checkbox change handler with keyboard support
        checkboxElem.addEventListener('change', function() {
            toggleFieldState(field, this.checked);
        });
        
        // Initialize field state
        toggleFieldState(field, checkboxElem.checked);
    });
}

/**
 * Initialize a slider with its value display
 * @param {HTMLInputElement} slider - The slider element
 */
function initializeSlider(slider) {
    const valueDisplay = document.getElementById(`${slider.id}Value`);
    if (!valueDisplay) {
        console.warn(`Value display for slider ${slider.id} not found`);
        return;
    }
    
    // Set initial value and add event listener
    valueDisplay.textContent = slider.value;
    
    // Use input event for real-time updates during sliding
    slider.addEventListener('input', () => {
        valueDisplay.textContent = slider.value;
    });
    
    // Add keyboard accessibility
    slider.addEventListener('keydown', (e) => {
        // Announce value changes when using keyboard
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            setTimeout(() => {
                valueDisplay.textContent = slider.value;
                // Optional: add ARIA live announcement here
            }, 10);
        }
    });
}

/**
 * Toggle the enabled/disabled state of a field
 * @param {string} fieldId - ID of the field to toggle
 * @param {boolean} enabled - Whether the field should be enabled
 */
function toggleFieldState(fieldId, enabled) {
    const inputField = document.getElementById(fieldId);
    if (!inputField) {
        console.warn(`Field element ${fieldId} not found`);
        return;
    }
    
    inputField.disabled = !enabled;
    if (enabled) {
        inputField.setAttribute('aria-disabled', 'false');
    } else {
        inputField.setAttribute('aria-disabled', 'true');
    }
}

function activateAdvancedFields(config) {
    try {
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
                const checkbox = document.getElementById(`${field}Checkbox`);
                const inputField = document.getElementById(field);
                const valueDisplay = document.getElementById(`${field}Value`);
                
                if (checkbox) checkbox.checked = true;
                if (inputField) {
                    inputField.disabled = false;
                    inputField.value = value;
                    inputField.setAttribute('aria-disabled', 'false');
                }
                if (valueDisplay) valueDisplay.textContent = value;
            }
        });
    
        const advancedOptionsDiv = document.getElementById('advancedOptions');
        const toggleBtn = document.getElementById('toggleAdvancedOptions');
        
        if (advancedOptionsDiv) {
            advancedOptionsDiv.classList.add('show');
        }
        
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-sliders-h me-2"></i>Ocultar opciones avanzadas';
            toggleBtn.classList.add('expanded');
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
    } catch (error) {
        console.error('Error activating advanced fields:', error);
    }
}

function deactivateAdvancedFields() {
    try {
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
                inputField.setAttribute('aria-disabled', 'true');
            }
            if (valueDisplay) valueDisplay.textContent = '';
        });
    
        const advancedOptionsDiv = document.getElementById('advancedOptions');
        const toggleBtn = document.getElementById('toggleAdvancedOptions');
        
        if (advancedOptionsDiv) {
            advancedOptionsDiv.classList.remove('show');
        }
        
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-sliders-h me-2"></i>Mostrar opciones avanzadas';
            toggleBtn.classList.remove('expanded');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    } catch (error) {
        console.error('Error deactivating advanced fields:', error);
    }
}
