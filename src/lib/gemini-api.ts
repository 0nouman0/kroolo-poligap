let GoogleGenerativeAI: any;

try {
  const module = require('@google/generative-ai');
  GoogleGenerativeAI = module.GoogleGenerativeAI;
} catch (error) {
  console.warn('Google Generative AI package not available:', error);
}

export interface ComplianceAnalysisResult {
  overallScore: number;
  standardsAnalysis: {
    standard: string;
    score: number;
    status: 'compliant' | 'partial' | 'non-compliant';
    gaps: string[];
    suggestions: string[];
    criticalIssues: string[];
  }[];
  summary: {
    totalGaps: number;
    criticalIssues: number;
    recommendedActions: string[];
  };
  detailedFindings: {
    strengths: string[];
    weaknesses: string[];
    riskAreas: string[];
  };
}

export class GeminiComplianceAnalyzer {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!GoogleGenerativeAI) {
      throw new Error('Google Generative AI not available');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (file.type === 'application/pdf') {
            // For PDF files, we'll extract text using a simple approach
            // In production, you might want to use a proper PDF parser like pdf-parse
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const text = new TextDecoder().decode(arrayBuffer);
            // This is a basic extraction - for better PDF parsing, consider using pdf-parse
            resolve(text);
          } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
            const text = e.target?.result as string;
            resolve(text);
          } else if (file.type.includes('document') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
            // For DOC/DOCX files, we'll treat them as text for now
            // In production, you might want to use a proper document parser
            const text = e.target?.result as string;
            resolve(text);
          } else {
            reject(new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      
      if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  async analyzeCompliance(prompt: string): Promise<ComplianceAnalysisResult> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisResult = JSON.parse(jsonMatch[0]);
          return analysisResult;
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        // Fallback: create a structured response from the text
        return this.createFallbackResponse(text);
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to analyze document. Please try again.');
    }
  }

  private createFallbackResponse(text: string): ComplianceAnalysisResult {
    // Create a fallback structured response if JSON parsing fails
    return {
      overallScore: 75,
      standardsAnalysis: [{
        standard: "Analysis Complete",
        score: 75,
        status: "partial",
        gaps: ["Unable to parse detailed analysis"],
        suggestions: ["Please review the full analysis text"],
        criticalIssues: []
      }],
      summary: {
        totalGaps: 1,
        criticalIssues: 0,
        recommendedActions: ["Review analysis and try again"]
      },
      detailedFindings: {
        strengths: [],
        weaknesses: ["Analysis parsing issue"],
        riskAreas: []
      }
    };
  }
}

export const createGeminiAnalyzer = () => {
  if (!GoogleGenerativeAI) {
    throw new Error('Google Generative AI package not available. Please install @google/generative-ai');
  }
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }
  return new GeminiComplianceAnalyzer(apiKey);
};