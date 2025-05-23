document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bannerUploadArea = document.getElementById('banner-upload-area');
    const bannerImageUpload = document.getElementById('banner-image-upload');
    const bannerPreview = document.getElementById('banner-preview');

    const galleryUploadArea = document.getElementById('gallery-upload-area');
    const galleryImageUpload = document.getElementById('gallery-image-upload');
    const galleryPreviews = document.getElementById('gallery-previews');

    const cometDefinitionTitle = document.getElementById('comet-definition-title');
    const cometDefinitionContent = document.getElementById('comet-definition-content');
    const cometUsageTitle = document.getElementById('comet-usage-title');
    const cometUsageContent = document.getElementById('comet-usage-content');
    const saveHomeContentBtn = document.getElementById('save-home-content-btn');

    const fullTemplateCode = document.getElementById('full-template-code');
    const baseTemplateCode = document.getElementById('base-template-code');
    const saveCodeSnippetsBtn = document.getElementById('save-code-snippets-btn');

    const questionsList = document.getElementById('questions-list');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const saveQuestionsOrderBtn = document.getElementById('save-questions-order-btn');

    // Question Modal Elements
    const questionModal = document.getElementById('question-modal');
    const questionModalTitle = document.getElementById('question-modal-title');
    const editingQuestionId = document.getElementById('editing-question-id');
    const questionText = document.getElementById('question-text');
    const questionType = document.getElementById('question-type');
    const saveQuestionDetailsBtn = document.getElementById('save-question-details-btn');
    const closeModalSpans = document.querySelectorAll('.close-modal');

    const stringOptionsDiv = document.getElementById('string-options');
    const stringImageInput = document.getElementById('string-image');
    const stringImagePreview = document.getElementById('string-image-preview');
    const stringPlaceholderInput = document.getElementById('string-placeholder');

    const booleanOptionsDiv = document.getElementById('boolean-options');
    const booleanTrueTextInput = document.getElementById('boolean-true-text');
    const booleanTrueImageInput = document.getElementById('boolean-true-image');
    const booleanTrueImagePreview = document.getElementById('boolean-true-image-preview');
    const booleanTrueCodeInput = document.getElementById('boolean-true-code');
    const booleanFalseTextInput = document.getElementById('boolean-false-text');
    const booleanFalseImageInput = document.getElementById('boolean-false-image');
    const booleanFalseImagePreview = document.getElementById('boolean-false-image-preview');
    const booleanFalseCodeInput = document.getElementById('boolean-false-code');

    const multipleChoiceOptionsDiv = document.getElementById('multiple-choice-options');
    const mcOptionsContainer = document.getElementById('mc-options-container');
    const addMcOptionBtn = document.getElementById('add-mc-option-btn');

    let questions = []; // Array to store question objects, will be loaded from Supabase
    let nextQuestionId = 1; // Will be updated after loading questions
    let nextMcOptionId = 1;

    // --- Image Management ---
    function setupImageUpload(uploadArea, fileInput, previewElement, isMultiple = false, storageKey = null, maxFiles = 10) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#00c6ff';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#64ffda';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#64ffda';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFiles(files, previewElement, isMultiple, storageKey, maxFiles);
            }
        });
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                handleFiles(files, previewElement, isMultiple, storageKey, maxFiles);
            }
        });
    }

    function handleFiles(files, previewElement, isMultiple, storageKey, maxFiles) {
        if (isMultiple) {
            let currentImages = JSON.parse(localStorage.getItem(storageKey) || '[]');
            for (let i = 0; i < files.length; i++) {
                if (currentImages.length >= maxFiles) {
                    alert(`Maximum ${maxFiles} images allowed.`);
                    break;
                }
                const file = files[i];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        previewElement.appendChild(img);
                        currentImages.push(e.target.result);
                        // localStorage.setItem(storageKey, JSON.stringify(currentImages)); // Replaced by Supabase
                        if (storageKey === 'galleryImages' && window.db && window.db.addGalleryImage) {
                            // This still saves base64, not ideal. TODO: Upload to Supabase Storage
                            window.db.addGalleryImage({ url: e.target.result, name: file.name, created_at: new Date().toISOString() }); 
                        }
                        // updateMainPageGallery(); // Main page will load its own data
                    };
                    reader.readAsDataURL(file);
                }
            }
        } else {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewElement.src = e.target.result;
                    previewElement.style.display = 'block';
                    if (storageKey === 'siteBannerUrl' && window.db && window.db.saveBannerUrl) {
                        // This still saves base64. TODO: Upload to Supabase Storage
                        window.db.saveBannerUrl(e.target.result);
                    }
                    // updateMainPageBanner(); // Main page will load its own data
                };
                reader.readAsDataURL(file);
            }
        }
    }

    // Note: storageKey in setupImageUpload will now be used to identify DB operations
    setupImageUpload(bannerUploadArea, bannerImageUpload, bannerPreview, false, 'siteBannerUrl');
    setupImageUpload(galleryUploadArea, galleryImageUpload, galleryPreviews, true, 'galleryImages', 20);

    async function loadBannerPreview() {
        if (!bannerPreview || !window.db || !window.db.getBannerUrl) return;
        try {
            const bannerUrl = await window.db.getBannerUrl();
            if (bannerUrl) {
                bannerPreview.src = bannerUrl;
                bannerPreview.style.display = 'block';
            } else {
                bannerPreview.src = '#';
                bannerPreview.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading banner preview:', error);
            bannerPreview.src = '#';
            bannerPreview.style.display = 'none';
        }
    }

    async function loadGalleryPreviews() {
        if (!galleryPreviews || !window.db || !window.db.getGalleryImages) return;
        try {
            const images = await window.db.getGalleryImages(); // Expects array of { url: '...' }
            galleryPreviews.innerHTML = '';
            if (images && images.length > 0) {
                images.forEach(imgData => {
                    const img = document.createElement('img');
                    img.src = imgData.url; // Assuming imgData has a url property
                    // TODO: Add delete buttons for gallery images if needed, linking to Supabase delete
                    galleryPreviews.appendChild(img);
                });
            }
        } catch (error) {
            console.error('Error loading gallery previews:', error);
            galleryPreviews.innerHTML = '<p>Error loading gallery images.</p>';
        }
    }
    
    // updateMainPageBanner and updateMainPageGallery are removed.
    // The main page (index.html via main.js) is responsible for loading its own data from Supabase.

    // --- Home Page Content Management ---
    if (saveHomeContentBtn) {
        saveHomeContentBtn.addEventListener('click', async () => {
            if (!window.db || !window.db.saveHomePageContent) {
                alert('Error: Database connection not available.');
                return;
            }
            const content = {
                cometDefinitionTitle: cometDefinitionTitle.value,
                cometDefinitionContent: cometDefinitionContent.value,
                cometUsageTitle: cometUsageTitle.value,
                cometUsageContent: cometUsageContent.value
            };
            try {
                const { error } = await window.db.saveHomePageContent(content);
                if (error) throw error;
                alert('Home page content saved!');
            } catch (error) {
                console.error('Error saving home page content:', error);
                alert('Failed to save home page content. ' + error.message);
            }
        });
    }

    async function loadHomePageContent() {
        if (!window.db || !window.db.getHomePageContent) return;
        try {
            const contentData = await window.db.getHomePageContent();
            // Assuming getHomePageContent returns the content object directly, or null
            const content = contentData; // Adjust if contentData is { data: ..., error: ...}

            if (content) {
                if (cometDefinitionTitle) cometDefinitionTitle.value = content.cometDefinitionTitle || 'What is COMET?';
                if (cometDefinitionContent) cometDefinitionContent.value = content.cometDefinitionContent || 'COMET = Co-integrated Observational Market Evaluation Tool...';
                if (cometUsageTitle) cometUsageTitle.value = content.cometUsageTitle || '';
                if (cometUsageContent) cometUsageContent.value = content.cometUsageContent || '';
            } else {
                // Set defaults if no content found
                if (cometDefinitionTitle) cometDefinitionTitle.value = 'What is COMET?';
                if (cometDefinitionContent) cometDefinitionContent.value = 'COMET = Co-integrated Observational Market Evaluation Tool...';
                if (cometUsageTitle) cometUsageTitle.value = '';
                if (cometUsageContent) cometUsageContent.value = '';
            }
        } catch (error) {
            console.error('Error loading home page content:', error);
        }
    }

    // --- Code Snippets Management ---
    if (saveCodeSnippetsBtn) {
        saveCodeSnippetsBtn.addEventListener('click', async () => {
            if (!window.db || !window.db.saveCodeSnippets) {
                alert('Error: Database connection not available.');
                return;
            }
            try {
                // saveCodeSnippets in supabase-client.js handles two separate upserts
                await window.db.saveCodeSnippets(fullTemplateCode.value, baseTemplateCode.value);
                alert('Code snippets saved!');
            } catch (error) {
                console.error('Error saving code snippets:', error);
                alert('Failed to save code snippets. ' + error.message);
            }
        });
    }

    async function loadCodeSnippets() {
        if (!window.db || !window.db.getCodeSnippets) return;
        try {
            const snippets = await window.db.getCodeSnippets();
            if (snippets) {
                if (fullTemplateCode) fullTemplateCode.value = snippets.fullTemplate || '';
                if (baseTemplateCode) baseTemplateCode.value = snippets.baseTemplate || '';
            }
        } catch (error) {
            console.error('Error loading code snippets:', error);
        }
    }

    // --- Questions Builder ---
    async function loadQuestionsFromDb() {
        if (!window.db || !window.db.getQuestions) {
            console.error('Supabase client or getQuestions function not available.');
            questions = []; // Initialize with empty array if DB load fails
            renderQuestions();
            return;
        }
        try {
            const dbQuestions = await window.db.getQuestions();
            questions = dbQuestions.map(q => ({
                ...q,
                // Ensure details are parsed if stored as JSON string, though supabase-client.js implies they are objects
                details: typeof q.details === 'string' ? JSON.parse(q.details) : q.details 
            })); 
            if (questions.length > 0) {
                nextQuestionId = Math.max(...questions.map(q => q.id)) + 1;
            } else {
                nextQuestionId = 1;
            }
            renderQuestions();
        } catch (error) {
            console.error('Error loading questions from DB:', error);
            questions = [];
            renderQuestions();
        }
    }

    function renderQuestions() {
        if (!questionsList) return;
        questionsList.innerHTML = '';
        questions.forEach((q, index) => {
            const item = document.createElement('div');
            item.className = 'question-item';
            item.setAttribute('draggable', true);
            item.dataset.id = q.id;
            item.innerHTML = `
                <p><strong>Q${index + 1}:</strong> ${q.text} <em>(${q.type})</em></p>
                <div class="question-actions">
                    <button class="edit-question-btn" data-id="${q.id}">Edit</button>
                    <button class="delete-question-btn" data-id="${q.id}">Delete</button>
                </div>
            `;
            questionsList.appendChild(item);
        });
        addDragAndDropHandlers();
    }

    function addDragAndDropHandlers() {
        const draggables = questionsList.querySelectorAll('.question-item');
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
            });
            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
                updateQuestionOrderFromDOM();
            });
        });

        questionsList.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(questionsList, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (dragging) {
                if (afterElement == null) {
                    questionsList.appendChild(dragging);
                } else {
                    questionsList.insertBefore(dragging, afterElement);
                }
            }
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.question-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async function updateQuestionOrderFromDOM() {
        const orderedIds = [...questionsList.querySelectorAll('.question-item')].map(item => parseInt(item.dataset.id));
        const newOrderedQuestions = [];
        orderedIds.forEach((id, index) => {
            const question = questions.find(q => q.id === id);
            if (question) {
                question.order = index; // Add or update order property
                newOrderedQuestions.push(question);
            }
        });
        questions = newOrderedQuestions;
        await saveQuestionsOrderToDb(); 
        renderQuestions(); // Re-render to update Q numbers, which also updates Q numbers in display
    }

    async function saveQuestionsOrderToDb() {
        if (!window.db || !window.db.saveQuestionsOrder) {
            alert('Error: Database connection not available for saving order.');
            return;
        }
        try {
            // Prepare data for Supabase: array of {id, order, ...other fields if needed for upsert}
            const questionsToSave = questions.map(q => ({ id: q.id, text: q.text, type: q.type, details: q.details, order: q.order }));
            const { error } = await window.db.saveQuestionsOrder(questionsToSave);
            if (error) throw error;
            console.log('Questions order saved to DB.');
        } catch (error) {
            console.error('Error saving questions order to DB:', error);
            alert('Failed to save questions order: ' + error.message);
        }
    }

    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => openQuestionModal());
    }

    if (saveQuestionsOrderBtn) {
        saveQuestionsOrderBtn.addEventListener('click', async () => {
            await saveQuestionsOrderToDb();
            alert('Questions order explicitly saved to DB!');
        });
    }

    questionsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-question-btn')) {
            const id = parseInt(e.target.dataset.id);
            openQuestionModal(id);
        }
        if (e.target.classList.contains('delete-question-btn')) {
            const id = parseInt(e.target.dataset.id);
            if (confirm('Are you sure you want to delete this question?')) {
                if (!window.db || !window.db.deleteQuestion) {
                    alert('Error: Database connection not available.');
                    return;
                }
                try {
                    const { error } = await window.db.deleteQuestion(id);
                    if (error) throw error;
                    questions = questions.filter(q => q.id !== id);
                    renderQuestions(); // Re-render after successful deletion and local array update
                    alert('Question deleted.');
                } catch (error) {
                    console.error('Error deleting question:', error);
                    alert('Failed to delete question: ' + error.message);
                }
            }
        }
    });

    function openQuestionModal(id = null) {
        resetQuestionModal();
        if (id) {
            const question = questions.find(q => q.id === id);
            if (question) {
                questionModalTitle.textContent = 'Edit Question';
                editingQuestionId.value = id;
                questionText.value = question.text;
                questionType.value = question.type;
                populateQuestionTypeOptions(question.type, question.details);
            }
        } else {
            questionModalTitle.textContent = 'Add New Question';
            editingQuestionId.value = '';
            populateQuestionTypeOptions(questionType.value);
        }
        questionModal.style.display = 'block';
    }

    function resetQuestionModal() {
        if (questionModalTitle) questionModalTitle.textContent = 'Add New Question';
        if (editingQuestionId) editingQuestionId.value = '';
        if (questionText) questionText.value = '';
        if (questionType) questionType.value = 'string';

        if (stringImageInput) stringImageInput.value = ''; // Clear file input
        if (stringImagePreview) {
            stringImagePreview.src = '#';
            stringImagePreview.style.display = 'none';
        }
        if (stringPlaceholderInput) stringPlaceholderInput.value = '{{USER_INPUT}}';

        if (booleanTrueTextInput) booleanTrueTextInput.value = 'True';
        if (booleanTrueImageInput) booleanTrueImageInput.value = '';
        if (booleanTrueImagePreview) {
            booleanTrueImagePreview.src = '#';
            booleanTrueImagePreview.style.display = 'none';
        }
        if (booleanTrueCodeInput) booleanTrueCodeInput.value = '';

        if (booleanFalseTextInput) booleanFalseTextInput.value = 'False';
        if (booleanFalseImageInput) booleanFalseImageInput.value = '';
        if (booleanFalseImagePreview) {
            booleanFalseImagePreview.src = '#';
            booleanFalseImagePreview.style.display = 'none';
        }
        if (booleanFalseCodeInput) booleanFalseCodeInput.value = '';

        if (mcOptionsContainer) mcOptionsContainer.innerHTML = '';
        nextMcOptionId = 1; // Reset for new question or fresh edit
        if (mcOptionsContainer && typeof addMcOption === 'function') addMcOption(); // Add one default MC option
        
        // Default view after reset
        if (typeof populateQuestionTypeOptions === 'function') populateQuestionTypeOptions('string');
    }

    closeModalSpans.forEach(span => {
        span.onclick = () => {
            if (questionModal) questionModal.style.display = 'none';
        }
    });
    window.onclick = (event) => {
        if (event.target === questionModal) {
            questionModal.style.display = 'none';
        }
    };

    if (questionType) {
        questionType.addEventListener('change', (e) => {
            populateQuestionTypeOptions(e.target.value);
        });
    }

    function populateQuestionTypeOptions(type, details = {}) {
        if (stringOptionsDiv) stringOptionsDiv.style.display = 'none';
        if (booleanOptionsDiv) booleanOptionsDiv.style.display = 'none';
        if (multipleChoiceOptionsDiv) multipleChoiceOptionsDiv.style.display = 'none';

        if (type === 'string') {
            if (stringOptionsDiv) stringOptionsDiv.style.display = 'block';
            if (details.image && stringImagePreview) {
                stringImagePreview.src = details.image;
                stringImagePreview.style.display = 'block';
            } else if (stringImagePreview) {
                stringImagePreview.src = '#';
                stringImagePreview.style.display = 'none';
            }
            if (stringPlaceholderInput) stringPlaceholderInput.value = details.placeholder || '{{USER_INPUT}}';
            if (stringImageInput) stringImageInput.value = ''; // Clear file input
        }
        if (type === 'boolean') {
            if (booleanOptionsDiv) booleanOptionsDiv.style.display = 'block';
            if (booleanTrueTextInput) booleanTrueTextInput.value = details.trueText || 'True';
            if (details.trueImage && booleanTrueImagePreview) {
                booleanTrueImagePreview.src = details.trueImage;
                booleanTrueImagePreview.style.display = 'block';
            } else if (booleanTrueImagePreview) {
                booleanTrueImagePreview.src = '#';
                booleanTrueImagePreview.style.display = 'none';
            }
            if (booleanTrueImageInput) booleanTrueImageInput.value = '';
            if (booleanTrueCodeInput) booleanTrueCodeInput.value = details.trueCode || '';

            if (booleanFalseTextInput) booleanFalseTextInput.value = details.falseText || 'False';
            if (details.falseImage && booleanFalseImagePreview) {
                booleanFalseImagePreview.src = details.falseImage;
                booleanFalseImagePreview.style.display = 'block';
            } else if (booleanFalseImagePreview) {
                booleanFalseImagePreview.src = '#';
                booleanFalseImagePreview.style.display = 'none';
            }
            if (booleanFalseImageInput) booleanFalseImageInput.value = '';
            if (booleanFalseCodeInput) booleanFalseCodeInput.value = details.falseCode || '';
        }
        if (type === 'multiple-choice') {
            if (multipleChoiceOptionsDiv) multipleChoiceOptionsDiv.style.display = 'block';
            if (mcOptionsContainer) {
                mcOptionsContainer.innerHTML = ''; // Clear existing options
                nextMcOptionId = 1; // Reset for new set of options
                if (details && details.options && details.options.length > 0) {
                    details.options.forEach(opt => addMcOption(opt));
                } else {
                    if (typeof addMcOption === 'function') addMcOption(); // Add a default empty option if none exist or no details provided
                }
            }
        }
    }

    [stringImageInput, booleanTrueImageInput, booleanFalseImageInput].forEach(input => {
        if(input) input.addEventListener('change', function(e) { previewImageFromFile(e.target, e.target.nextElementSibling); });
    });

    function previewImageFromFile(fileInput, previewImgElement) {
        const file = fileInput.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImgElement.src = e.target.result;
                previewImgElement.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewImgElement.src = '#';
            previewImgElement.style.display = 'none';
        }
    }

    if (addMcOptionBtn) {
        addMcOptionBtn.addEventListener('click', () => addMcOption());
    }

    function addMcOption(optionData = null) {
        if (!mcOptionsContainer) return; // Guard clause
        const localOptionId = nextMcOptionId++; // This is for DOM element uniqueness during session
        const optionElementDOMId = `mc-option-dom-${localOptionId}`;

        const div = document.createElement('div');
        div.className = 'mc-option';
        div.id = optionElementDOMId;
        // Store actual option ID from DB if available, or temporary one for new options
        div.dataset.optionDbId = optionData && optionData.id ? optionData.id : `new-${localOptionId}`;

        div.innerHTML = `
            <label for="mc-text-${localOptionId}">Option Text:</label>
            <input type="text" id="mc-text-${localOptionId}" class="mc-text-input" value="${optionData ? optionData.text || '' : ''}" placeholder="Option Text">
            <label for="mc-image-${localOptionId}">Image (Optional):</label>
            <input type="file" id="mc-image-${localOptionId}" class="mc-image-input" accept="image/*">
            <img src="${optionData && optionData.image ? optionData.image : '#'}" id="mc-preview-${localOptionId}" class="mc-image-preview" alt="Option Image Preview" style="display:${optionData && optionData.image ? 'block' : 'none'}; max-width: 80px; margin-top: 5px;">
            <label for="mc-code-${localOptionId}">Associated Code (Optional):</label>
            <textarea id="mc-code-${localOptionId}" class="mc-code-input" rows="2" placeholder="Code for this option...">${optionData ? optionData.code || '' : ''}</textarea>
            <button type="button" class="remove-mc-option-btn" data-remove-target-id="${optionElementDOMId}">Remove Option</button>
        `;
        mcOptionsContainer.appendChild(div);

        const newImageInput = div.querySelector(`#mc-image-${localOptionId}`);
        const newImagePreview = div.querySelector(`#mc-preview-${localOptionId}`);
        if (newImageInput && newImagePreview) {
            newImageInput.addEventListener('change', function(e) {
                previewImageFromFile(e.target, newImagePreview);
            });
        }
    }

    if (mcOptionsContainer) {
        mcOptionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-mc-option-btn')) {
                const targetId = e.target.dataset.removeTargetId;
                if (targetId) {
                    const optionDiv = document.getElementById(targetId);
                    if (optionDiv) {
                        optionDiv.remove();
                    }
                }
            }
        });
    }

    if (saveQuestionDetailsBtn) {
        saveQuestionDetailsBtn.addEventListener('click', async () => {
            const editingIdValue = editingQuestionId ? editingQuestionId.value : null;
            const id = editingIdValue ? parseInt(editingIdValue) : null;
            const text = questionText ? questionText.value.trim() : '';
            const type = questionType ? questionType.value : 'string';
            let details = {};

            if (!text) {
                alert('Question text cannot be empty.');
                return;
            }

            // Helper to convert file to base64
            const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });

            if (type === 'string') {
                details.placeholder = stringPlaceholderInput ? stringPlaceholderInput.value : '{{USER_INPUT}}';
                if (stringImageInput && stringImageInput.files[0]) {
                    details.image = await toBase64(stringImageInput.files[0]);
                } else if (stringImagePreview && stringImagePreview.src && stringImagePreview.src !== '#' && !stringImagePreview.src.endsWith('#') && stringImagePreview.style.display !== 'none') {
                    details.image = stringImagePreview.src; // Preserve existing image if displayed and not placeholder
                } else {
                    details.image = null;
                }
            } else if (type === 'boolean') {
                details.trueText = booleanTrueTextInput ? booleanTrueTextInput.value : 'True';
                details.trueCode = booleanTrueCodeInput ? booleanTrueCodeInput.value : '';
                details.falseText = booleanFalseTextInput ? booleanFalseTextInput.value : 'False';
                details.falseCode = booleanFalseCodeInput ? booleanFalseCodeInput.value : '';

                if (booleanTrueImageInput && booleanTrueImageInput.files[0]) {
                    details.trueImage = await toBase64(booleanTrueImageInput.files[0]);
                } else if (booleanTrueImagePreview && booleanTrueImagePreview.src && booleanTrueImagePreview.src !== '#' && !booleanTrueImagePreview.src.endsWith('#') && booleanTrueImagePreview.style.display !== 'none') {
                    details.trueImage = booleanTrueImagePreview.src;
                } else {
                    details.trueImage = null;
                }

                if (booleanFalseImageInput && booleanFalseImageInput.files[0]) {
                    details.falseImage = await toBase64(booleanFalseImageInput.files[0]);
                } else if (booleanFalseImagePreview && booleanFalseImagePreview.src && booleanFalseImagePreview.src !== '#' && !booleanFalseImagePreview.src.endsWith('#') && booleanFalseImagePreview.style.display !== 'none') {
                    details.falseImage = booleanFalseImagePreview.src;
                } else {
                    details.falseImage = null;
                }
            } else if (type === 'multiple-choice') {
                details.options = [];
                if (mcOptionsContainer) {
                    const optionElements = mcOptionsContainer.querySelectorAll('.mc-option');
                    for (const optElement of optionElements) {
                        const textInput = optElement.querySelector('.mc-text-input');
                        const codeTextarea = optElement.querySelector('.mc-code-input');
                        const imageInput = optElement.querySelector('.mc-image-input');
                        const imagePreview = optElement.querySelector('.mc-image-preview');
                        
                        let image = null;
                        if (imageInput && imageInput.files[0]) {
                            image = await toBase64(imageInput.files[0]);
                        } else if (imagePreview && imagePreview.src && imagePreview.src !== '#' && !imagePreview.src.endsWith('#') && imagePreview.style.display !== 'none') {
                            image = imagePreview.src;
                        }

                        details.options.push({
                            // Supabase will generate IDs for new options if table is structured for it.
                            // For now, we send the content. If options need their own IDs, schema needs adjustment.
                            text: textInput ? textInput.value : '',
                            image: image,
                            code: codeTextarea ? codeTextarea.value : ''
                        });
                    }
                }
            }

            if (!window.db || !window.db.saveQuestion) {
                alert('Error: Database connection not available.');
                return;
            }

            let questionData = {
                text,
                type,
                details
                // 'order' will be handled by Supabase or by a separate update if needed after insert
            };

            try {
                if (id) { // Editing existing question
                    questionData.id = id;
                    // Preserve existing order if editing
                    const existingQuestion = questions.find(q => q.id === id);
                    if (existingQuestion) questionData.order = existingQuestion.order;

                } else { // Adding new question
                    // Assign a temporary high order; actual order will be set by loadQuestionsFromDb or a re-ordering mechanism
                    questionData.order = questions.length; 
                }

                const { error } = await window.db.saveQuestion(questionData);
                if (error) throw error;
                
                await loadQuestionsFromDb(); // Reload all questions to ensure consistency, order, and get new IDs
                if (questionModal) questionModal.style.display = 'none';
                alert('Question details saved!');

            } catch (error) {
                console.error('Error saving question details:', error);
                alert('Failed to save question details: ' + error.message);
            }
        });
    }

    function saveQuestions() {
        localStorage.setItem('wizardQuestions', JSON.stringify(questions));
    }

    function loadQuestions() {
        const storedQuestions = JSON.parse(localStorage.getItem('wizardQuestions') || '[]');
        questions = storedQuestions;
        if (questions.length > 0) {
            nextQuestionId = Math.max(...questions.map(q => q.id)) + 1;
        }
        renderQuestions();
    }

    // --- Logout --- 
    const logoutLinkAdmin = document.getElementById('logout-link-admin');
    if (logoutLinkAdmin) {
        logoutLinkAdmin.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Logout functionality to be implemented.');
            // Potentially clear localStorage or session and redirect
            // window.location.href = 'login.html'; 
        });
    }

    // --- Initial Load --- 
    async function loadAllDashboardData() {
        if (typeof loadBannerPreview === 'function') await loadBannerPreview();
        if (typeof loadGalleryPreviews === 'function') await loadGalleryPreviews();
        if (typeof loadHomePageContent === 'function') await loadHomePageContent();
        if (typeof loadCodeSnippets === 'function') await loadCodeSnippets();
        if (typeof loadQuestionsFromDb === 'function') await loadQuestionsFromDb();
    }

    // Ensure Auth0 client is initialized before loading data that might be user-specific
    // or require auth state. updateUI in auth.js is called on DOMContentLoaded.
    // We can call loadAllDashboardData after a slight delay or a specific auth event if needed,
    // but for now, direct call is fine as Supabase client itself doesn't strictly need user to be logged in for public data.
    if (typeof loadAllDashboardData === 'function') loadAllDashboardData();
});