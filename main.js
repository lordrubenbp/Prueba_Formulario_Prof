import { initializeFormHandlers } from './formHandlers.js';
import { initializeAdvancedOptions, activateAdvancedFields, deactivateAdvancedFields } from './advancedOptions.js';
import { initializeAIPromptGenerator } from './aiPromptGenerator.js';
import { initializeChatGPTIntegration } from './chatgptIntegration.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize default preconfigurations in case fetch fails
    window.preconfigurations = {};
    
    // Add smooth scroll behavior to the whole page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            window.preconfigurations = data.preconfigurations;
            console.log('Configuration loaded successfully');
        })
        .catch(error => {
            console.error('Error loading configuration file:', error);
            
            // Show error message to user with instructions
            const alert = document.createElement('div');
            alert.className = 'alert alert-warning alert-dismissible fade show mt-2';
            alert.role = 'alert';
            alert.innerHTML = `
                <div class="d-flex">
                    <div class="me-3">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                    </div>
                    <div>
                        <strong>Error cargando configuración:</strong> No se pudo cargar el archivo de configuración debido a restricciones CORS.
                        <p class="mb-1">Para resolverlo:</p>
                        <ul class="mb-0">
                            <li>Use un servidor web local como Live Server en VS Code, http-server, o similar</li>
                            <li>O abra el navegador con la seguridad reducida (solo para desarrollo)</li>
                        </ul>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            
            document.querySelector('.form-container').prepend(alert);
            
            // Load hardcoded fallback configurations
            loadFallbackConfigurations();
        });

    // Global event handlers
    initializeFormHandlers();
    initializeAdvancedOptions();
    initializeChatGPTIntegration();
    initializeAIPromptGenerator();
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Añadir efecto de desplazamiento suave a la sección AI
    document.getElementById('generatePromptBtn').addEventListener('click', function() {
        // Después de 1 segundo (para dar tiempo a la generación), desplazar a la sección del formulario
        setTimeout(() => {
            const configSection = document.querySelector('.form-section:nth-child(3)');
            if (configSection) {
                configSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 1000);
    });
    
    // Añadir efectos visuales a la sección de AI
    const aiSection = document.querySelector('.ai-section');
    if (aiSection) {
        // Efecto de brillar al cargar la página
        setTimeout(() => {
            aiSection.classList.add('highlight-pulse');
            setTimeout(() => aiSection.classList.remove('highlight-pulse'), 2000);
        }, 500);
    }
});

function loadFallbackConfigurations() {
    // Fallback configuration to use when the JSON file can't be loaded
    window.preconfigurations = {
        "testQuestions": {
            "role": "Profesor universitario licenciado/grado en {{Grado/Licenciatura:text}} experto en {{Ámbito del que es experto:text}}",
            "action": "Redacta preguntas tipo test sobre el/la {{Contexto:textarea}}",
            "conditions": "Las preguntas abordan el contenido de la asignatura {{Nombre de la asignatura:text}}, cursada en el {{Año en el que se imparte la asignatura:number}} año del grado universitario de {{Nombre del grado universitario:text}}. Las preguntas deben tener un nivel de dificultad {{Nivel de dificultad:text}} y permitir respuestas que demuestren la comprensión del contenido por parte del alumno.",
            "formatRestrictions": "Debe haber {{Número de preguntas:number}} preguntas tipo test. Cada pregunta debe tener {{Número de opciones:number}} opciones posibles. Solo una de las opciones debe ser inequívocamente correcta. Las preguntas debes mostrarlas en formato AIKEN",
            "temperature": 0.2,
            "diversityPenalty": 0.5,
            "topK": 50,
            "topP": 0.9,
            "repetitionPenalty": 1.2,
            "lengthPenalty": 0.0,
            "promptImportance": 1.0
        },
        "developQuestions": {
            // ...existing code...
        },
        "practicalExercise": {
            // ...existing code...
        }
    };
    
    console.log('Loaded fallback configurations');
}

document.getElementById('themeSwitch').addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.setAttribute('data-bs-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    
    // Add animation when theme changes
    document.body.style.opacity = '0.8';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 200);
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    document.getElementById('themeSwitch').checked = savedTheme === 'light';
}

