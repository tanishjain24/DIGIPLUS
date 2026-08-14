const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const analyzeTicketWithAI = async (ticket) => {
  const prompt = `
You are an AI IT Service Desk assistant for DigiPlus.

Analyze this support ticket and provide practical troubleshooting guidance.

Ticket Title:
${ticket.title}

Description:
${ticket.description}

Category:
${ticket.category}

Priority:
${ticket.priority}

Return ONLY valid JSON in exactly this format:

{
  "summary": "A short summary of the problem.",
  "possibleCause": "The most likely technical cause.",
  "suggestedActions": [
    "First practical troubleshooting step",
    "Second practical troubleshooting step",
    "Third practical troubleshooting step"
  ]
}

Rules:
- Keep the summary concise.
- Give a realistic technical cause.
- Give practical and safe troubleshooting steps.
- Do not invent facts.
- Do not use markdown.
- Return ONLY the JSON object.
`;

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content:
            "You are a professional IT service desk troubleshooting assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,
    });

    const content =
      response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned an empty response.");
    }

    const cleanedContent = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let result;

    try {
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error(
        "AI JSON parsing error:",
        parseError
      );

      console.error(
        "Raw AI response:",
        content
      );

      throw new Error(
        "AI returned invalid JSON."
      );
    }

    return {
      summary: result.summary || "",

      possibleCause:
        result.possibleCause || "",

      suggestedActions:
        Array.isArray(result.suggestedActions)
          ? result.suggestedActions
          : [],
    };
  } catch (error) {
    console.error(
      "Groq API error:",
      error.message
    );

    throw new Error(
      `Groq AI error: ${error.message}`
    );
  }
};

module.exports = {
  analyzeTicketWithAI,
};