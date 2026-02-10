import { GoogleGenerativeAI } from "@google/generative-ai";
import OrderSchema from "../model/OrderSchema.js";
import TableSchema from "../model/TableSchema.js";
import MenuSchema from "../model/MenuSchema.js";
// import Order from "../model/OrderSchema.js";
// import Table from "../model/TableSchema.js";
// import MenuItem from "../model/MenuItemSchema.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const askAI = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("AI Error: GEMINI_API_KEY is missing");
      return res.status(500).json({ message: "AI configuration error" });
    }

    // Fetch business data filtered by owner
    const orders = await OrderSchema.find({ owner: userId }).sort({ createdAt: -1 }).limit(50);
    const tables = await TableSchema.find({ owner: userId });
    const menu = await MenuSchema.find({ owner: userId });

    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const openOrders = orders.filter(o => o.status === 'active').length;

    const context = `
Cafe Status:
- Total Tables: ${tables.length}
- Recent Orders (Last 50): ${orders.length}
- Revenue from Recent Completed Orders: NRS. ${totalRevenue.toFixed(2)}
- Active (Open) Orders: ${openOrders}

Menu Snapshot:
${menu.slice(0, 10).map((m) => `- ${m.name}: NRS. ${m.price}`).join("\n")}
${menu.length > 10 ? `...and ${menu.length - 10} more items.` : ""}

Recent Activity:
${orders.slice(0, 5).map((o) => {
      const tableNum = (typeof o.table === 'object' && o.table?.tableNumber) || o.tableNumber || "Unknown";
      return `- Table ${tableNum}: NRS. ${o.totalAmount} (${o.status})`;
    }).join("\n")}
    `;

    const prompt = `
You are "CafePilot AI", a smart assistant for a cafe owner. 
Use the provided business data to answer the owner's question accurately.
If the data doesn't contain the answer, say "I don't have enough data to answer that accurately."

${context}

Owner's Question: ${question}

Instructions:
- Be concise (max 3-4 sentences).
- Sound professional yet helpful.
- Focus on business health and insights.
- Format numbers nicely with "NRS." prefix.
    `;

    const getAIResponse = async (modelName) => {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "You are 'CafePilot AI', a world-class cafe business analyst. Your goal is to help cafe owners understand their business performance, identify trends, and provide actionable advice based ONLY on the provided data. Be professional, data-driven, and concise."
      });

      console.log(`AI: Attempting response using ${modelName} for user ${userId}...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    };

    let text;
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-flash-latest"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        text = await getAIResponse(modelName);
        break; // Success!
      } catch (err) {
        lastError = err;
        const isQuotaError = err.status === 429 || err.message?.includes("429") || err.response?.status === 429;

        if (isQuotaError && modelName !== modelsToTry[modelsToTry.length - 1]) {
          console.warn(`AI: ${modelName} quota exceeded, trying next fallback...`);
          continue;
        }
        throw err; // Re-throw if it's not a quota error or if it's the last model
      }
    }

    res.json({ reply: text });
  } catch (err) {
    console.error("AI Error Detail:", err);

    // Specific handling for 429 (Quota Exceeded)
    if (err.status === 429 || err.message?.includes("429") || err.response?.status === 429) {
      return res.status(429).json({
        message: "Google AI Free Tier limit reached. Please wait a moment (about 30-60 seconds) for the quota to reset.",
        retryAfter: 60
      });
    }

    res.status(500).json({
      message: "AI assistant is currently busy. Please try again in a few seconds.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
