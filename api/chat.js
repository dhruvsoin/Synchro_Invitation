// Vercel Serverless Function: /api/chat
// Securely proxies requests to Groq Cloud using process.env.GROQ_API_KEY

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "";
  if (!apiKey) {
    return res.status(200).json({ 
      fallback: true, 
      message: "No GROQ_API_KEY configured in Vercel environment variables. Using built-in neural knowledge engine." 
    });
  }

  try {
    const { messages, model = "qwen/qwen3.8-27b" } = req.body || {};

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.6,
        max_tokens: 180
      })
    });

    if (!groqResponse.ok) {
      const err = await groqResponse.text();
      return res.status(groqResponse.status).json({ error: err });
    }

    const data = await groqResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Vercel Serverless Groq API Proxy error:", error);
    return res.status(500).json({ error: error.message });
  }
}
