import { createServerFn } from "@tanstack/react-start";
import { BIN_COLORS, MATERIALS, RECYCLABILITY, type Analysis } from "./scan-types";

const MAX_DATA_URL_CHARS = 8_000_000; // ~6MB image
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "objectName",
    "binColor",
    "binName",
    "primaryMaterial",
    "secondaryMaterials",
    "recyclability",
    "identificationExplanation",
    "preparationSteps",
    "environmentalInfo",
    "safetyWarnings",
    "uncertaintyNotes",
    "needsVerification",
  ],
  properties: {
    objectName: { type: "string" },
    binColor: { type: "string", enum: [...BIN_COLORS] },
    binName: { type: "string" },
    primaryMaterial: { type: "string", enum: [...MATERIALS] },
    secondaryMaterials: { type: "array", items: { type: "string", enum: [...MATERIALS] } },
    recyclability: { type: "string", enum: [...RECYCLABILITY] },
    identificationExplanation: { type: "string" },
    preparationSteps: { type: "array", items: { type: "string" } },
    environmentalInfo: { type: "string" },
    safetyWarnings: { type: "array", items: { type: "string" } },
    uncertaintyNotes: { type: ["string", "null"] },
    needsVerification: { type: "boolean" },
  },
};

const INSTRUCTIONS = `You are ScrapSense, a careful recycling assistant. Look at the photo and identify the main object and its likely materials.
Rules:
- Base everything on what is visible. Never invent numeric confidence scores or percentages.
- A photo cannot determine exact metal alloy or guarantee recyclability; say so when relevant.
- If the material is ambiguous (e.g. steel vs aluminum, coated paper, plastic type), set needsVerification true, use "uncertain" or "mixed_unknown" where appropriate, and explain in uncertaintyNotes how to verify (magnet test, resin code, etc.).
- binColor/binName: the most common bin for this item (typical North American scheme: blue = mixed recycling, green = glass or organics, gray/black = trash, special_dropoff for batteries/e-waste/hazardous). binName is a short label like "Blue recycling bin".
- preparationSteps: 2-4 short, practical steps (empty, rinse, remove caps/labels, separate parts...).
- environmentalInfo: 2-3 sentences on why recycling this material matters; only well-established facts.
- safetyWarnings: include warnings for batteries, electronics, sharp edges, aerosols, chemicals, broken glass. Empty array if none.
- If no recognizable object is visible, set objectName to "Unrecognized object", primaryMaterial "mixed_unknown", recyclability "uncertain".
- Always remind that local recycling rules vary (in uncertaintyNotes or explanation when helpful).`;

export type AnalyzeResult =
  | { ok: true; analysis: Analysis }
  | { ok: false; error: string; retryable: boolean };

export const analyzeImage = createServerFn({ method: "POST" })
  .inputValidator((input: { image: string }) => {
    if (!input || typeof input.image !== "string") throw new Error("Missing image");
    const m = /^data:([a-z/+-]+);base64,/.exec(input.image);
    if (!m || !ALLOWED.includes(m[1] ?? "")) throw new Error("Unsupported file type. Use JPG, PNG or WEBP.");
    if (input.image.length > MAX_DATA_URL_CHARS) throw new Error("Image is too large.");
    return { image: input.image };
  })
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, error: "AI service is not configured.", retryable: false };

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          instructions: INSTRUCTIONS,
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: "Analyze this item for recycling." },
                { type: "input_image", image_url: data.image },
              ],
            },
          ],
          text: { format: { type: "json_schema", name: "material_analysis", strict: true, schema } },
          reasoning: { effort: "low" },
          stream: true,
          store: false,
        }),
      });
    } catch {
      return { ok: false, error: "Could not reach the AI service. Check your connection.", retryable: true };
    }

    if (!res.ok || !res.body) {
      let msg = "";
      try {
        const j = await res.json();
        msg = j?.error?.message || j?.message || "";
      } catch {}
      if (res.status === 429) return { ok: false, error: "Too many requests right now. Please wait a moment and retry.", retryable: true };
      if (res.status === 402) return { ok: false, error: msg || "AI credits are exhausted for this workspace.", retryable: false };
      if (res.status >= 500) return { ok: false, error: "The AI service had a temporary problem. Please retry.", retryable: true };
      return { ok: false, error: msg || `Analysis failed (${res.status}).`, retryable: false };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let text = "";
    let failure: string | null = null;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const chunk = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const ev = JSON.parse(payload);
            if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
            else if (ev.type === "response.failed" || ev.type === "error")
              failure = ev.response?.error?.message || ev.error?.message || ev.message || "Analysis failed.";
            else if (ev.type === "response.refusal.delta") failure = "The AI declined to analyze this image.";
          } catch {}
        }
      }
    }

    if (failure) return { ok: false, error: failure, retryable: false };
    try {
      const analysis = JSON.parse(text) as Analysis;
      return { ok: true, analysis };
    } catch {
      return { ok: false, error: "The AI returned an unreadable result. Please retry.", retryable: true };
    }
  });
