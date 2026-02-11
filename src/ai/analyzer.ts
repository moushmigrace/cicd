import fs from "fs"

export async function analyzeTest(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf-8")

  const prompt = `
You are a strict JSON generator.

Return ONLY valid JSON.
Do NOT add explanations.
Do NOT use markdown.
Do NOT wrap in \`\`\`.

Output format:
{
  "riskScore": number,
  "productionReady": boolean,
  "issues": string[],
  "recommendations": string[]
}

Data:
${raw.slice(0, 8000)}
`

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt: prompt,
      stream: false,
    }),
  })

  const data = await response.json()

  const text = data.response || ""

  // 🔥 Extract JSON safely
  const jsonMatch = text.match(/\{[\s\S]*\}/)

  if (jsonMatch) {
    return jsonMatch[0]
  }

  return JSON.stringify({
    riskScore: 0,
    productionReady: false,
    issues: ["AI output parsing failed"],
    recommendations: ["Improve prompt formatting"],
  })
}