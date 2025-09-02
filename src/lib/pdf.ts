// Client-side PDF text extraction using pdfjs-dist

/**
 * Attempt server-side parsing via /api/parse-pdf (uses external APIs)
 */
export async function extractTextViaApi(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  
  const res = await fetch("/api/parse-pdf", {
    method: "POST",
    body: form,
    headers: { "cache-control": "no-store" },
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    console.error("API parse failed:", res.status, errorData);
    throw new Error(`API parse failed: ${errorData.error || res.status}`);
  }
  
  const data = (await res.json()) as { text?: string; warning?: string; error?: string };
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  if (data.warning) {
    console.warn("PDF parsing warning:", data.warning);
  }
  
  return data.text || "";
}

/**
 * Client-side parsing using pdfjs-dist as a fallback.
 */
export async function extractTextViaPdfJs(file: File): Promise<string> {
  const pdfjsLibAny: any = await import("pdfjs-dist");
  const pdfjs: any = (pdfjsLibAny as any).default || pdfjsLibAny;

  // Set a dummy workerSrc to satisfy PDF.js requirements
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = 'data:application/javascript,';
  }

  const arrayBuffer = await file.arrayBuffer();
  // Disable worker explicitly to avoid workerSrc issues
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer, disableWorker: true });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    // @ts-ignore
    const content = await page.getTextContent();
    const strings: string[] = content.items.map((it: any) => it.str);
    fullText += strings.join(" ") + "\n";
  }
  return fullText;
}

/**
 * Multi-extractor pipeline: try server API first, then pdf.js fallback.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  // First: server parsing
  try {
    const viaApi = await extractTextViaApi(file);
    if (viaApi && viaApi.trim().length > 0) return viaApi;
  } catch (_) {
    // ignore and fallback
  }
  // Fallback: client pdf.js
  return extractTextViaPdfJs(file);
}
