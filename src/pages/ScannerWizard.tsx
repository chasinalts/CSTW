// Scanner wizard component that guides users through creating customized COMET scanner templates
import React from 'react';
import { useState, useEffect } from '../utils/react-imports';
import { motion } from 'framer-motion';
import Modal from '../components/ui/Modal';
import { useAdminContent } from '../hooks/useAdminContent';
import { useAuth0Context } from '../contexts/Auth0Context';
import { useTheme } from '../contexts/ThemeContext';
import ResponsiveImageWithPlaceholder from '../components/ui/ResponsiveImageWithPlaceholder';
import LiveCodePreview from '../components/LiveCodePreview';
import LiveFloatingPreview from '../components/LiveFloatingPreview';
import { useWizard } from '../contexts/WizardContext';
import { useQuestions } from '../hooks/useQuestions';
import { useSections } from '../hooks/useSections';
import type { Question, QuestionOption } from '../types/questions';
import VirtualizedImageGallery from '../components/ui/VirtualizedImageGallery';
import LazyImage from '../components/ui/LazyImage';
import { TextField, CheckboxField } from '../components/ui/FormField';
import HolographicText from '../components/ui/HolographicText';
import Button from '../components/ui/Button';
import InitialUserChoice from '../components/InitialUserChoice';

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
};

const ScannerWizard = () => {
  const { getBannerImage, getScannerImages, getTemplates, getFullTemplate } = useAdminContent();
  const { currentUser, isAuthenticated } = useAuth0Context();
  const { theme } = useTheme();
  const { state: wizardState, dispatch: wizardDispatch } = useWizard();
  const { questions } = useQuestions(); // Load questions managed by admin
  const { sections } = useSections(); // Load sections managed by admin

  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [showFloatingPreview, setShowFloatingPreview] = useState(true);

  // Wizard flow state
  const [wizardMode, setWizardMode] = useState<'initial' | 'fullTemplate' | 'wizard'>('initial');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());

  // Template state
  const [fullTemplateCode, setFullTemplateCode] = useState<string>('');
  const [fullTemplateEnabled, setFullTemplateEnabled] = useState<boolean>(false);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string>('');

  // Load admin-managed questions and sections into wizard context
  useEffect(() => {
    wizardDispatch({ type: 'SET_QUESTIONS', payload: questions });
  }, [questions, wizardDispatch]);

  useEffect(() => {
    wizardDispatch({ type: 'SET_SECTIONS', payload: sections });
  }, [sections, wizardDispatch]);

  // Get banner and scanner images from admin content
  const bannerContent = getBannerImage();

  // Get scanner images with error handling
  const [scannerImages, setScannerImages] = useState<any[]>([]);

  useEffect(() => {
    try {
      const images = getScannerImages();
      setScannerImages(images);
      console.log('Scanner Images loaded:', images.length);
    } catch (error) {
      console.error('Error loading scanner images:', error);
      setScannerImages([]);
    }
  }, [getScannerImages]);

  // Load full template code if available
  useEffect(() => {
    try {
      // Get full template from admin settings
      const { code, isEnabled } = getFullTemplate();
      setFullTemplateCode(code);
      setFullTemplateEnabled(isEnabled);

      // Also load saved templates for the current user
      // This would typically come from a database call
      // For now, we'll use localStorage as a placeholder
      if (isAuthenticated && currentUser?.id) {
        const userTemplates = localStorage.getItem(`user_templates_${currentUser.id}`);
        if (userTemplates) {
          setSavedTemplates(JSON.parse(userTemplates));
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }, [getFullTemplate, currentUser, isAuthenticated]);

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < wizardState.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const skipCurrentQuestion = () => {
    const currentQuestionId = wizardState.questions[currentQuestionIndex]?.id;
    if (currentQuestionId) {
      const newSkipped = new Set(skippedQuestions);
      newSkipped.add(currentQuestionId);
      setSkippedQuestions(newSkipped);

      // Move to next question
      if (currentQuestionIndex < wizardState.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  // Template management functions
  const saveTemplate = () => {
    if (!isAuthenticated) {
      alert('Please sign in to save templates');
      return;
    }

    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const newTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      code: wizardMode === 'fullTemplate' ? fullTemplateCode : '', // For full template mode
      answers: wizardState.answers, // For wizard mode
      skippedQuestions: Array.from(skippedQuestions),
      createdAt: new Date().toISOString(),
      userId: currentUser?.id
    };

    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);

    // Save to localStorage (in a real app, this would be a database call)
    if (currentUser?.id) {
      localStorage.setItem(`user_templates_${currentUser.id}`, JSON.stringify(updatedTemplates));
    }

    setTemplateName('');
    alert('Template saved successfully!');
  };

  const deleteTemplate = (templateId: string) => {
    if (!isAuthenticated) {
      alert('Please sign in to delete templates');
      return;
    }

    const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
    setSavedTemplates(updatedTemplates);

    // Update localStorage
    if (currentUser?.id) {
      localStorage.setItem(`user_templates_${currentUser.id}`, JSON.stringify(updatedTemplates));
    }

    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(null);
    }
  };

  // Template sharing functions
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTemplateId, setShareTemplateId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareMethod, setShareMethod] = useState<'email' | 'link'>('email');
  const [shareLink, setShareLink] = useState<string | null>(null);

  const openShareModal = (templateId: string) => {
    if (!isAuthenticated) {
      alert('Please sign in to share templates');
      return;
    }

    setShareTemplateId(templateId);
    setShareModalOpen(true);
    setShareLink(null);
  };

  const generateShareLink = () => {
    const template = savedTemplates.find(t => t.id === shareTemplateId);
    if (!template) {
      alert('Template not found');
      return;
    }

    // In a real app, this would generate a unique shareable link
    // For now, we'll create a mock link
    const mockLink = `https://comet-scanner-wizard.com/shared-template/${template.id}`;
    setShareLink(mockLink);

    // In a real implementation, you would save this link to the database
    console.log(`Generated share link for template "${template.name}": ${mockLink}`);
  };

  const shareTemplate = () => {
    if (shareMethod === 'email') {
      if (!shareEmail.trim()) {
        alert('Please enter an email address');
        return;
      }

      const template = savedTemplates.find(t => t.id === shareTemplateId);
      if (!template) {
        alert('Template not found');
        return;
      }

      // In a real app, this would send the template via email
      // For now, we'll just show a success message
      alert(`Template "${template.name}" would be shared with ${shareEmail}`);

      // Reset share form
      setShareEmail('');
      setShareMessage('');
      setShareModalOpen(false);
      setShareTemplateId(null);
    } else {
      // Generate a shareable link
      generateShareLink();
    }
  };

  const loadTemplate = (templateId: string) => {
    if (!isAuthenticated) {
      alert('Please sign in to load templates');
      return;
    }

    const template = savedTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);

      // If it's a full template, just set the mode
      if (template.code) {
        setWizardMode('fullTemplate');
        setFullTemplateCode(template.code);
      }
      // If it's a wizard template, restore answers and skipped questions
      else if (template.answers) {
        setWizardMode('wizard');
        wizardDispatch({ type: 'SET_ANSWERS', payload: template.answers });
        setSkippedQuestions(new Set(template.skippedQuestions || []));
      }
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    wizardDispatch({ type: 'SET_ANSWER', payload: { questionId, value } });
  };

  const renderQuestionInput = (question: Question) => {
    const answer = wizardState.answers[question.id];

    switch (question.type) {
      case 'text':
        return (
          <TextField
            label={question.text}
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.required}
            className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        );
      case 'choice':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {question.text} {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.options?.map((option: QuestionOption) => (
                <label
                  key={option.id}
                  className={`
                    flex flex-col items-center p-4 border rounded-lg cursor-pointer
                    transition-all duration-150 ease-in-out
                    ${(answer === option.value)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <input
                    type="radio" // Assuming single choice for now
                    name={question.id}
                    value={option.value}
                    checked={answer === option.value}
                    onChange={() => handleAnswerChange(question.id, option.value)}
                    className="sr-only" // Hide default radio
                  />
                  {option.imageUrl && (
                    <img
                      src={option.imagePreview || option.imageUrl}
                      alt={option.text}
                      className="w-full h-32 object-contain mb-2 rounded"
                      style={{ transform: `scale(${option.scale || 1})` }}
                    />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 'boolean':
        return (
          <CheckboxField
            label={question.text}
            checked={!!answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.checked)}
            required={question.required}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="dark">
      <div className="min-h-screen bg-gray-900 transition-colors duration-200 futuristic-grid-bg">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="relative"
        >
          {/* Title Section */}
          <motion.div
            variants={itemVariants}
            className="py-12 px-4 text-center"
          >
            <HolographicText
              text="COMET Scanner Template Wizard"
              as="h1"
              variant="title"
              className="text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight"
            />
          </motion.div>

          {/* Banner Section */}
          <motion.div
            variants={itemVariants}
            className="relative w-full mb-12 bg-gray-100 dark:bg-gray-800 holo-glow"
          >
            {bannerContent ? (
              <div className="relative w-full flex items-center justify-center overflow-hidden">
                <div className="w-full" style={{ paddingBottom: '42.85%' }}>
                  <LazyImage
                    src={bannerContent.src}
                    alt="COMET Scanner Banner"
                    className="absolute top-0 left-0 w-full h-full object-contain transition-transform duration-300"
                    style={{
                      transform: `scale(${bannerContent.scale || 1})`,
                      transformOrigin: 'center center'
                    }}
                    loadingStrategy="eager"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full" style={{ paddingBottom: '42.85%' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <HolographicText
                    text="Visualize Your Data with COMET Scanner"
                    as="span"
                    variant="subtitle"
                    className="text-3xl font-semibold"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Scanner Variations Gallery */}
          {scannerImages.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
            >
              <HolographicText
                text="Scanner Variations"
                as="h2"
                variant="title"
                className="text-4xl md:text-5xl font-bold mb-8 text-center"
              />
              <VirtualizedImageGallery
                images={scannerImages}
                onImageClick={(image) => {
                  setSelectedImage(image.src);
                  setSelectedTitle(image.displayText || 'Scanner Variation');
                }}
                columnCount={3}
                itemGap={16}
                className="mb-8"
                itemClassName="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
                loadingStrategy="lazy"
              />
            </motion.div>
          )}

          {/* Main Content Area */}
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Initial Choice */}
            {wizardMode === 'initial' && (
              <InitialUserChoice
                onChooseFullTemplate={() => setWizardMode('fullTemplate')}
                onChooseWizard={() => setWizardMode('wizard')}
                fullTemplateAvailable={!!fullTemplateCode && fullTemplateEnabled}
              />
            )}

            {/* Full Template View */}
            {wizardMode === 'fullTemplate' && (
              <div className="space-y-8">
                <HolographicText
                  text="Complete COMET Scanner Template"
                  as="h2"
                  variant="subtitle"
                  className="text-3xl font-bold mb-6 text-center"
                />

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <pre className="overflow-auto p-4 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 font-mono rounded-lg max-h-[60vh]">
                    <code>{fullTemplateCode}</code>
                  </pre>
                </div>

                {/* Template Save Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center mt-8">
                  <TextField
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter a name for this template"
                    className="w-full md:w-64"
                  />
                  <Button onClick={saveTemplate}>Save Template</Button>
                </div>
              </div>
            )}

            {/* Wizard Mode */}
            {wizardMode === 'wizard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Questions */}
                <div className="lg:col-span-2 space-y-8">
                  <motion.div variants={itemVariants}>
                    <HolographicText
                      text="Configure Your Template"
                      as="h2"
                      variant="subtitle"
                      className="text-3xl font-bold mb-6"
                    />

                    {wizardState.questions.length > 0 ? (
                      <div className="space-y-6">
                        {/* Current Question */}
                        <div className="p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 futuristic-container">
                          {renderQuestionInput(wizardState.questions[currentQuestionIndex])}
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex justify-between mt-6">
                          <Button
                            onClick={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            variant="secondary"
                          >
                            Previous
                          </Button>

                          <Button
                            onClick={skipCurrentQuestion}
                            variant="outline"
                          >
                            Skip
                          </Button>

                          <Button
                            onClick={goToNextQuestion}
                            disabled={currentQuestionIndex === wizardState.questions.length - 1}
                          >
                            Next
                          </Button>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Question {currentQuestionIndex + 1} of {wizardState.questions.length}
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${((currentQuestionIndex + 1) / wizardState.questions.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Template Save Controls */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                          <TextField
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Enter a name for this template"
                            className="w-full md:w-64"
                          />
                          <Button onClick={saveTemplate}>Save Progress</Button>
                        </div>
                      </div>
                    ) : (
                      <HolographicText
                        text="No questions configured yet. Please set them up in the Admin Dashboard."
                        as="p"
                        className="text-gray-500 dark:text-gray-400"
                      />
                    )}
                  </motion.div>
                </div>

                {/* Right Column: Live Preview Toggle Button */}
                <div className="lg:col-span-1 flex flex-col items-end">
                  <button
                    className="mb-4 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
                    onClick={() => setShowFloatingPreview(v => !v)}
                  >
                    {showFloatingPreview ? 'Hide' : 'Show'} Live Preview
                  </button>
                </div>
              </div>
            )}

            {/* Saved Templates Section */}
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
              <HolographicText
                text="Saved Templates"
                as="h2"
                variant="subtitle"
                className="text-2xl font-bold mb-6"
              />

              {savedTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border ${selectedTemplateId === template.id
                        ? 'border-blue-500 ring-2 ring-blue-500'
                        : 'border-gray-200 dark:border-gray-700'}
                        bg-white dark:bg-gray-800 shadow hover:shadow-md transition-all`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                        <div className="flex space-x-1">
                          <button
                            className="text-blue-500 hover:text-blue-700 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              openShareModal(template.id);
                            }}
                            title="Share Template"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete template "${template.name}"?`)) {
                                deleteTemplate(template.id);
                              }
                            }}
                            title="Delete Template"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {template.code ? 'Full Template' : 'Wizard Template'}
                        </span>
                        <button
                          onClick={() => loadTemplate(template.id)}
                          className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded hover:bg-cyan-200 dark:hover:bg-cyan-800"
                        >
                          Load Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">No saved templates yet. Create and save a template to see it here.</p>
              )}
            </div>

            {/* Share Template Modal */}
            {shareModalOpen && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShareModalOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <HolographicText
                    text="Share Template"
                    as="h3"
                    variant="subtitle"
                    className="text-xl font-bold mb-4"
                  />

                  <div className="space-y-4">
                    {/* Share Method Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                      <button
                        className={`py-2 px-4 font-medium text-sm ${
                          shareMethod === 'email'
                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                        onClick={() => setShareMethod('email')}
                      >
                        Email
                      </button>
                      <button
                        className={`py-2 px-4 font-medium text-sm ${
                          shareMethod === 'link'
                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                        onClick={() => setShareMethod('link')}
                      >
                        Generate Link
                      </button>
                    </div>

                    {shareMethod === 'email' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Recipient Email
                          </label>
                          <input
                            type="email"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Message (Optional)
                          </label>
                          <textarea
                            value={shareMessage}
                            onChange={(e) => setShareMessage(e.target.value)}
                            placeholder="Add a personal message"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        {shareLink ? (
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Shareable Link
                            </label>
                            <div className="flex">
                              <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(shareLink);
                                  alert('Link copied to clipboard!');
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              This link allows anyone to view and use this template. The link will expire in 30 days.
                            </p>
                          </div>
                        ) : (
                          <p className="text-center py-4 text-gray-600 dark:text-gray-300">
                            Click "Generate Link" to create a shareable link for this template.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        variant="secondary"
                        onClick={() => setShareModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={shareTemplate}
                      >
                        {shareMethod === 'email' ? 'Share via Email' : shareLink ? 'Copy Link' : 'Generate Link'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Floating Live Preview Window */}
        {showFloatingPreview && (
          <LiveFloatingPreview title="Live Code Preview" onClose={() => setShowFloatingPreview(false)}>
            <LiveCodePreview
              skippedQuestions={skippedQuestions}
              fullTemplateMode={wizardMode === 'fullTemplate'}
              fullTemplateCode={fullTemplateCode}
            />
          </LiveFloatingPreview>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <Modal
            isOpen={true}
            onClose={() => {
              setSelectedImage(null);
              setSelectedTitle('');
            }}
            title={selectedTitle}
            size="xl"
          >
            <div className="relative">
              <div className="flex justify-center items-center bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="holo-glow">
                  <LazyImage
                    src={selectedImage}
                    alt={selectedTitle}
                    className="max-w-full max-h-[80vh] object-contain"
                    loadingStrategy="eager"
                  />
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ScannerWizard;