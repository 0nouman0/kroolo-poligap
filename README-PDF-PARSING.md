# PDF Parsing Configuration

The contract review system supports multiple PDF parsing methods for maximum reliability:

## Parsing Methods (in order of preference)

1. **PDF.js** (Client-side compatible library) - Primary method
2. **External API Services** - Enhanced accuracy for complex PDFs
3. **Simple text extraction** - Fallback for basic PDFs

## External API Configuration

To enable enhanced PDF parsing with external services, add these environment variables:

### Google Gemini API (Recommended)
```bash
GEMINI_API_KEY=your-gemini-api-key
```

### OpenAI API
```bash
OPENAI_API_KEY=your-openai-api-key
```

### Google Document AI
```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us  # or your preferred location
DOCUMENT_AI_API_KEY=your-google-api-key
# OR use service account
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### Azure Form Recognizer
```bash
AZURE_FORM_RECOGNIZER_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_FORM_RECOGNIZER_KEY=your-azure-api-key
```

## Setup Instructions

1. **For Google Gemini API (Easiest):**
   - Get an API key from Google AI Studio
   - Add `GEMINI_API_KEY=your-key` to your environment
   - Uses Gemini 1.5 Pro to extract text from PDFs with high accuracy

2. **For OpenAI API:**
   - Get an API key from OpenAI
   - Add `OPENAI_API_KEY=your-key` to your environment
   - Uses GPT-4 Vision to extract text from PDFs

2. **For Google Document AI:**
   - Create a Google Cloud project
   - Enable Document AI API
   - Create a service account or API key
   - Set the environment variables

3. **For Azure Form Recognizer:**
   - Create an Azure Cognitive Services resource
   - Get the endpoint and API key
   - Set the environment variables

4. **Fallback Mode:**
   - If no API keys are configured, the system uses PDF.js and simple extraction
   - This works for most standard PDFs with selectable text

## Error Handling

The system gracefully falls back between methods:
- If PDF.js fails → Try external API (OpenAI/Google/Azure)
- If external API fails → Try simple extraction
- If all fail → Return helpful error message

## File Limitations

- Maximum file size: 10MB
- Supported format: PDF only
- Works best with text-based PDFs (not scanned images)

## Quick Start

1. Add `GEMINI_API_KEY=your-key` to your `.env.local` file
2. Upload a PDF in the contract review interface
3. The system will automatically extract text using the best available method

## API Priority Order

The system tries parsing methods in this order:
1. **PDF.js** - Fast, works for most standard PDFs
2. **Gemini API** - High accuracy, handles complex layouts and scanned documents
3. **OpenAI API** - Alternative AI-powered extraction
4. **Google Document AI** - Enterprise document processing
5. **Azure Form Recognizer** - Microsoft's document intelligence
6. **Simple extraction** - Basic fallback method
