import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DayPlan } from "./types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const modelName = "gemini-2.5-flash";

export const extractStrengthsFromMedia = async (
  base64Data: string,
  mimeType: string
): Promise<string> => {
  const prompt = `
    Analyze this image or document. It is a Gallup CliftonStrengths (StrengthsFinder) result report.
    
    Your task is to EXTRACT the list of strengths in their specific ranked order (1, 2, 3... up to 34).
    
    Return ONLY the list as plain text, one strength per line, with their number.
    Do not add any conversational text.
    
    Example Output format:
    1. Strategic
    2. Learner
    3. Achiever
    ...
    34. Consistency
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Vision extraction error:", error);
    throw new Error("Failed to read the file. Please try a clearer image or paste text manually.");
  }
};

export const generatePlanFromGoal = async (
  goal: string,
  userProfile: UserProfile,
  feedback?: string,
  currentPlanContext?: DayPlan
): Promise<DayPlan> => {
  // Use the raw text to ensure all 34 are available
  const strengthContext = userProfile.strengthsRawText.length > 20 
    ? `User's Full CliftonStrengths Profile (1-34 Ordered): \n${userProfile.strengthsRawText}`
    : `User's Top Strengths: ${userProfile.topStrengths.join(", ")}`;
  
  let userPrompt = `User's Goal: "${goal}". Current Time: ${new Date().toLocaleTimeString()}. Generate a plan for the rest of the day.`;
  
  if (feedback && currentPlanContext) {
    userPrompt += `\n\nCONTEXT: The user is refining an existing plan. 
    Previous Plan Summary: ${currentPlanContext.tasks.length} tasks.
    USER FEEDBACK (CRITICAL): "${feedback}"
    
    Please RE-GENERATE the tasks. Respect the user's feedback. 
    If they said "too much", reduce tasks. 
    If they said "I don't need X", remove it.
    If they said "More detail", break it down further.`;
  }

  const systemInstruction = `
    You are an expert productivity psychologist using the "Gallup StrengthsFinder" framework.
    Your task is to build a "Low-Friction Execution Plan" for the user.

    DATA:
    ${strengthContext}
    
    METHODOLOGY (The 34-Theme Strategy):
    1. **Analyze the Hierarchy**: 
       - **Dominant Themes (Rank 1-10)**: These are the user's "Superpowers". Use these to drive the main tasks. 
         *Example: High 'Ideation' needs brainstorming time. High 'Achiever' needs a checklist.*
       - **Supporting Themes (Rank 11-20)**: Use these to assist.
       - **Lesser Themes (Rank 30-34)**: These are "Energy Drains" or "Weaknesses".
         *CRITICAL*: DO NOT assign tasks that purely rely on these strengths. If the goal requires it, provide a 'Workaround' or 'Compensation Strategy' in the SOP using a Top 5 strength.
         *Example: If 'Discipline' is #34, DO NOT create a rigid minute-by-minute schedule. Instead, create flexible time blocks (Flow).*
         *Example: If 'Woo' (Winning Others Over) is #34, DO NOT say "Call 5 people". Say "Send these 5 pre-written emails".*

    2. **De-Ambiguity Protocol**:
       - Convert vague goals ("Research market") into micro-actions ("Open Google, Search 'Competitor Price', Copy 3 prices").
       - Max task duration: 45 mins.

    3. **Tone**: Supportive, coaching, non-judgmental.

    OUTPUT RULES:
    - Output language MUST match the User's input language.
    - JSON format only.
    - In the 'rationale' field, explicitly mention which strength is being used or which weakness is being mitigated (e.g., "Using your #1 Strategic to bypass your #34 Consistency").
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          goal: { type: Type.STRING, description: "Refined goal title" },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                sop: { type: Type.STRING, description: "Step-by-step specific instruction. If mitigating a weakness, explain the workaround." },
                startTime: { type: Type.STRING },
                durationMinutes: { type: Type.INTEGER },
                energyType: { 
                  type: Type.STRING, 
                  enum: ["Deep Focus", "Light/Admin", "Social/Collaboration", "Rest/Recharge"] 
                },
                rationale: { type: Type.STRING, description: "Why this fits their strengths profile (mention specific ranks)" }
              },
              required: ["id", "title", "description", "sop", "startTime", "durationMinutes", "energyType", "rationale"]
            }
          },
          energyDistribution: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.INTEGER }
              }
            }
          }
        },
        required: ["goal", "tasks", "energyDistribution"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No plan generated");
  
  const rawData = JSON.parse(text);
  
  return {
    ...rawData,
    id: currentPlanContext?.id || Date.now().toString(), // Keep ID if updating, else new
    createdAt: currentPlanContext?.createdAt || Date.now(),
    journalNotes: currentPlanContext?.journalNotes || ""
  } as DayPlan;
};