import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log("=== PDF parsing API called ===");
    
    const form = await req.formData();
    const file = form.get("file");
    
    if (!file || !(file instanceof File)) {
      console.error("No file in form data");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    console.log("Environment check:", {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasDocumentAIKey: !!process.env.DOCUMENT_AI_API_KEY,
      hasAzureKey: !!process.env.AZURE_FORM_RECOGNIZER_KEY
    });

    // Validate file
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file uploaded" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`Buffer created, size: ${buffer.length} bytes`);

    // Try multiple parsing approaches with readability checks
    let parseError = null;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const documentAiKey = process.env.DOCUMENT_AI_API_KEY;
    const azureKey = process.env.AZURE_FORM_RECOGNIZER_KEY;

    // Method 0: External APIs first (Gemini / OpenAI / Google / Azure)
    try {
      const anyApiKey = geminiApiKey || openaiApiKey || documentAiKey || azureKey;
      if (anyApiKey) {
        console.log("Attempting external API parsing first...");
        console.log("Available API keys:", { 
          hasGemini: !!geminiApiKey, 
          hasOpenAI: !!openaiApiKey, 
          hasDocumentAI: !!documentAiKey, 
          hasAzure: !!azureKey 
        });
        const externalText = await parseWithExternalAPI(buffer, file.name, anyApiKey);
        console.log("External API returned text length:", externalText?.length || 0);
        
        // Debug: Log first 200 characters to see what we got
        if (externalText) {
          console.log("External API text preview:", externalText.substring(0, 200) + "...");
        }
        
        if (externalText && externalText.trim().length > 100) {
          // For external APIs (especially Gemini), be more lenient with readability
          if (isReadableText(externalText, true) || externalText.length > 1000) {
            console.log("External API parsing successful");
            return NextResponse.json({ text: externalText, method: "external-api" });
          } else {
            console.log("External API text failed readability check, checking basic criteria...");
            // Even more lenient check for Gemini output
            const hasLetters = /[a-zA-Z]/.test(externalText);
            const hasWords = externalText.split(/\s+/).length > 50;
            if (hasLetters && hasWords) {
              console.log("External API text passes basic criteria, using it");
              return NextResponse.json({ text: externalText, method: "external-api" });
            }
          }
        } else {
          console.log("External API text too short or empty");
        }
      } else {
        console.log("No external API keys available");
      }
    } catch (error: any) {
      console.error("External API parsing failed:", error.message);
      parseError = error.message;
    }

    // Method 1: Skip PDF.js server-side parsing due to Node worker issues
    console.log("Skipping PDF.js server-side parsing to avoid worker errors...");

    // Method 3: Simple text extraction fallback (last resort)
    try {
      console.log("Attempting simple text extraction...");
      const simpleText = await simpleTextExtraction(buffer);
      console.log("Simple extraction returned text length:", simpleText?.length || 0);
      
      if (simpleText && simpleText.trim().length > 0) {
        console.log("Simple extraction returned some text");
        return NextResponse.json({ 
          text: simpleText,
          method: "simple-extraction",
          warning: "Basic text extraction used - formatting may be limited"
        });
      } else {
        // Last resort - return a basic message indicating PDF was processed
        console.log("No text extracted, returning placeholder");
        return NextResponse.json({ 
          text: `PDF document processed (${file.name})\n\nThis PDF may contain images, scanned text, or complex formatting that requires OCR processing. Please try:\n1. Converting the PDF to a text-searchable format\n2. Using an OCR tool to extract text\n3. Manually copying text from the PDF`,
          method: "simple-extraction",
          warning: "Could not extract readable text - PDF may be image-based"
        });
      }
    } catch (error: any) {
      console.error("Simple extraction failed:", error.message);
      // Even if simple extraction fails, return something useful
      return NextResponse.json({ 
        text: `PDF document received (${file.name})\n\nText extraction failed. This PDF may require specialized processing.`,
        method: "simple-extraction",
        warning: "Text extraction failed - PDF may be corrupted or image-based"
      });
    }

    // If all methods fail, return a more helpful error
    console.log("All parsing methods failed, returning error");
    return NextResponse.json({ 
      error: "Could not extract text from PDF",
      details: parseError || "All parsing methods failed - PDF may be image-based or corrupted",
      suggestion: "Try converting the PDF to text format first, or ensure the PDF contains selectable text"
    }, { status: 500 });
    
  } catch (e: any) {
    console.error("API route error:", e);
    return NextResponse.json({ 
      error: "Server error during PDF processing",
      details: e?.message || "Unknown error"
    }, { status: 500 });
  }
}

// Heuristic readability check to detect garbled extraction
function isReadableText(text: string, lenient = false): boolean {
  if (!text) return false;
  const t = text.trim();
  if (t.length < 50) return false; // too short to be useful

  // For external API results (Gemini/OpenAI), be much more lenient
  if (lenient && t.length > 1000) {
    // Just check if it has reasonable letter content and some words
    const lettersDigits = (t.match(/[A-Za-z0-9]/g) || []).length;
    const ratio = lettersDigits / t.length;
    const words = t.split(/\s+/).filter(w => /[A-Za-z]{2,}/.test(w));
    
    // Very lenient criteria for API results
    return ratio > 0.3 && words.length > 10;
  }

  // Ratio of letters/digits to total
  const lettersDigits = (t.match(/[A-Za-z0-9]/g) || []).length;
  const ratio = lettersDigits / t.length;
  if (ratio < (lenient ? 0.25 : 0.45)) return false;

  // Detect excessive symbol/noise density
  const symbols = (t.match(/[^\w\s.,;:()\-\/\n]/g) || []).length;
  const symbolRatio = symbols / t.length;
  if (symbolRatio > (lenient ? 0.35 : 0.2)) return false;

  // Ensure multiple real words are present
  const words = t.split(/\s+/).filter(w => /[A-Za-z]{3,}/.test(w));
  if (words.length < (lenient ? 10 : 20)) return false;

  // Avoid long sequences of repeating garbage tokens
  if (/([A-Za-z0-9]{1,3}\s?){30,}/.test(t)) return false;

  // Check for presence of common contract markers when lenient=false
  if (!lenient) {
    const markers = [/agreement/i, /party/i, /clause/i, /terms?/i, /conditions?/i, /section/i];
    const hasMarker = markers.some(re => re.test(t));
    if (!hasMarker && t.length > 500) {
      // Not necessarily fail, but be conservative for long texts
      return ratio > 0.6 && symbolRatio < 0.15;
    }
  }

  return true;
}

// PDF.js server-side parsing with improved formatting
async function parseWithPdfJs(buffer: Buffer): Promise<string> {
  try {
    // Minimal DOMMatrix polyfill for Node.js environment (avoid DOMMatrix undefined)
    if (!(globalThis as any).DOMMatrix) {
      class DOMMatrixPolyfill {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor(_init?: any) {}
        multiplySelf() { return this; }
        translateSelf() { return this; }
        scaleSelf() { return this; }
        rotateSelf() { return this; }
        invertSelf() { return this; }
        toFloat32Array() { return new Float32Array([this.a, this.b, this.c, this.d, this.e, this.f]); }
        static fromFloat32Array(_arr: Float32Array) { return new DOMMatrixPolyfill(); }
      }
      ;(globalThis as any).DOMMatrix = DOMMatrixPolyfill as any;
    }

    // Polyfill Promise.withResolvers for Node < 20
    const P: any = Promise as any;
    if (typeof P.withResolvers !== 'function') {
      P.withResolvers = function <T>() {
        let resolve!: (value: T | PromiseLike<T>) => void;
        let reject!: (reason?: any) => void;
        const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
        return { promise, resolve, reject };
      };
    }

    // Import PDF.js Node-compatible build with normalized export
    const pdfjsLibAny: any = await import('pdfjs-dist');
    const pdfjs: any = (pdfjsLibAny as any).default || pdfjsLibAny;
    
    // Do not set workerSrc in Node; rely on disableWorker: true below

    // Load the PDF document
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableWorker: true,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    // Extract text from each page with better formatting
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract and format text with proper structure
      let pageText = '';
      
      // Group text items by approximate line (Y position)
      const lines: { [key: number]: any[] } = {};
      
      for (const item of textContent.items) {
        if ('str' in item && 'transform' in item) {
          const y = Math.round(item.transform[5] / 5) * 5; // Group by 5-pixel intervals
          if (!lines[y]) lines[y] = [];
          lines[y].push(item);
        }
      }
      
      // Sort lines by Y position (top to bottom)
      const sortedYPositions = Object.keys(lines)
        .map(Number)
        .sort((a, b) => b - a); // Higher Y values first (top of page)
      
      for (const y of sortedYPositions) {
        // Sort items within each line by X position (left to right)
        const lineItems = lines[y].sort((a, b) => a.transform[4] - b.transform[4]);
        
        let lineText = '';
        for (const item of lineItems) {
          const text = item.str.trim();
          if (text) {
            if (lineText && !lineText.endsWith(' ') && !text.startsWith(' ')) {
              lineText += ' ';
            }
            lineText += text;
          }
        }
        
        if (lineText.trim()) {
          if (pageText) pageText += '\n';
          pageText += lineText;
        }
      }
      
      // Add page break
      fullText += pageText + '\n\n';
    }
    
    // Clean up excessive whitespace while preserving structure
    return fullText
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/[ \t]+/g, ' ') // Multiple spaces to single space
      .trim();
      
  } catch (error) {
    console.error("PDF.js parsing error:", error);
    throw error;
  }
}

// External API parsing function
async function parseWithExternalAPI(buffer: Buffer, filename: string, apiKey: string): Promise<string> {
  try {
    // Try Gemini API first (if available)
    if (process.env.GEMINI_API_KEY && apiKey === process.env.GEMINI_API_KEY) {
      return await parseWithGemini(buffer, apiKey);
    }
    
    // Try OpenAI Vision API for PDF parsing
    if (process.env.OPENAI_API_KEY && apiKey === process.env.OPENAI_API_KEY) {
      return await parseWithOpenAI(buffer, apiKey);
    }
    
    // Try Google Document AI first
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT) {
      return await parseWithGoogleDocumentAI(buffer, apiKey);
    }
    
    // Try Azure Form Recognizer
    if (process.env.AZURE_FORM_RECOGNIZER_ENDPOINT) {
      return await parseWithAzureFormRecognizer(buffer, apiKey);
    }
    
    return "";
  } catch (error) {
    console.error("External API parsing error:", error);
    return "";
  }
}

// Gemini API for document parsing
async function parseWithGemini(buffer: Buffer, apiKey: string): Promise<string> {
  try {
    console.log("Starting Gemini 2.0 Flash API call...");
    // Convert PDF to base64
    const base64Pdf = buffer.toString('base64');
    console.log("PDF converted to base64, length:", base64Pdf.length);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Extract all text content from this PDF document while preserving the original formatting and structure. 

IMPORTANT FORMATTING RULES:
1. Maintain paragraph breaks and line spacing
2. Preserve section headings and titles
3. Keep bullet points and numbered lists intact
4. Maintain table structure where possible
5. Preserve indentation and spacing
6. Keep contract clauses properly separated
7. Maintain any numbered sections or subsections

Return the extracted text with proper formatting, line breaks, and structure preserved. Do not add any commentary or explanations - just the formatted extracted text.`
            },
            {
              inline_data: {
                mime_type: 'application/pdf',
                data: base64Pdf
              }
            }
          ]
        }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0
        }
      })
    });

    console.log("Gemini API response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
  } catch (error) {
    console.error("Gemini parsing error:", error);
    return "";
  }
}

// OpenAI API for document parsing
async function parseWithOpenAI(buffer: Buffer, apiKey: string): Promise<string> {
  try {
    // Convert PDF to base64
    const base64Pdf = buffer.toString('base64');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text content from this PDF document. Return only the extracted text without any additional formatting or comments.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || "";
    
  } catch (error) {
    console.error("OpenAI parsing error:", error);
    return "";
  }
}

// Google Document AI integration
async function parseWithGoogleDocumentAI(buffer: Buffer, apiKey: string): Promise<string> {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us';
    
    if (!projectId) {
      throw new Error("GOOGLE_CLOUD_PROJECT not configured");
    }

    // Convert buffer to base64
    const base64Content = buffer.toString('base64');
    
    const endpoint = `https://documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/general:process`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawDocument: {
          content: base64Content,
          mimeType: 'application/pdf'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google Document AI failed: ${response.status}`);
    }

    const result = await response.json();
    return result.document?.text || "";
    
  } catch (error) {
    console.error("Google Document AI error:", error);
    return "";
  }
}

// Azure Form Recognizer integration
async function parseWithAzureFormRecognizer(buffer: Buffer, apiKey: string): Promise<string> {
  try {
    const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
    
    if (!endpoint) {
      throw new Error("AZURE_FORM_RECOGNIZER_ENDPOINT not configured");
    }

    const response = await fetch(`${endpoint}/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2023-07-31`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/pdf',
      },
      body: buffer
    });

    if (!response.ok) {
      throw new Error(`Azure Form Recognizer failed: ${response.status}`);
    }

    const operationLocation = response.headers.get('Operation-Location');
    if (!operationLocation) {
      throw new Error("No operation location returned");
    }

    // Poll for results
    let attempts = 0;
    while (attempts < 30) { // Max 30 seconds
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const resultResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
        }
      });

      if (resultResponse.ok) {
        const result = await resultResponse.json();
        if (result.status === 'succeeded') {
          return result.analyzeResult?.content || "";
        } else if (result.status === 'failed') {
          throw new Error("Azure analysis failed");
        }
      }
      
      attempts++;
    }
    
    throw new Error("Azure analysis timeout");
    
  } catch (error) {
    console.error("Azure Form Recognizer error:", error);
    return "";
  }
}

// Simple text extraction as last resort
async function simpleTextExtraction(buffer: Buffer): Promise<string> {
  try {
    console.log("Starting simple text extraction...");
    
    // Try multiple approaches for text extraction
    let extractedText = "";
    
    // Method 1: Look for text between stream markers
    const str = buffer.toString('utf8');
    const textMatches = str.match(/stream\s*(.*?)\s*endstream/g);
    if (textMatches && textMatches.length > 0) {
      console.log("Found", textMatches.length, "stream sections");
      for (const match of textMatches) {
        const cleaned = match
          .replace(/stream\s*|\s*endstream/g, '')
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleaned.length > 10) {
          extractedText += cleaned + ' ';
        }
      }
    }
    
    // Method 2: Look for common PDF text patterns
    if (!extractedText.trim()) {
      console.log("No stream text found, trying pattern matching...");
      const patterns = [
        /BT\s+.*?ET/g,  // Text objects
        /Tj\s*\[(.*?)\]/g,  // Text showing
        /\((.*?)\)\s*Tj/g   // Text in parentheses
      ];
      
      for (const pattern of patterns) {
        const matches = str.match(pattern);
        if (matches) {
          console.log("Found", matches.length, "text patterns");
          extractedText += matches.join(' ');
          break;
        }
      }
    }
    
    // Method 3: Fallback - return any readable text found
    if (!extractedText.trim()) {
      console.log("No patterns found, extracting any readable text...");
      const readableText = str.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (readableText.length > 50) {
        extractedText = readableText.substring(0, 1000); // Limit to first 1000 chars
      }
    }
    
    console.log("Simple extraction result length:", extractedText.length);
    return extractedText.trim();
  } catch (error) {
    console.error("Simple extraction error:", error);
    return "";
  }
}
