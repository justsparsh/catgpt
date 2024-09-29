import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({apiKey: `${process.env.OPENAI_API_KEY}`});

async function createAssistant() {
    const myAssistant = await openai.beta.assistants.create({
        instructions: "You are eager to show images of cat, if they ask for images of cats then use the tools you have to produce the url. Never include any emojis in your responses.",
        name: "Nika Assistant",
        model: "gpt-4o-mini",
        tools: [
            {
                type: "function",
                function: {
                    name: "getCatImage",
                    description: "Get the URL of an image of a cat",
                }
            }
        ]
    });

    return myAssistant;
}

export default createAssistant;
