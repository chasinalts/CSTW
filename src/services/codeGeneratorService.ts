import { Question } from './questionService';

export interface CodeTemplate {
  baseTemplate: string;
  questionReplacements: {
    [key: string]: string;
  };
}

export interface ScannerCode {
  code: string;
  name: string;
  description: string;
}

export class CodeGeneratorService {
  private templates: { [key: string]: CodeTemplate } = {
    default: {
      baseTemplate: `
// COMET Scanner
// Generated {{TIMESTAMP}}
//@version=5
indicator("{{SCANNER_NAME}}", overlay=false)

// Variables
var float signal = 0.0

// Inputs
{{INPUTS}}

// Calculations
{{CALCULATIONS}}

// Signal Generation
signal := {{SIGNAL_LOGIC}}

// Plot results
plot(signal, "Signal", color=color.blue)

// Alert conditions
alertcondition(signal > 0, "Buy Signal", "Scanner detected a buy opportunity")
alertcondition(signal < 0, "Sell Signal", "Scanner detected a sell opportunity")
      `,
      questionReplacements: {}
    }
  };

  constructor(private questions: Question[]) {
    // Initialize common templates and their replacements
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Add template customizations based on question types
    this.questions.forEach(question => {
      switch (question.type) {
        case 'boolean':
          if (question.details.booleanOptions) {
            this.templates.default.questionReplacements[question.id] = '';
          }
          break;
        case 'string':
          if (question.details.placeholder) {
            this.templates.default.questionReplacements[question.id] = '';
          }
          break;
        case 'multiple-choice':
          if (question.details.multipleChoiceOptions) {
            this.templates.default.questionReplacements[question.id] = '';
          }
          break;
      }
    });
  }

  generateCode(answers: Record<string, any>, name: string): ScannerCode {
    let template = this.templates.default.baseTemplate;
    let inputs = '';
    let calculations = '';
    let signalLogic = '';

    // Process each answer and update the code
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = this.questions.find(q => q.id === questionId);
      if (!question) return;

      switch (question.type) {
        case 'boolean':
          if (question.details.booleanOptions) {
            const option = answer ? question.details.booleanOptions.true : question.details.booleanOptions.false;
            calculations += option.code + '\n';
          }
          break;

        case 'string':
          if (question.details.placeholder) {
            const placeholder = question.details.placeholder;
            template = template.replace(placeholder, String(answer));
          }
          break;

        case 'multiple-choice':
          if (question.details.multipleChoiceOptions) {
            const option = question.details.multipleChoiceOptions.find(opt => opt.id === answer);
            if (option) {
              calculations += option.code + '\n';
            }
          }
          break;
      }
    });

    // Replace template variables
    const timestamp = new Date().toISOString();
    template = template
      .replace('{{TIMESTAMP}}', timestamp)
      .replace('{{SCANNER_NAME}}', name)
      .replace('{{INPUTS}}', inputs)
      .replace('{{CALCULATIONS}}', calculations)
      .replace('{{SIGNAL_LOGIC}}', signalLogic || '0');

    return {
      code: template,
      name,
      description: `Scanner generated from wizard on ${new Date().toLocaleDateString()}`
    };
  }

  // Add support for custom templates
  addTemplate(name: string, template: CodeTemplate) {
    this.templates[name] = template;
  }

  // Get available template names
  getTemplateNames(): string[] {
    return Object.keys(this.templates);
  }
}

export const createCodeGeneratorService = (questions: Question[]) => new CodeGeneratorService(questions);