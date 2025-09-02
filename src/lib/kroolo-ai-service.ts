import { ComplianceAnalysisResult } from './gemini-api';
import { getCompliancePrompt } from './compliance-prompt';

export interface KrooloAIRequest {
  prompt: string;
  user_id?: string;
  organization_id?: string;
  session_id?: string;
  enable?: boolean;
}

export interface FileUploadRequest {
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_content?: string;
}

export class KrooloAIComplianceService {
  private baseUrl: string;
  private aiUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_REACT_APP_API_URL || '';
    this.aiUrl = process.env.NEXT_PUBLIC_REACT_APP_API_URL_KROOLO_AI || '';
  }

  private getAuthHeaders(accessToken?: string) {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };
  }

  private getUserInfo() {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return {
        userId: '',
        companyId: '',
        accessToken: undefined
      };
    }

    const userSession = localStorage.getItem('userSession');
    const userId = localStorage.getItem('user_id')?.replace(/^"(.*)"$/, '$1');
    const companyId = localStorage.getItem('company_id')?.replace(/^"(.*)"$/, '$1');
    
    return {
      userId: userId || '',
      companyId: companyId || '',
      accessToken: userSession ? JSON.parse(userSession)?.AccessToken : undefined
    };
  }

  async extractFileContent(file: File): Promise<string> {
    try {
      // First, try to extract file content using Kroolo AI's extract-file-data endpoint
      const formData = new FormData();
      formData.append('file', file);

      const { accessToken } = this.getUserInfo();
      const headers: any = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.aiUrl}/extract-file-data`, {
        method: 'POST',
        body: formData,
        headers
      });

      if (response.ok) {
        const result = await response.json();
        return result.content || result.text || result.data || '';
      } else {
        throw new Error(`File extraction failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Kroolo AI file extraction failed:', error);
      // Fallback to basic file reading
      return this.fallbackFileExtraction(file);
    }
  }

  private async fallbackFileExtraction(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (file.type === 'application/pdf') {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const text = new TextDecoder().decode(arrayBuffer);
            resolve(text);
          } else {
            const text = e.target?.result as string;
            resolve(text);
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

  async analyzeCompliance(
    selectedStandards: string[], 
    documentContent: string
  ): Promise<ComplianceAnalysisResult> {
    const { userId, companyId } = this.getUserInfo();
    const prompt = getCompliancePrompt(selectedStandards, documentContent);

    try {
      // Try Kroolo AI first
      const result = await this.analyzeWithKrooloAI(prompt, userId, companyId);
      return result;
    } catch (error) {
      console.error('Kroolo AI analysis failed, falling back to Gemini:', error);
      // Fallback to Gemini AI
      return this.analyzeWithGemini(prompt);
    }
  }

  private async analyzeWithKrooloAI(
    prompt: string, 
    userId: string, 
    companyId: string
  ): Promise<ComplianceAnalysisResult> {
    const requestData: KrooloAIRequest = {
      prompt,
      user_id: userId,
      organization_id: companyId,
      session_id: `compliance_${Date.now()}`,
      enable: true
    };

    const { accessToken } = this.getUserInfo();

    // Try global chat endpoint first
    let response = await fetch(`${this.aiUrl}/global-chat`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      // Try alternative endpoint
      response = await fetch(`${this.baseUrl}/kroolo-ai/chat-with-ai`, {
        method: 'POST',
        headers: this.getAuthHeaders(accessToken),
        body: JSON.stringify({ prompt })
      });
    }

    if (!response.ok) {
      throw new Error(`Kroolo AI request failed: ${response.statusText}`);
    }

    const responseText = await response.text();
    
    // Try to parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]);
        return this.validateAndFormatResult(analysisResult);
      } else {
        // If no JSON found, create structured response from text
        return this.createStructuredResponse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Kroolo AI response:', parseError);
      return this.createStructuredResponse(responseText);
    }
  }

  private async analyzeWithGemini(prompt: string): Promise<ComplianceAnalysisResult> {
    // Import Gemini analyzer dynamically to avoid issues if not available
    try {
      const { createGeminiAnalyzer } = await import('./gemini-api');
      const analyzer = createGeminiAnalyzer();
      return await analyzer.analyzeCompliance(prompt);
    } catch (error) {
      console.error('Gemini fallback also failed:', error);
      throw new Error('Both Kroolo AI and Gemini AI failed. Please try again.');
    }
  }

  private validateAndFormatResult(result: any): ComplianceAnalysisResult {
    // Ensure the result has the expected structure
    return {
      overallScore: result.overallScore || 75,
      standardsAnalysis: result.standardsAnalysis || [{
        standard: "Analysis Complete",
        score: result.overallScore || 75,
        status: result.overallScore >= 90 ? "compliant" : result.overallScore >= 70 ? "partial" : "non-compliant",
        gaps: result.gaps || [],
        suggestions: result.suggestions || [],
        criticalIssues: result.criticalIssues || []
      }],
      summary: result.summary || {
        totalGaps: result.gaps?.length || 0,
        criticalIssues: result.criticalIssues?.length || 0,
        recommendedActions: result.recommendedActions || []
      },
      detailedFindings: result.detailedFindings || {
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        riskAreas: result.riskAreas || []
      }
    };
  }

  private createStructuredResponse(text: string): ComplianceAnalysisResult {
    // Create a structured response from unstructured text
    const score = this.extractScoreFromText(text) || 75;
    const status = score >= 90 ? "compliant" : score >= 70 ? "partial" : "non-compliant";

    return {
      overallScore: score,
      standardsAnalysis: [{
        standard: "Compliance Analysis",
        score: score,
        status: status,
        gaps: this.extractListFromText(text, ['gap', 'issue', 'missing', 'lacking']),
        suggestions: this.extractListFromText(text, ['suggest', 'recommend', 'should', 'improve']),
        criticalIssues: this.extractListFromText(text, ['critical', 'urgent', 'important', 'risk'])
      }],
      summary: {
        totalGaps: 0,
        criticalIssues: 0,
        recommendedActions: ['Review the detailed analysis above']
      },
      detailedFindings: {
        strengths: this.extractListFromText(text, ['strength', 'good', 'compliant', 'adequate']),
        weaknesses: this.extractListFromText(text, ['weakness', 'weak', 'insufficient', 'inadequate']),
        riskAreas: this.extractListFromText(text, ['risk', 'danger', 'threat', 'vulnerability'])
      }
    };
  }

  private extractScoreFromText(text: string): number | null {
    const scoreMatch = text.match(/(\d+)%|\bscore[:\s]*(\d+)|(\d+)\s*out\s*of\s*100/i);
    if (scoreMatch) {
      return parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
    }
    return null;
  }

  private extractListFromText(text: string, keywords: string[]): string[] {
    const sentences = text.split(/[.!?]+/);
    const relevantSentences: string[] = [];

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (keywords.some(keyword => lowerSentence.includes(keyword))) {
        const cleanSentence = sentence.trim();
        if (cleanSentence.length > 10) {
          relevantSentences.push(cleanSentence);
        }
      }
    });

    return relevantSentences.slice(0, 5); // Limit to 5 items
  }
}

export const createKrooloAIService = () => {
  return new KrooloAIComplianceService();
};