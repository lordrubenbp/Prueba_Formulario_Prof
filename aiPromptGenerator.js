/**
 * AI Prompt Generator Module
 * This module handles interaction with the ChatGPT API to generate prompts from natural language descriptions
 */

// API Configuration - Replace with your actual API key and endpoint
const OPENAI_API_CONFIG = {
    apiKey: '', // Add your OpenAI API key here or get it from environment variables
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o', // Or 'gpt-3.5-turbo' based on your access level
    maxTokens: 1000,
    temperature: 0.7
};

function initializeAIPromptGenerator() {
    const generateBtn = document.getElementById('generatePromptBtn');
    const statusDiv = document.getElementById('generationStatus');
    const apiKeyInput = document.getElementById('apiKey');
    const toggleApiKeyBtn = document.getElementById('toggleApiKey');
    
    if (!generateBtn || !statusDiv) {
        console.error('AI Prompt Generator elements not found');
        return;
    }
    
    // Setup API key toggle visibility
    if (toggleApiKeyBtn && apiKeyInput) {
        toggleApiKeyBtn.addEventListener('click', () => {
            const type = apiKeyInput.type;
            apiKeyInput.type = type === 'password' ? 'text' : 'password';
            toggleApiKeyBtn.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye-slash"></i>' : 
                '<i class="fas fa-eye"></i>';
        });
        
        // Try to load API key from localStorage if user has saved it before
        const savedApiKey = localStorage.getItem('openai_api_key');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
        }
    }
    
    generateBtn.addEventListener('click', async () => {
        const naturalLanguageInput = document.getElementById('naturalLanguageInput').value.trim();
        
        if (!naturalLanguageInput) {
            alert('Por favor, introduce una descripción de lo que quieres hacer');
            return;
        }
        
        // Get API key from input
        if (apiKeyInput) {
            OPENAI_API_CONFIG.apiKey = apiKeyInput.value.trim();
            
            // Ask if user wants to save the API key locally
            if (OPENAI_API_CONFIG.apiKey && !localStorage.getItem('openai_api_key')) {
                if (confirm('¿Deseas guardar tu API key en este dispositivo para futuras consultas?')) {
                    localStorage.setItem('openai_api_key', OPENAI_API_CONFIG.apiKey);
                }
            }
        }
        
        try {
            // Show loading status
            statusDiv.classList.remove('d-none');
            generateBtn.disabled = true;
            
            const generatedPrompt = await generatePromptFromDescription(naturalLanguageInput);
            
            if (generatedPrompt) {
                // Apply generated prompt to form fields
                applyGeneratedPrompt(generatedPrompt);
            }
            
        } catch (error) {
            console.error('Error generating prompt:', error);
            alert(`Error al generar el prompt: ${error.message}`);
        } finally {
            // Hide loading status
            statusDiv.classList.add('d-none');
            generateBtn.disabled = false;
        }
    });
}

/**
 * Validates the API configuration
 * @returns {boolean} Whether the configuration is valid
 */
function validateApiConfig() {
    if (!OPENAI_API_CONFIG.apiKey) {
        console.error('API key is missing. Please add your OpenAI API key to the configuration.');
        return false;
    }
    return true;
}

/**
 * Generates a prompt structure based on the natural language description
 * @param {string} description - User's natural language description
 * @returns {Promise<Object>} - Promise resolving to the generated prompt structure
 */
async function generatePromptFromDescription(description) {
    if (!validateApiConfig()) {
        throw new Error('API not configured properly. Please check the console for details.');
    }

    try {
        // Create message prompt for the API
        const prompt = buildPromptForChatGPT(description);
        
        // Prepare request body - conditionally include response_format
        let requestBody = {
            model: OPENAI_API_CONFIG.model,
            messages: prompt,
            max_tokens: OPENAI_API_CONFIG.maxTokens,
            temperature: OPENAI_API_CONFIG.temperature
        };
        
        // Only add response_format for models that support it (GPT-4 and newer versions)
        if (OPENAI_API_CONFIG.model.includes('gpt-4') || 
            OPENAI_API_CONFIG.model.includes('gpt-3.5-turbo')) {
            // Using try/catch since some older GPT versions might not support this
            try {
                requestBody.response_format = { type: "json_object" };
            } catch (error) {
                console.warn('This model may not support response_format, proceeding without it.');
            }
        }

        // Log the request for debugging
        console.log('API Request:', {
            endpoint: OPENAI_API_CONFIG.endpoint,
            model: OPENAI_API_CONFIG.model,
            body: requestBody
        });
        
        // Call the OpenAI API
        const response = await fetch(OPENAI_API_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_CONFIG.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        // Check if the response is ok
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error Response:', errorData);
            
            // Provide better error messages based on status code
            if (response.status === 401) {
                throw new Error('Error de autenticación: API key inválida o expirada.');
            } else if (response.status === 429) {
                throw new Error('Límite de tasa excedido. Espera un momento e intenta de nuevo.');
            } else if (response.status === 400) {
                // Try to get the specific error message from the response
                const errorMessage = errorData.error?.message || 'Solicitud incorrecta';
                
                // Check for common issues
                if (errorMessage.includes('response_format')) {
                    // If the error is related to response_format, try again without it
                    console.warn('Model does not support response_format, retrying without it');
                    delete requestBody.response_format;
                    
                    const retryResponse = await fetch(OPENAI_API_CONFIG.endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${OPENAI_API_CONFIG.apiKey}`
                        },
                        body: JSON.stringify(requestBody)
                    });
                    
                    if (retryResponse.ok) {
                        return handleSuccessResponse(await retryResponse.json());
                    } else {
                        const retryErrorData = await retryResponse.json().catch(() => ({}));
                        throw new Error(`Error al reintentar: ${retryErrorData.error?.message || 'Error desconocido'}`);
                    }
                } else {
                    throw new Error(`Error de solicitud: ${errorMessage}`);
                }
            } else {
                throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Error desconocido'}`);
            }
        }

        // Parse the API response
        const data = await response.json();
        return handleSuccessResponse(data);
        
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Process a successful API response
 * @param {Object} data - The API response data
 * @returns {Object} - The processed prompt data
 */
function handleSuccessResponse(data) {
    // Extract the generated prompt from the API response
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const generatedContent = data.choices[0].message.content;
        try {
            // Try to parse JSON directly
            const promptData = JSON.parse(generatedContent);
            console.log('Successfully parsed JSON from API response:', promptData);
            return promptData;
        } catch (parseError) {
            console.warn('Error parsing JSON directly, trying fallback methods:', parseError);
            
            // If direct parsing failed, try alternative parsing methods
            try {
                return parseGeneratedPrompt(generatedContent);
            } catch (fallbackError) {
                console.error('All parsing methods failed:', fallbackError);
                throw new Error('No se pudo interpretar la respuesta de la IA. Por favor, inténtalo de nuevo.');
            }
        }
    } else {
        throw new Error('La API no devolvió resultados válidos.');
    }
}

/**
 * Builds the prompt for the ChatGPT API
 * @param {string} description - User's description
 * @returns {Array} - Array of message objects for the API
 */
function buildPromptForChatGPT(description) {
    return [
        {
            role: "system",
            content: `Eres un asistente especializado en generar prompts para ChatGPT. Basándote en la descripción del usuario, vas a crear un prompt estructurado con los siguientes elementos exactos (como propiedades de un objeto JSON):

1. role: Define el rol que debe asumir ChatGPT
2. action: Especifica la acción principal que debe realizar ChatGPT
3. conditions: Incluye condiciones específicas para la tarea
4. formatRestrictions: Reglas específicas sobre el formato de la respuesta
5. additionalGuidance: Orientación adicional (opcional)
6. advancedOptions: Un objeto con parámetros de configuración avanzada que pueden incluir:
   - temperature (entre 0 y 1)
   - diversityPenalty (entre 0 y 2)
   - maxTokens (número entero)
   - topK (entre 1 y 100)
   - topP (entre 0 y 1)
   - repetitionPenalty (entre 1 y 2)
   - lengthPenalty (entre 0 y 2)
   - promptImportance (entre 0 y 5)

IMPORTANTE: 
- Tu respuesta DEBE ser un objeto JSON válido y nada más. No incluyas texto adicional, explicaciones o marcado. El formato debe ser válido para JSON.parse().
- SIEMPRE genera tu respuesta en español, independientemente del idioma utilizado en la solicitud.
- Si la descripción del usuario no proporciona suficiente información para algún campo, utiliza tu mejor juicio para completarlo con valores apropiados en español.
- Todos los textos generados deben estar en español, incluyendo el rol, la acción, las condiciones y las restricciones de formato.`
        },
        {
            role: "user",
            content: description
        }
    ];
}

/**
 * Parses the generated content from the API into a structured prompt object
 * @param {string} content - The generated content from the API
 * @returns {Object} - The structured prompt object
 */
function parseGeneratedPrompt(content) {
    try {
        // Try to extract JSON from the response (in case it contains markdown or other text)
        const jsonContent = content.match(/```json([\s\S]*?)```/) || 
                           content.match(/```([\s\S]*?)```/);
        if (jsonContent && jsonContent[1]) {
            return JSON.parse(jsonContent[1].trim());
        }
        
        // If no JSON block is found, try to parse the entire content
        return JSON.parse(content);
    } catch (error) {
        // If all parsing attempts fail, try to extract fields using regex patterns
        console.error('Error parsing JSON content, attempting regex extraction:', error);
        
        const prompt = {};
        const extractField = (fieldName) => {
            const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
            const match = content.match(regex);
            return match ? match[1] : null;
        };
        
        // Extract basic fields
        prompt.role = extractField('role') || 'Experto en el tema solicitado';
        prompt.action = extractField('action') || 'Generar contenido relevante';
        prompt.conditions = extractField('conditions') || 'Proporcionar información clara y precisa';
        prompt.formatRestrictions = extractField('formatRestrictions') || 'Presentar el contenido de manera estructurada';
        
        // Check if we have extracted enough fields
        if (prompt.role && prompt.action && prompt.formatRestrictions) {
            return prompt;
        }
        
        throw new Error('No se pudo extraer suficiente información del contenido generado');
    }
}

/**
 * Applies the AI-generated prompt to the form fields
 * @param {Object} prompt - The generated prompt structure
 */
function applyGeneratedPrompt(prompt) {
    try {
        // Populate basic text fields
        document.getElementById('role').value = prompt.role || '';
        document.getElementById('action').value = prompt.action || '';
        document.getElementById('conditions').value = prompt.conditions || '';
        document.getElementById('formatRestrictions').value = prompt.formatRestrictions || '';
        
        // Handle additional guidance if present
        if (prompt.additionalGuidance) {
            document.getElementById('additionalGuidanceCheckbox').checked = true;
            document.getElementById('additionalGuidance').disabled = false;
            document.getElementById('additionalGuidance').value = prompt.additionalGuidance;
        }
        
        // Apply advanced options if present
        if (prompt.advancedOptions) {
            const advancedOptions = prompt.advancedOptions;
            
            // Show advanced options
            document.getElementById('advancedOptions').style.display = 'block';
            document.getElementById('toggleAdvancedOptions').textContent = 'Ocultar opciones avanzadas';
            document.getElementById('toggleAdvancedOptions').setAttribute('aria-expanded', 'true');
            
            // Set each advanced option
            const options = [
                { field: 'temperature', value: advancedOptions.temperature },
                { field: 'diversityPenalty', value: advancedOptions.diversityPenalty },
                { field: 'maxTokens', value: advancedOptions.maxTokens },
                { field: 'topK', value: advancedOptions.topK },
                { field: 'topP', value: advancedOptions.topP },
                { field: 'repetitionPenalty', value: advancedOptions.repetitionPenalty },
                { field: 'lengthPenalty', value: advancedOptions.lengthPenalty },
                { field: 'promptImportance', value: advancedOptions.promptImportance }
            ];
            
            options.forEach(({ field, value }) => {
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
        }
        
        // Reset any existing preset selection
        document.getElementById('preconfig').value = '';
        
        // Clear any dynamic fields
        document.getElementById('roleFields').innerHTML = '';
        document.getElementById('conditionsFields').innerHTML = '';
        document.getElementById('formatFields').innerHTML = '';
        document.getElementById('actionFields').innerHTML = '';
        
        // Show success message
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show mt-2';
        alert.role = 'alert';
        alert.innerHTML = `
            <strong>¡Éxito!</strong> Se ha generado un prompt basado en tu descripción.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert the alert after the AI section (previously was looking for .card.mb-4.border-primary)
        const aiSection = document.querySelector('.ai-section');
        if (aiSection) {
            aiSection.insertAdjacentElement('afterend', alert);
        } else {
            // Fallback - append to the form container if AI section not found
            const formContainer = document.querySelector('.form-container');
            if (formContainer) {
                formContainer.prepend(alert);
            } else {
                // Last resort - just append to body
                document.body.appendChild(alert);
            }
        }
        
        // Scroll to the configuration section
        setTimeout(() => {
            const configSection = document.querySelector('.form-section:nth-child(3)');
            if (configSection) {
                configSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
        
    } catch (error) {
        console.error('Error applying generated prompt to form:', error);
        // Show error message without relying on specific elements
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger alert-dismissible fade show mt-2';
        errorAlert.role = 'alert';
        errorAlert.innerHTML = `
            <strong>Error:</strong> No se pudo aplicar el prompt generado. ${error.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Try to find a suitable container for the error message
        const container = document.querySelector('.form-container') || document.body;
        container.prepend(errorAlert);
    }
}
