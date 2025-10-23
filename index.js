// index.js
const express = require("express");
const fetch = require("node-fetch"); // v2
require("dotenv").config();

const app = express();
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_KEY;
if (!OPENAI_KEY) {
  console.error("⚠️ OPENAI_KEY não definida. Define a var de ambiente OPENAI_KEY.");
  // continua pra facilitar debug local, mas vai falhar nas requisições
}

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "missing message" });

    // Ajusta o modelo conforme quiser (cuidado com custo)
    const payload = {
      model: "gpt-4o-mini", // troque se quiser outro modelo
      messages: [
        { role: "system", content: "Você é R2D2, um assistente zoeiro que responde em português." },
        { role: "user", content: message }
      ],
      max_tokens: 500
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("OpenAI error:", r.status, text);
      return res.status(500).json({ error: "OpenAI error", status: r.status, body: text });
    }

    const j = await r.json();
    const reply = j?.choices?.[0]?.message?.content ?? JSON.stringify(j);
    // devolve formato simples pro ESP32
    return res.json({ reply });
  } catch (err) {
    console.error("proxy error:", err);
    return res.status(500).json({ error: "proxy internal error" });
  }
});

// health
app.get("/", (req, res) => res.send("R2D2 proxy alive"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy rodando na porta ${PORT}`));
