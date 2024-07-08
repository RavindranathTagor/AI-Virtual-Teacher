require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const formalExample = {
  question: "What is the capital of France?",
  answer: "The capital of France is Paris.",
  explanation: [
    {
      point: "Location",
      detail: "Paris is located in the north-central part of France."
    },
    {
      point: "Significance",
      detail: "Paris is known for its art, fashion, gastronomy, and culture."
    }
  ],
  additional_info: [
    {
      resource: "Wikipedia - Paris",
      link: "https://en.wikipedia.org/wiki/Paris"
    }
  ]
};

const casualExample = {
  question: "What's the capital of France?",
  answer: "The capital of France is Paris.",
  explanation: [
    {
      point: "Location",
      detail: "Paris is in the northern central part of France."
    },
    {
      point: "Importance",
      detail: "Paris is famous for its art, fashion, food, and culture."
    }
  ],
  additional_info: [
    {
      resource: "Wikipedia - Paris",
      link: "https://en.wikipedia.org/wiki/Paris"
    }
  ]
};

export async function GET(req) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not found" }),
      { status: 500 }
    );
  }

  const speech = req.nextUrl.searchParams.get("speech") || "formal";
  const question = req.nextUrl.searchParams.get("question") || "Have you ever been to Japan?";
  const speechExample = speech === "formal" ? formalExample : casualExample;

  const prompt = `You are an AI Virtual Teacher. Your student asks you a question about any topic. You should respond with a comprehensive and informative answer in JSON format. The format should include:
- question: the question asked by the student,
- answer: the answer to the question,
- explanation: an array of points and their details explaining the answer, ${JSON.stringify(speechExample.explanation)}
- additional_info: an array of additional resources or links related to the question.${JSON.stringify(speechExample.additional_info)}


You always respond with a JSON object with the following format: 
{
  "question": "",
  "answer": "",
  "explanation": [{
    "point": "",
    "detail": ""
  }],
  "additional_info": [{
    "resource": "",
    "link": ""
  }]
}
Respond to the following question:
"${question}"`;
//How to say "${question}" in Japanese in ${speech} speech?`;


  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();

  console.log(text);
  return new Response(
    text,
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
