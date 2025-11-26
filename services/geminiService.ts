import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Role } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
אתה "אייבן" (Aivan), עוזר תכנות מומחה ובונה אתרים.
תפקידך לעזור למשתמש לכתוב קוד, לתקן באגים ולבנות אפליקציות אינטרנט מלאות.
כאשר המשתמש מבקש לבנות אתר, ספק את הקוד המלא בתוך בלוקי קוד (markdown code blocks).
אם מדובר ב-HTML/CSS/JS, נסה לאחד אותם לקובץ אחד או ספק אותם בבירור כדי שניתן יהיה להריץ אותם.
היה אדיב, מקצועי ודבר בעברית.
`;

export const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const sendMessageToGemini = async (
  prompt: string,
  history: ChatMessage[],
  files?: FileList | null,
  modelId: string = 'gemini-2.5-flash'
): Promise<string> => {
  try {
    // Construct the parts
    const parts: any[] = [{ text: prompt }];

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const filePart = await fileToPart(files[i]);
        parts.push(filePart);
      }
    }

    // Build chat history context string
    let historyContext = "";
    if (history.length > 0) {
      historyContext = "היסטוריית שיחה:\n" + history.map(msg => `${msg.role === Role.USER ? 'User' : 'Aivan'}: ${msg.text}`).join("\n") + "\n\nבקשה חדשה:\n";
      // Prepend history to the text part
      parts[0].text = historyContext + parts[0].text;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    return response.text || "מצטער, לא הצלחתי לייצר תגובה.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("שגיאה בתקשורת עם השרת.");
  }
};