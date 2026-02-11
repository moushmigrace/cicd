import { NextResponse } from "next/server"
import { exec } from "child_process"
import path from "path"
import { analyzeTest } from "../../../ai/analyzer"

export const runtime = "nodejs"

function runK6(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
        
        // If k6 crashes completely
        if (stderr && stderr.includes("panic")) {
          reject(new Error(stderr))
          return
        }
  
        // If thresholds fail, k6 returns non-zero code
        // But we still want to continue
        resolve()
      })
    })
  }

export async function POST() {
  try {
    // 📁 Output JSON file path
    const resultPath = path.join(process.cwd(), "auth-result.json")

    // 🪟 Windows absolute k6 path (important)
    const k6Path = `"C:\\Program Files\\k6\\k6.exe"`

    // 🧠 Correct Windows command
    const command = `${k6Path} run performance\\auth.load.js --summary-export="${resultPath}"`

    // 1️⃣ Run k6 performance test
    await runK6(command)

    // 2️⃣ Run Offline AI (Ollama)
    const aiRaw = await analyzeTest(resultPath)

    let aiReport

    if (!aiRaw || typeof aiRaw !== "string") {
      aiReport = {
        message: "AI returned empty or invalid response",
        raw: aiRaw,
      }
    } else {
      try {
        aiReport = JSON.parse(aiRaw)
      } catch {
        aiReport = {
          message: "AI returned non-JSON response",
          raw: aiRaw,
        }
      }
    }

    // 3️⃣ Final Response
    return NextResponse.json({
      status: "success",
      message: "AI Performance Test Completed",
      report: aiReport,
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Something went wrong",
      },
      { status: 500 }
    )
  }
}