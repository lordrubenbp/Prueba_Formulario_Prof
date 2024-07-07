document.addEventListener('DOMContentLoaded', function() {
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            window.preconfigurations = data.preconfigurations;
        });
});

document.getElementById('preconfig').addEventListener('change', function() {
    const preconfig = this.value;
    const roleFields = document.getElementById('roleFields');
    const conditionsFields = document.getElementById('conditionsFields');
    const formatFields = document.getElementById('formatFields');

    if (preconfig && window.preconfigurations && window.preconfigurations[preconfig]) {
        const config = window.preconfigurations[preconfig];
        document.getElementById('role').value = config.role;
        document.getElementById('action').value = config.action;
        document.getElementById('conditions').value = config.conditions;
        document.getElementById('additionalGuidance').value = config.additionalGuidance;
        document.getElementById('formatRestrictions').value = config.formatRestrictions;
        document.getElementById('temperature').value = config.temperature;
        document.getElementById('diversityPenalty').value = config.diversityPenalty;

        roleFields.style.display = 'block';
        conditionsFields.style.display = 'block';
        formatFields.style.display = 'block';

        // Bloquear campos de texto
        document.getElementById('role').readOnly = true;
        document.getElementById('action').readOnly = true;
        document.getElementById('conditions').readOnly = true;
        document.getElementById('additionalGuidance').readOnly = true;
        document.getElementById('formatRestrictions').readOnly = true;
        document.getElementById('temperature').readOnly = true;
        document.getElementById('diversityPenalty').readOnly = true;

        // Desbloquear y resaltar campos que deben ser completados
        document.getElementById('degree').value = '[Grado/Licenciatura]';
        document.getElementById('expertise').value = '[Ámbito del que es experto]';
        document.getElementById('courseName').value = '[Nombre del grado]';
        document.getElementById('courseYear').value = '[Curso en el que se imparte la asignatura]';
        document.getElementById('subject').value = '[Nombre de asignatura]';
        document.getElementById('numQuestions').value = '';
        document.getElementById('numOptions').value = '';

        document.getElementById('degree').readOnly = false;
        document.getElementById('expertise').readOnly = false;
        document.getElementById('courseName').readOnly = false;
        document.getElementById('courseYear').readOnly = false;
        document.getElementById('subject').readOnly = false;
        document.getElementById('numQuestions').readOnly = false;
        document.getElementById('numOptions').readOnly = false;

        document.getElementById('degree').classList.add('placeholder');
        document.getElementById('expertise').classList.add('placeholder');
        document.getElementById('courseName').classList.add('placeholder');
        document.getElementById('courseYear').classList.add('placeholder');
        document.getElementById('subject').classList.add('placeholder');
    } else {
        roleFields.style.display = 'none';
        conditionsFields.style.display = 'none';
        formatFields.style.display = 'none';

        document.getElementById('role').value = '';
        document.getElementById('action').value = '';
        document.getElementById('conditions').value = '';
        document.getElementById('additionalGuidance').value = '';
        document.getElementById('formatRestrictions').value = '';
        document.getElementById('temperature').value = '';
        document.getElementById('diversityPenalty').value = '';

        // Desbloquear campos de texto
        document.getElementById('role').readOnly = false;
        document.getElementById('action').readOnly = false;
        document.getElementById('conditions').readOnly = false;
        document.getElementById('additionalGuidance').readOnly = false;
        document.getElementById('formatRestrictions').readOnly = false;
        document.getElementById('temperature').readOnly = false;
        document.getElementById('diversityPenalty').readOnly = false;

        // Limpiar y bloquear campos que deben ser completados
        document.getElementById('degree').value = '';
        document.getElementById('expertise').value = '';
        document.getElementById('courseName').value = '';
        document.getElementById('courseYear').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('numQuestions').value = '';
        document.getElementById('numOptions').value = '';

        document.getElementById('degree').readOnly = true;
        document.getElementById('expertise').readOnly = true;
        document.getElementById('courseName').readOnly = true;
        document.getElementById('courseYear').readOnly = true;
        document.getElementById('subject').readOnly = true;
        document.getElementById('numQuestions').readOnly = true;
        document.getElementById('numOptions').readOnly = true;

        document.getElementById('degree').classList.remove('placeholder');
        document.getElementById('expertise').classList.remove('placeholder');
        document.getElementById('courseName').classList.remove('placeholder');
        document.getElementById('courseYear').classList.remove('placeholder');
        document.getElementById('subject').classList.remove('placeholder');
    }
});

document.getElementById('actionType').addEventListener('change', function() {
    const actionType = this.value;
    const actionText = document.getElementById('actionText');

    if (actionType === 'text') {
        actionText.style.display = 'block';
    } else {
        actionText.style.display = 'none';
        actionText.value = '';
    }
});

document.getElementById('infoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const role = document.getElementById('role').value;
    const actionType = document.getElementById('actionType').value;
    const action = document.getElementById('action').value + (actionType === 'text' ? document.getElementById('actionText').value : 'document adjunto');
    const conditions = document.getElementById('conditions').value;
    const additionalGuidance = document.getElementById('additionalGuidance').value;
    const formatRestrictions = document.getElementById('formatRestrictions').value;
    const temperature = document.getElementById('temperature').value;
    const diversityPenalty = document.getElementById('diversityPenalty').value;

    let outputText = `Rol: ${role}
Acción: ${action}
Condiciones: ${conditions}
Orientación adicional: ${additionalGuidance}
Restricciones obligatorias del formato: ${formatRestrictions}
Grado de temperatura: ${temperature}
Diversity_penalty: ${diversityPenalty}`;
    
    if (!additionalGuidance) {
        outputText = `Rol: ${role}
Acción: ${action}
Condiciones: ${conditions}
Restricciones obligatorias del formato: ${formatRestrictions}
Grado de temperatura: ${temperature}
Diversity_penalty: ${diversityPenalty}`;
    }

    if (document.getElementById('preconfig').value === 'testQuestions') {
        const degree = document.getElementById('degree').value;
        const expertise = document.getElementById('expertise').value;
        const courseName = document.getElementById('courseName').value;
        const courseYear = document.getElementById('courseYear').value;
        const subject = document.getElementById('subject').value;
        const numQuestions = document.getElementById('numQuestions').value;
        const numOptions = document.getElementById('numOptions').value;

        outputText = outputText.replace('[Grado/Licenciatura]', degree)
                               .replace('[Ámbito del que es experto]', expertise)
                               .replace('[Nombre del grado]', courseName)
                               .replace('[Curso en el que se imparte la asignatura]', courseYear)
                               .replace('[Nombre de asignatura]', subject)
                               .replace('[Número de preguntas]', numQuestions)
                               .replace('[Número de opciones]', numOptions);
    }

    document.getElementById('outputContainer').innerText = outputText;
});

function copyText() {
    const outputContainer = document.getElementById('outputContainer');
    const text = outputContainer.innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert('Texto copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar el texto: ', err);
    });
}

function resetForm() {
    document.getElementById('infoForm').reset();
    document.getElementById('outputContainer').innerText = '';
    document.getElementById('roleFields').style.display = 'none';
    document.getElementById('conditionsFields').style.display = 'none';
    document.getElementById('formatFields').style.display = 'none';
    document.getElementById('actionText').style.display = 'none';

    // Desbloquear campos de texto
    document.getElementById('role').readOnly = false;
    document.getElementById('action').readOnly = false;
    document.getElementById('conditions').readOnly = false;
    document.getElementById('additionalGuidance').readOnly = false;
    document.getElementById('formatRestrictions').readOnly = false;
    document.getElementById('temperature').readOnly = false;
    document.getElementById('diversityPenalty').readOnly = false;

    // Limpiar y bloquear campos que deben ser completados
    document.getElementById('degree').value = '';
    document.getElementById('expertise').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('courseYear').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('numQuestions').value = '';
    document.getElementById('numOptions').value = '';

    document.getElementById('degree').readOnly = true;
    document.getElementById('expertise').readOnly = true;
    document.getElementById('courseName').readOnly = true;
    document.getElementById('courseYear').readOnly = true;
    document.getElementById('subject').readOnly = true;
    document.getElementById('numQuestions').readOnly = true;
    document.getElementById('numOptions').readOnly = true;

    document.getElementById('degree').classList.remove('placeholder');
    document.getElementById('expertise').classList.remove('placeholder');
    document.getElementById('courseName').classList.remove('placeholder');
    document.getElementById('courseYear').classList.remove('placeholder');
    document.getElementById('subject').classList.remove('placeholder');
}
