import OpenAI from "openai";
import dotenv from "dotenv";
import { EventEmitter } from 'events';
import getCatImage from "./getCatImage.js";

dotenv.config();
const openai = new OpenAI({ apiKey: `${process.env.OPENAI_API_KEY}` });

class EventHandler extends EventEmitter {
    constructor(client) {
      super();
      this.client = client;
    }
  
    async onEvent(event) {
      try {
        if (event.event === "thread.run.requires_action") {
          await this.handleRequiresAction(
            event.data,
            event.data.id,
            event.data.thread_id,
          );
        }
      } catch (error) {
        console.error("Error handling event:", error);
      }
    }

    async handleRequiresAction(data, runId, threadId) {
      try {
        const toolOutputs = await Promise.all(
          data.required_action.submit_tool_outputs.tool_calls.map(async (toolCall) => {
            if (toolCall.function.name === "getCatImage") {
              return {
                tool_call_id: toolCall.id,
                output: await getCatImage(),
              };
            }
          }));
        await this.submitToolOutputs(toolOutputs, runId, threadId);
      } catch (error) {
        console.error("Error processing required action:", error);
      }
    }
  
    async submitToolOutputs(toolOutputs, runId, threadId) {
      try {
        const stream = this.client.beta.threads.runs.submitToolOutputsStream(
          threadId,
          runId,
          { tool_outputs: toolOutputs },
        );
        for await (const event of stream) {
          // console.log(event);
          this.emit("event", event);
        }
      } catch (error) {
        console.error("Error submitting tool outputs:", error);
      }
    }
  }
  
  export default EventHandler;