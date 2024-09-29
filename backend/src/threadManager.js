import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({ apiKey: `${process.env.OPENAI_API_KEY}` });

//Singleton to manage thread cache, not suitable for multi-user application but acceptable for this use-case
class ThreadManager {
    constructor() {
        this.threadId = null;
    }

    async fetchThreadId() {
        if (this.threadId) {
            return this.threadId;
        } else {
            const newId = await this.createThread();
            return newId;
        }

    }

    async createThread() {
        const thread = await openai.beta.threads.create();
        this.threadId = thread.id;
        return thread.id;
    }
}

const threadManager = new ThreadManager();
export default threadManager;