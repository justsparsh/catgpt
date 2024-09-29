import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({apiKey: `${process.env.OPENAI_API_KEY}`});

async function createAssistant() {
    const myAssistant = await openai.beta.assistants.create({
        instructions: "Your job is to answer any question and use your tools to provide images of cats when asked.",
        name: "Nika Assistant",
        model: "gpt-4o-mini",
        tools: [
            {
                type: "function",
                function: {
                    name: "getCatImage",
                    description: "Gets the image of a cat",
                    parameters: {
                        type: "object",
                        properties: {
                        breed: {
                            type: "string",
                            description: "The offical breed designation (for example, it should be 'Singapura' not 'Singapore') of the cat which matches the user's description. If it is not specified by the user or such a cat does not exist, pass this as 'Any'.",
                        },
                        },
                        required: ["breed"],
                    },
                }
            }
        ]
    });

    return myAssistant;
}

export default createAssistant;
