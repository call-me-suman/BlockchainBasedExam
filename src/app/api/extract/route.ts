import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GENAI_KEY || "");

/**
 * The prompt sent to the AI model. It's dynamically adjusted
 * based on whether the input is text or an image.
 */
const getPrompt = (inputType: "image" | "text") => `
  Extract only the questions, their options, and the correct answer from this ${inputType}.
  Return the output strictly as a JSON list like this:

  [
    {
      "question": "What is 2+2?",
      "options": ["2", "3", "4", "5"],
      "answer_index": 2 // 0-based index of correct option
    },
    ...
  ]

  Do not include any explanation, code block markers like \`\`\`json, or any other text outside of the JSON array.
`;

/**
 * Handles POST requests to /api/extract
 * It can accept either a file or a text field in a multipart/form-data request.
 */
export async function POST(req: NextRequest) {
  if (!process.env.GENAI_KEY) {
    return NextResponse.json(
      { error: "Google AI API key not configured." },
      { status: 500 }
    );
  }

  try {
    let file: File | null = null;
    let text: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Handle raw JSON input
      const body = await req.json();
      text = body.text || null;
    } else if (contentType.includes("multipart/form-data")) {
      // Handle form-data input
      const formData = await req.formData();
      file = formData.get("file") as File | null;
      text = formData.get("text") as string | null;
    } else {
      return NextResponse.json(
        { error: "Unsupported Content-Type" },
        { status: 400 }
      );
    }

    let modelRequestParts: (
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    )[];

    if (file) {
      // File case
      const buffer = Buffer.from(await file.arrayBuffer());
      modelRequestParts = [
        {
          inlineData: {
            mimeType: file.type,
            data: buffer.toString("base64"),
          },
        },
        { text: getPrompt("image") },
      ];
    } else if (text) {
      // Text case
      modelRequestParts = [{ text }, { text: getPrompt("text") }];
    } else {
      return NextResponse.json(
        { error: "No file or text provided in the request." },
        { status: 400 }
      );
    }

    // --- Call Gemini ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: modelRequestParts }],
    });

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*?\}\s*\]/);

    if (!jsonMatch) {
      console.error("Gemini Response Text:", responseText);
      return NextResponse.json(
        { error: "Could not find a valid JSON array in the AI response." },
        { status: 500 }
      );
    }

    const extractedData = JSON.parse(jsonMatch[0]);
    return NextResponse.json(extractedData);
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: `An internal server error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
