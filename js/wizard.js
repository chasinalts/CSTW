document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fullTemplateOptionBtn = document.getElementById('load-full-template-btn');
    const startTemplateBuilderBtn = document.getElementById('start-template-builder-btn');
    const wizardQuestionsArea = document.getElementById('wizard-questions-area');
    const templateCreationMethodSection = document.getElementById('template-creation-method');

    const prevQuestionBtn = document.getElementById('prev-question-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const skipQuestionBtn = document.getElementById('skip-question-btn');
    const questionIndicator = document.getElementById('question-indicator');
    const currentQuestionContent = document.getElementById('current-question-content');
    const saveProgressBtn = document.getElementById('save-progress-btn');
    const finishWizardBtn = document.getElementById('finish-wizard-btn');

    const templatesListDiv = document.getElementById('templates-list');
    const liveCodePreviewWindow = document.getElementById('live-code-preview-window');
    const codePreviewContent = document.getElementById('code-preview-content');
    const closePreviewBtn = document.getElementById('close-preview-btn');

    let allQuestions = [];
    let userAnswers = {}; // Stores { questionId: answerValue } or { questionId: { skipped: true } }
    let currentQuestionIndex = 0;
    let baseCode = '';
    let fullCode = '';
    let savedTemplates = [];

    // --- Initial Setup ---
    function loadInitialData() {
        allQuestions = JSON.parse(localStorage.getItem('wizardQuestions') || '[]');
        baseCode = localStorage.getItem('baseTemplateCode') || '// Base code not set by admin.\n';
        fullCode = localStorage.getItem('fullTemplateCode') || '';
        savedTemplates = JSON.parse(localStorage.getItem('userSavedTemplates') || '[]');

        if (fullCode) {
            fullTemplateOptionBtn.textContent = 'Load Full Template';
            fullTemplateOptionBtn.disabled = false;
        } else {
            document.getElementById('full-template-option').querySelector('p').textContent = 'Full template is not available. Please use the Template Builder Wizard.';
        }
        renderSavedTemplates();
    }

    // --- Template Creation Method Choice ---
    if (fullTemplateOptionBtn) {
        fullTemplateOptionBtn.addEventListener('click', () => {
            if (fullCode) {
                codePreviewContent.textContent = fullCode;
                wizardQuestionsArea.style.display = 'none';
                templateCreationMethodSection.style.display = 'block'; // Or hide if preferred
                alert('Full template loaded into preview.');
            } else {
                alert('Full template is not available.');
            }
        });
    }

    if (startTemplateBuilderBtn) {
        startTemplateBuilderBtn.addEventListener('click', () => {
            if (allQuestions.length === 0) {
                alert('No questions have been configured by the administrator yet.');
                return;
            }
            templateCreationMethodSection.style.display = 'none';
            wizardQuestionsArea.style.display = 'block';
            currentQuestionIndex = 0;
            userAnswers = {}; // Reset answers for a new session
            displayQuestion(currentQuestionIndex);
            updateCodePreview();
        });
    }

    // --- Question Display and Navigation ---
    function displayQuestion(index) {
        if (index < 0 || index >= allQuestions.length) return;
        currentQuestionIndex = index;
        const question = allQuestions[index];
        currentQuestionContent.innerHTML = ''; // Clear previous

        const title = document.createElement('h3');
        title.className = 'question-title';
        title.textContent = `Q${index + 1}: ${question.text}`;
        currentQuestionContent.appendChild(title);

        if (question.details.image && question.type !== 'boolean') { // Boolean images are per option
            const img = document.createElement('img');
            img.src = question.details.image;
            img.alt = `Helper image for ${question.text}`;
            img.className = 'question-image';
            currentQuestionContent.appendChild(img);
        }

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        switch (question.type) {
            case 'string':
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Your answer for: ${question.details.placeholder || 'input'}`;
                input.value = userAnswers[question.id]?.value || '';
                input.addEventListener('input', (e) => {
                    userAnswers[question.id] = { value: e.target.value, type: 'string', placeholder: question.details.placeholder };
                    updateCodePreview();
                });
                optionsDiv.appendChild(input);
                break;
            case 'boolean':
                const trueBtn = document.createElement('button');
                trueBtn.textContent = question.details.trueText || 'True';
                if (question.details.trueImage) {
                    const trueImg = document.createElement('img');
                    trueImg.src = question.details.trueImage; trueImg.style.maxWidth='50px'; trueImg.style.marginRight='10px';
                    trueBtn.prepend(trueImg);
                }
                trueBtn.classList.toggle('selected', userAnswers[question.id]?.value === true);
                trueBtn.addEventListener('click', () => {
                    userAnswers[question.id] = { value: true, type: 'boolean', code: question.details.trueCode };
                    updateBooleanButtons(trueBtn, falseBtn);
                    updateCodePreview();
                });

                const falseBtn = document.createElement('button');
                falseBtn.textContent = question.details.falseText || 'False';
                if (question.details.falseImage) {
                    const falseImg = document.createElement('img');
                    falseImg.src = question.details.falseImage; falseImg.style.maxWidth='50px'; falseImg.style.marginRight='10px';
                    falseBtn.prepend(falseImg);
                }
                falseBtn.classList.toggle('selected', userAnswers[question.id]?.value === false);
                falseBtn.addEventListener('click', () => {
                    userAnswers[question.id] = { value: false, type: 'boolean', code: question.details.falseCode };
                    updateBooleanButtons(trueBtn, falseBtn);
                    updateCodePreview();
                });
                optionsDiv.appendChild(trueBtn);
                optionsDiv.appendChild(falseBtn);
                break;
            case 'multiple-choice':
                question.details.options.forEach(opt => {
                    const optBtn = document.createElement('button');
                    optBtn.textContent = opt.text;
                    if (opt.image) {
                        const optImg = document.createElement('img');
                        optImg.src = opt.image; optImg.style.maxWidth='50px'; optImg.style.marginRight='10px';
                        optBtn.prepend(optImg);
                    }
                    optBtn.classList.toggle('selected', userAnswers[question.id]?.value === opt.text);
                    optBtn.addEventListener('click', () => {
                        userAnswers[question.id] = { value: opt.text, type: 'multiple-choice', code: opt.code };
                        updateMultipleChoiceButtons(optionsDiv, optBtn);
                        updateCodePreview();
                    });
                    optionsDiv.appendChild(optBtn);
                });
                break;
        }
        currentQuestionContent.appendChild(optionsDiv);
        updateNavigationButtons();
        questionIndicator.textContent = `Question ${index + 1} of ${allQuestions.length}`;
    }

    function updateBooleanButtons(trueBtn, falseBtn) {
        const questionId = allQuestions[currentQuestionIndex].id;
        trueBtn.classList.toggle('selected', userAnswers[questionId]?.value === true);
        falseBtn.classList.toggle('selected', userAnswers[questionId]?.value === false);
    }

    function updateMultipleChoiceButtons(container, selectedBtn) {
        container.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
        selectedBtn.classList.add('selected');
    }

    if (prevQuestionBtn) {
        prevQuestionBtn.addEventListener('click', () => {
            if (currentQuestionIndex > 0) displayQuestion(currentQuestionIndex - 1);
        });
    }
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            if (currentQuestionIndex < allQuestions.length - 1) displayQuestion(currentQuestionIndex + 1);
        });
    }
    if (skipQuestionBtn) {
        skipQuestionBtn.addEventListener('click', () => {
            const questionId = allQuestions[currentQuestionIndex].id;
            userAnswers[questionId] = { skipped: true, type: allQuestions[currentQuestionIndex].type };
            updateCodePreview();
            if (currentQuestionIndex < allQuestions.length - 1) {
                displayQuestion(currentQuestionIndex + 1);
            } else {
                alert('This is the last question.');
            }
        });
    }

    function updateNavigationButtons() {
        prevQuestionBtn.disabled = currentQuestionIndex === 0;
        nextQuestionBtn.disabled = currentQuestionIndex === allQuestions.length - 1;
        skipQuestionBtn.disabled = false; // Always allow skipping for now
    }

    // --- Live Code Preview ---
    function updateCodePreview() {
        let generatedCode = baseCode;
        allQuestions.forEach(q => {
            const answer = userAnswers[q.id];
            if (answer) {
                if (answer.skipped) {
                    generatedCode += `\n// Question: ${q.text} (SKIPPED)\n`;
                    // Placeholder for skipped string input
                    if (q.type === 'string' && q.details.placeholder) {
                         generatedCode = generatedCode.replace(new RegExp(q.details.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `/* SKIPPED: ${q.details.placeholder} */`);
                    }
                } else if (answer.type === 'string') {
                    if (q.details.placeholder) {
                        generatedCode = generatedCode.replace(new RegExp(q.details.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), answer.value || '');
                    }
                } else if (answer.code) { // Boolean or Multiple Choice with code
                    generatedCode += `\n// Answered: ${q.text} -> ${answer.value}\n${answer.code}\n`;
                }
            }
        });
        codePreviewContent.textContent = generatedCode;
    }

    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', () => {
            liveCodePreviewWindow.style.display = 'none';
        });
    }
    // Allow dragging the preview window (basic implementation)
    if (liveCodePreviewWindow) {
        let isDragging = false;
        let offsetX, offsetY;
        const header = liveCodePreviewWindow.querySelector('.preview-header');
        if (header) {
            header.addEventListener('mousedown', (e) => {
                isDragging = true;
                offsetX = e.clientX - liveCodePreviewWindow.offsetLeft;
                offsetY = e.clientY - liveCodePreviewWindow.offsetTop;
                liveCodePreviewWindow.style.cursor = 'grabbing';
            });
        }
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                liveCodePreviewWindow.style.left = (e.clientX - offsetX) + 'px';
                liveCodePreviewWindow.style.top = (e.clientY - offsetY) + 'px';
            }
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                liveCodePreviewWindow.style.cursor = 'grab';
            }
        });
    }

    // --- Saving Templates/Progress ---
    if (saveProgressBtn) {
        saveProgressBtn.addEventListener('click', () => {
            const templateName = prompt('Enter a name for this in-progress template:', `Progress ${new Date().toLocaleDateString()}`);
            if (templateName) {
                const progressTemplate = {
                    name: templateName,
                    answers: JSON.parse(JSON.stringify(userAnswers)), // Deep copy
                    code: codePreviewContent.textContent,
                    isComplete: false,
                    timestamp: new Date().toISOString()
                };
                addOrUpdateSavedTemplate(progressTemplate);
                alert('Progress saved!');
            }
        });
    }

    if (finishWizardBtn) {
        finishWizardBtn.addEventListener('click', () => {
            const templateName = prompt('Enter a name for your completed template:', `My COMET Template ${savedTemplates.filter(t=>t.isComplete).length + 1}`);
            if (templateName) {
                const completedTemplate = {
                    name: templateName,
                    answers: JSON.parse(JSON.stringify(userAnswers)),
                    code: codePreviewContent.textContent,
                    isComplete: true,
                    timestamp: new Date().toISOString()
                };
                addOrUpdateSavedTemplate(completedTemplate);
                alert('Template finished and saved!');
                // Optionally reset wizard
                templateCreationMethodSection.style.display = 'block';
                wizardQuestionsArea.style.display = 'none';
            }
        });
    }

    function addOrUpdateSavedTemplate(template) {
        const existingIndex = savedTemplates.findIndex(t => t.name === template.name);
        if (existingIndex > -1) {
            savedTemplates[existingIndex] = template;
        } else {
            savedTemplates.push(template);
        }
        localStorage.setItem('userSavedTemplates', JSON.stringify(savedTemplates));
        renderSavedTemplates();
    }

    function renderSavedTemplates() {
        if (!templatesListDiv) return;
        templatesListDiv.innerHTML = '';
        if (savedTemplates.length === 0) {
            templatesListDiv.innerHTML = '<p>No saved templates yet. Create and save a template to see it here.</p>';
            return;
        }
        savedTemplates.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)); // Show newest first
        savedTemplates.forEach(template => {
            const item = document.createElement('div');
            item.className = 'template-item';
            item.textContent = `${template.name} (${template.isComplete ? 'Completed' : 'In Progress'}) - Saved: ${new Date(template.timestamp).toLocaleDateString()}`;
            item.addEventListener('click', () => loadSavedTemplate(template));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.style.fontSize = '0.8em';
            deleteBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent loading template when deleting
                if(confirm(`Are you sure you want to delete template: ${template.name}?`)){
                    savedTemplates = savedTemplates.filter(t => t.name !== template.name);
                    localStorage.setItem('userSavedTemplates', JSON.stringify(savedTemplates));
                    renderSavedTemplates();
                }
            };
            item.appendChild(deleteBtn);
            templatesListDiv.appendChild(item);
        });
    }

    function loadSavedTemplate(template) {
        codePreviewContent.textContent = template.code;
        if (!template.isComplete) {
            userAnswers = JSON.parse(JSON.stringify(template.answers));
            // Try to find the first unanswered or last answered question to resume
            let resumeIndex = allQuestions.findIndex(q => !userAnswers[q.id] || userAnswers[q.id].skipped);
            if (resumeIndex === -1) resumeIndex = allQuestions.length - 1; // Go to last if all answered
            if (resumeIndex < 0) resumeIndex = 0; // Default to first if no questions or issue
            
            templateCreationMethodSection.style.display = 'none';
            wizardQuestionsArea.style.display = 'block';
            if(allQuestions.length > 0) displayQuestion(resumeIndex);
            else alert('Cannot resume wizard: Questions are not loaded or configured.');
        } else {
            wizardQuestionsArea.style.display = 'none'; // Don't show questions for completed template, just code
            templateCreationMethodSection.style.display = 'block';
        }
        liveCodePreviewWindow.style.display = 'flex'; // Show preview window
        alert(`Template loaded: ${template.name}`);
