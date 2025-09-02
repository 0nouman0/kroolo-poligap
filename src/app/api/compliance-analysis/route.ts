import { NextRequest, NextResponse } from 'next/server';
import { getCompliancePrompt } from '@/lib/compliance-prompt';

// Primary: Gemini AI with direct file upload
async function analyzeWithGemini(file: File, selectedStandards: string[]): Promise<any> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // Determine MIME type with safe property access
    let mimeType = file.type;
    if (!mimeType && file.name && file.name.endsWith('.pdf')) {
      mimeType = 'application/pdf';
    }

    console.log(`Sending file to Gemini: ${file.name} (${mimeType}, ${file.size} bytes)`);

    // Create the prompt for direct file analysis
    const prompt = getCompliancePrompt(selectedStandards, "ANALYZE_UPLOADED_FILE");

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      },
      prompt
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('Gemini response received:', text.substring(0, 200) + '...');

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]);
        return analysisResult;
      } else {
        throw new Error('No JSON found in Gemini response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError);
      // Create structured response from the text
      return createStructuredResponseFromText(text);
    }

  } catch (error) {
    console.error('Gemini AI analysis failed:', error);
    throw new Error(`Gemini AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Fallback: Kroolo AI with text extraction
async function analyzeWithKrooloAI(file: File, selectedStandards: string[]): Promise<any> {
  try {
    // Extract text from file for Kroolo AI
    const documentContent = await extractTextFromFile(file);
    const prompt = getCompliancePrompt(selectedStandards, documentContent);

    const krooloApiUrl = process.env.NEXT_PUBLIC_REACT_APP_API_URL;
    const krooloAiUrl = process.env.NEXT_PUBLIC_REACT_APP_API_URL_KROOLO_AI;

    if (!krooloApiUrl || !krooloAiUrl) {
      throw new Error('Kroolo AI endpoints not configured');
    }

    const requestData = {
      prompt,
      user_id: 'compliance_user',
      organization_id: 'compliance_org',
      session_id: `compliance_${Date.now()}`,
      enable: true
    };

    // Try global chat endpoint first
    let response = await fetch(`${krooloAiUrl}/global-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      // Try alternative endpoint
      response = await fetch(`${krooloApiUrl}/kroolo-ai/chat-with-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        return JSON.parse(jsonMatch[0]);
      } else {
        return createStructuredResponseFromText(responseText);
      }
    } catch (parseError) {
      return createStructuredResponseFromText(responseText);
    }

  } catch (error) {
    console.error('Kroolo AI analysis failed:', error);
    throw new Error(`Kroolo AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Simple text extraction for Kroolo AI fallback
async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type.includes('text') || (file.name && file.name.endsWith('.txt'))) {
      return await file.text();
    }

    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(arrayBuffer);

    // Basic text extraction - in production you'd want proper PDF/DOC parsers
    if (file.type === 'application/pdf') {
      // Very basic PDF text extraction
      const textMatches = content.match(/\([^)]{10,}\)/g);
      if (textMatches) {
        return textMatches
          .map(match => match.replace(/^\(|\)$/g, ''))
          .filter(t => t.length > 5)
          .join(' ');
      }
    }

    // Extract readable text sequences
    const readableText = content.match(/[a-zA-Z\s.,!?;:'"()-]{20,}/g);
    if (readableText) {
      return readableText.join(' ').replace(/\s+/g, ' ').trim();
    }

    throw new Error('Could not extract readable text from file');

  } catch (error) {
    throw new Error(`Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create structured response from unstructured text
function createStructuredResponseFromText(text: string): any {
  const score = extractScoreFromText(text);
  const gaps = extractListFromText(text, ['gap', 'issue', 'missing', 'lacking', 'absent', 'insufficient']);
  const suggestions = extractListFromText(text, ['suggest', 'recommend', 'should', 'improve', 'add', 'include']);
  const criticalIssues = extractListFromText(text, ['critical', 'urgent', 'important', 'risk', 'violation', 'non-compliant']);

  // If we can't extract meaningful analysis, indicate this clearly
  if (!score && gaps.length === 0 && suggestions.length === 0) {
    return {
      overallScore: 0,
      standardsAnalysis: [{
        standard: "Analysis Failed",
        score: 0,
        status: "non-compliant",
        gaps: ["Unable to perform meaningful compliance analysis. The document content may be unclear, incomplete, or the AI service may be experiencing issues."],
        suggestions: ["Please ensure the document is readable and contains policy content, then try again."],
        criticalIssues: ["Analysis could not be completed"]
      }],
      summary: {
        totalGaps: 1,
        criticalIssues: 1,
        recommendedActions: ['Verify document content and retry analysis']
      },
      detailedFindings: {
        strengths: [],
        weaknesses: ["Analysis could not be completed"],
        riskAreas: ["Unable to assess compliance risks"]
      }
    };
  }

  const finalScore = score || (gaps.length > 0 ? Math.max(20, 60 - (gaps.length * 10)) : 50);
  const status = finalScore >= 90 ? "compliant" : finalScore >= 70 ? "partial" : "non-compliant";

  return {
    overallScore: finalScore,
    standardsAnalysis: [{
      standard: "Compliance Analysis",
      score: finalScore,
      status: status,
      gaps: gaps.length > 0 ? gaps : ["Analysis completed but specific gaps could not be clearly identified from the AI response."],
      suggestions: suggestions.length > 0 ? suggestions : ["Review the document manually for compliance requirements."],
      criticalIssues: criticalIssues
    }],
    summary: {
      totalGaps: gaps.length,
      criticalIssues: criticalIssues.length,
      recommendedActions: suggestions.length > 0 ? suggestions.slice(0, 3) : ['Manual review recommended']
    },
    detailedFindings: {
      strengths: extractListFromText(text, ['strength', 'good', 'compliant', 'adequate', 'meets']),
      weaknesses: extractListFromText(text, ['weakness', 'weak', 'insufficient', 'inadequate', 'lacks']),
      riskAreas: extractListFromText(text, ['risk', 'danger', 'threat', 'vulnerability', 'violation'])
    }
  };
}

function extractScoreFromText(text: string): number | null {
  const scoreMatch = text.match(/(\d+)%|\bscore[:\s]*(\d+)|(\d+)\s*out\s*of\s*100/i);
  if (scoreMatch) {
    return parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
  }
  return null;
}

function extractListFromText(text: string, keywords: string[]): string[] {
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

  return relevantSentences.slice(0, 5);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const selectedStandards = JSON.parse(formData.get('selectedStandards') as string);

    console.log('Received compliance analysis request');
    console.log('File info:', { name: file?.name, type: file?.type, size: file?.size });
    console.log('Selected standards:', selectedStandards);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!selectedStandards || selectedStandards.length === 0) {
      return NextResponse.json({ error: 'No compliance standards selected' }, { status: 400 });
    }

    // Validate file type with safe property access
    const supportedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const isSupported = supportedTypes.includes(file.type) ||
      (file.name && file.name.endsWith('.pdf')) ||
      (file.name && file.name.endsWith('.txt')) ||
      (file.name && file.name.endsWith('.doc')) ||
      (file.name && file.name.endsWith('.docx'));

    if (!isSupported) {
      return NextResponse.json({
        error: `Unsupported file type: ${file.type}. Please upload PDF, DOC, DOCX, or TXT files.`
      }, { status: 400 });
    }

    // Try Gemini AI first (primary method with direct file upload)
    let analysisResult;
    let method = 'unknown';

    try {
      console.log('Attempting Gemini AI analysis with direct file upload...');
      analysisResult = await analyzeWithGemini(file, selectedStandards);
      method = 'gemini-primary';
      console.log('Gemini AI analysis completed successfully');

    } catch (geminiError) {
      console.error('Gemini AI analysis failed, falling back to Kroolo AI:', geminiError);

      try {
        console.log('Attempting Kroolo AI analysis with text extraction...');
        analysisResult = await analyzeWithKrooloAI(file, selectedStandards);
        method = 'kroolo-ai-fallback';
        console.log('Kroolo AI analysis completed successfully');

      } catch (krooloError) {
        console.error('Both Gemini and Kroolo AI failed:', krooloError);
        return NextResponse.json({
          error: `Analysis failed with both AI services. Gemini: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}. Kroolo: ${krooloError instanceof Error ? krooloError.message : 'Unknown error'}`
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      selectedStandards,
      analysis: analysisResult,
      method
    });

  } catch (error) {
    console.error('Compliance analysis error:', error);
    return NextResponse.json({
      error: `Failed to analyze document: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}