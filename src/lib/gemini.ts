import { GoogleGenerativeAI } from "@google/generative-ai";

// Debug your API key
console.log("GOOGLE_GEMINI_API_KEY exists:", !!process.env.GOOGLE_GEMINI_API_KEY);
console.log("API Key first 10 chars:", process.env.GOOGLE_GEMINI_API_KEY?.substring(0, 10));

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// JSON parser
function safeJsonParse(text: string) {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error(" Failed to parse Gemini JSON:", err);
    throw new Error("Invalid JSON returned from Gemini");
  }
}
export async function getAIAssessment(prompt: string, jobId: string, title: string) {
  try {
    const systemPrompt = `
      You are an expert HR assistant. Your task is to generate assessment forms.

      Rules:
      - Respond ONLY with valid JSON.
      - Do not include explanations, markdown fences, or natural language text.
      - The JSON MUST strictly follow this TypeScript schema:

      {
        "jobId": "${jobId}",   
        "title": "${title}",      
        "sections": [
          {
            "id": "string (uuid)",
            "title": "string",
            "questions": [
              {
                "id": "string",
                "type": "short" | "long" | "single" | "multi" | "numeric",
                "label": "string",
                "required": true | false,
                "options"?: string[],
                "maxLength"?: number,
                "min"?: number,
                "max"?: number
              }
            ]
          }
        ]
      }

      Important:
      - The "jobId" MUST always be exactly "${jobId}".
      - The "title" MUST always be exactly "${title}".
      - Each section MUST contain a "questions" array.
      - NEVER return "questions": 10 or a number — always expand to full objects.
      - Provide at least 2–5 example questions per section (or as many as requested).

      Important content rules:
      - Only produce plain JSON, no markdown, no explanations, no prose.
      - Questions and options must always be text-based (no figures, images, diagrams, charts, graphs).
      - Options must always be simple strings (no special formatting like "Option A:", "Figure A", or "All of the above").
      - Do not use placeholders like "???" or "TBD". Every label and option must be fully written out.
      - Do not produce duplicate options in the same question.
      - Keep question labels concise but clear (1–2 sentences max).
      - If numeric ranges are required, always provide valid "min" and "max" values as integers.
      - If "type" is "multi" or "single", the "options" array must contain at least 2 valid strings.
      - Always include "required": true or false for each question.
      - Ensure each section has at least 1–10 valid questions.
      - Do not include HTML, Markdown, or LaTeX syntax in labels or options.
      - All strings must be human-readable plain text.
      - Avoid culturally sensitive, discriminatory, or illegal content.
      - Keep language professional and appropriate for a hiring assessment.

      Now, create a new JSON following this schema and rules, based on the user’s request:
      ${prompt}
    `;

    const result = await model.generateContent([systemPrompt]);
    const text = result.response.text();
    return safeJsonParse(text);
  } catch (error) {
    console.error("getAIAssessment failed:", error);
    throw error;
  }
}


/*(async () => {
  const res = await getAIAssessment(
    "hey give me an assessment with 3 sections: aptitude, HR, and React technical (10 questions each)",
    "5"
  );
  console.log(" Gemini Assessment:", JSON.stringify(res, null, 2));

})();*/
