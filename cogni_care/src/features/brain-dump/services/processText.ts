/* eslint-disable @typescript-eslint/ban-ts-comment */
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { redactPII } from "@/lib/pii-redactor";
import { prisma } from "@/lib/prisma";

export async function processBrainDump(rawText: string, patientId: string) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  console.log(`Gemini API Key check (first 5 chars): ${apiKey.substring(0, 5)}...`);

  const genAI = new GoogleGenerativeAI(apiKey);
  // Switching to 2.0-flash as 1.5-flash and pro are returning 404s for this key
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    // 1. Privacy First: Redact PII
    const safeText = redactPII(rawText);

    // 2. AI Analysis & Normalization (Gemini)
    console.log(`ENTRY_TEXT_TO_PROCESS: >>>${safeText}<<<`);
    console.log("Starting Gemini Analysis...");

    const prompt = `Analyze the following patient health log.
    Categorize the content into exactly these fields: physical, mood, cognitive, sleep, social.
    - For each field, provide a single word or very short phrase (e.g., 'Headache', 'Happy', 'Exhausted').
    - If a category is not mentioned, return null for that field.
    - Return output strictly as a JSON object.
    
    Log: "${safeText}"`;

    let responseText: string;
    let analysis: any = null;

    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
      // Cleanup responseText for JSON parsing
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      analysis = JSON.parse(responseText || "{}");
      console.log("Gemini analysis success:", analysis);
    } catch (apiErr: any) {
      console.warn("Gemini API failed, using Local Heuristic Fallback. Reason:", apiErr.message);

      const text = safeText.toLowerCase();
      const getBestMatch = (keywords: string[], inputText: string) => {
        const text = inputText.toLowerCase();
        const bodyParts = ["head", "stomach", "mind", "social", "people", "group"];

        const matches = keywords
          .map(kw => ({
            word: kw,
            index: text.indexOf(kw.toLowerCase()),
            length: kw.length
          }))
          .filter(m => m.index !== -1);

        if (matches.length === 0) return null;

        // Sort by: 1. Length (Longest first) 2. Symptom vs Body Part (Symptom first)
        matches.sort((a, b) => {
          if (b.length !== a.length) return b.length - a.length;
          const aIsBody = bodyParts.includes(a.word.toLowerCase());
          const bIsBody = bodyParts.includes(b.word.toLowerCase());
          if (aIsBody && !bIsBody) return 1;
          if (!aIsBody && bIsBody) return -1;
          return 0;
        });

        const finalMatch = matches[0];
        return finalMatch.word.charAt(0).toUpperCase() + finalMatch.word.slice(1);
      };

      const physicalKws = ["headache", "aching", "pain", "ache", "pressure", "stomach", "hurt", "fever", "sore", "cough", "nausea", "tired", "fatigue", "dizzy", "weak", "cold", "flu", "vision", "balance", "head"];
      const moodKws = ["happy", "joy", "glad", "good", "great", "fine", "okay", "sad", "anxious", "worry", "angry", "depressed", "worried", "calm", "stressed", "upset", "content", "mood"];
      const cognitiveKws = ["confused", "forgot", "memory", "focus", "clarity", "brain fog", "thinking", "concentrate", "mind", "thought"];
      const sleepKws = ["sleep", "insomnia", "tired", "awake", "dream", "nightmare", "restless", "nap", "bed", "exhausted"];
      const socialKws = ["friends", "family", "talked", "visit", "alone", "lonely", "social", "people", "group", "meeting", "called"];

      analysis = {
        physical: getBestMatch(physicalKws, text),
        mood: getBestMatch(moodKws, text),
        cognitive: getBestMatch(cognitiveKws, text),
        sleep: getBestMatch(sleepKws, text),
        social: getBestMatch(socialKws, text),
      };

      console.log(`Heuristic match results:`, analysis);

      // Ensure at least physical shows something if everything is null
      if (!Object.values(analysis).some(v => v !== null)) {
        analysis.physical = "General wellness";
      }
      console.log("Final Heuristic analysis:", analysis);
    }

    // Log the final analysis object before saving to the database
    console.log("Final analysis object before DB save:", analysis);

    // 2.5 Verification: Check if patient exists
    console.log(`Verifying patient existence: ${patientId}`);
    const userExists = await prisma.user.findUnique({ where: { id: patientId } });

    if (!userExists) {
      console.error(`CRITICAL: Patient ID ${patientId} not found in database!`);
      // Fallback: Optional: Auto-create for testing if missing? 
      // No, better to report it so we can find why.
      return {
        success: false,
        error: `Patient ID ${patientId} does not exist. Please run seed.`,
        details: "patient_not_found"
      };
    }

    // 3. Save to Database
    const log = await prisma.symptomLog.create({
      data: {
        patientId,
        rawText: safeText,
        physical: analysis.physical,
        mood: analysis.mood,
        cognitive: analysis.cognitive,
        sleep: analysis.sleep,
        social: analysis.social,
      },
    });
    return { success: true, log };
  } catch (err: any) {
    console.error("Brain Dump Error Details:", err);
    return {
      success: false,
      error: err.message || "Processing failed",
      details: err.code || "unknown_error"
    };
  }
}
