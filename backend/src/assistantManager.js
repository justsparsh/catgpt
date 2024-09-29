import OpenAI from "openai";
import dotenv from "dotenv";
import createAssistant from "./createAssistant.js";

dotenv.config();
const openai = new OpenAI({ apiKey: `${process.env.OPENAI_API_KEY}` });

//Singleton to maintain assistant cache
class AssistantManager {
    constructor() {
        this.assistantId = null;
    }

    async fetchAssistantId() {
        if (this.assistantId) {
            return this.assistantId;
        }

        const myAssistant = await openai.beta.assistants.list({
            order: "desc",
            limit: "1",
        });

        console.log("Cache miss");

        if (myAssistant.data && myAssistant.data.length > 0) {
            this.assistantId = myAssistant.data[0].id;
        } else {
            const asst = await createAssistant();
            this.assistantId = asst.id;
        }

        return this.assistantId;
    }
}

// Export an instance of AssistantManager
const assistantManager = new AssistantManager();
export default assistantManager;