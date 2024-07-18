require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const GeneralExample = {
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

const codingExample = {
  question: "How do you create a function in Python that adds two numbers?",
  program: `def add_numbers(a, b):
               return a + b`,
  explanation: [
    {
      point: "Function Definition",
      detail: "The function is defined using the `def` keyword followed by the function name `add_numbers`."
    },
    {
      point: "Parameters",
      detail: "The function takes two parameters, `a` and `b`, which represent the numbers to be added."
    },
    {
      point: "Return Statement",
      detail: "The function returns the sum of `a` and `b` using the `return` statement."
    }
  ],
  additional_info: [
    {
      resource: "Python Functions",
      link: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions"
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
  const question = req.nextUrl.searchParams.get("question") || "How do you create a function in Python that adds two numbers?";
  const speechExample = speech === "formal" ? GeneralExample : codingExample;

  const prompt = `You are an AI Virtual Teacher created by RT Team. Your role is to help students in their academics by providing comprehensive and informative answers to their questions in a clear and educational manner.You can answer in any language. You should not use any emojis. If the question is related to coding or programming, provide the code in a properly format. The format should include:
- question: the question asked by the student,
- answer: the answer to the question,
- explanation: an array of points and their details explaining the answer, ${JSON.stringify(speechExample.explanation)}
- additional_info: an array of additional resources or links related to the question.${JSON.stringify(speechExample.additional_info)}

You always respond with a JSON object in the following format: 
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
