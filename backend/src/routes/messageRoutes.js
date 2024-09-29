import express from 'express';
import threadManager from '../threadManager.js';
import assistantManager from '../assistantManager.js';
import OpenAI from "openai";
import dotenv from "dotenv";
import EventHandler from '../handleRun.js';
import getCatImage from '../getCatImage.js';

dotenv.config();
const openai = new OpenAI({ apiKey: `${process.env.OPENAI_API_KEY}` });
const messageRoutes = express.Router();

messageRoutes.post('/new', async (req, res) => {
  try {
    const { prompt } = req.body;

    const eventHandler = new EventHandler(openai);

    const assistantId = await assistantManager.fetchAssistantId();
    const threadId = await threadManager.fetchThreadId();

    const runs = await openai.beta.threads.runs.list(threadId);

    // Cancel any previous incomplete actions
    if (runs.data.length > 0) {
      for (const run of runs.data) {
        if (run.status === "requires_action") {
          await openai.beta.threads.runs.cancel(threadId, run.id);
        }
      }
    }

    // Create a new message
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: prompt,
    });

    let yetToSetHeaders = true;

    const setHeaderIfStreaming = () => {
      if (yetToSetHeaders) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
      }
      yetToSetHeaders = false;
    }

    eventHandler.on("event", async (event) => {
      if (event.event === "thread.message.delta") {
        setHeaderIfStreaming();
        const deltaText = event.data.delta.content[0].text.value;
        res.write(`data: ${JSON.stringify(deltaText)}\n\n`);
      } else if (event.event === "thread.run.requires_action") {
        const url = await getCatImage();
        return res.status(200).json({ imageUrl: url });
      } else if (event.event === "thread.run.completed") {
        res.end();
      } else {
        eventHandler.onEvent(event);
      }
    });

    const stream = openai.beta.threads.runs.stream(
      threadId,
      { assistant_id: assistantId },
      eventHandler
    );

    for await (const event of stream) {
      eventHandler.emit("event", event);
    }

  } catch (error) {
    console.error("Error handling the request:", error);
    res.write(`data: ${JSON.stringify({ error: "Something went wrong" })}\n\n`);
    res.write("event: close\n\n");
    res.end();
  }
});

export default messageRoutes;