import { GoogleGenerativeAI } from "@google/generative-ai";

// Debug your API key
console.log("GOOGLE_GEMINI_API_KEY exists:", !!process.env.GOOGLE_GEMINI_API_KEY);
console.log("API Key first 10 chars:", process.env.GOOGLE_GEMINI_API_KEY?.substring(0, 10));

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Safe JSON parser
function safeJsonParse(text: string) {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Failed to parse Gemini JSON:", err);
    throw new Error("Invalid JSON returned from Gemini");
  }
}

export async function getAIAssessment(prompt: string, jobId: string) {
  try {
    const systemPrompt = `
You are an expert HR assistant. Your task is to generate assessment forms.

⚠️ Rules:
- Respond ONLY with valid JSON.
- Do not include explanations, markdown fences, or natural language text.
- The JSON MUST strictly follow this TypeScript schema:

{
  "jobId": "string",
  "title": "string",
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
- Each section MUST contain a "questions" array.
- NEVER return "questions": 10 or a number — always expand to full objects.
- Provide at least 2–5 example questions per section (or as many as requested).

---

Example (shortened):

{
  "jobId": "123",
  "title": "Frontend Engineer Assessment",
  "sections": [
    {
      "id": "sec1",
      "title": "General Questions",
      "questions": [
        {
          "id": "q1",
          "type": "short",
          "label": "What is your name?",
          "required": true
        },
        {
          "id": "q2",
          "type": "long",
          "label": "Describe your experience with React.",
          "required": false,
          "maxLength": 300
        }
      ]
    }
  ]
}

---

Now, create a new JSON following this schema and example, based on the user’s request.
`;


    const result = await model.generateContent([systemPrompt, prompt]);
    const text = result.response.text();
    return safeJsonParse(text);
  } catch (error) {
    console.error("❌ getAIAssessment failed:", error);
    throw error;
  }
}

// Run once for testing
(async () => {
  const res = await getAIAssessment(
    "hey give me an assessment with 3 sections: aptitude, HR, and React technical (10 questions each)",
    "5"
  );
  console.log("✅ Gemini Assessment:", JSON.stringify(res, null, 2));

})();
