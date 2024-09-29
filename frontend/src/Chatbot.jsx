import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_DELAY = 1000;

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const lastMessageTime = useRef(Date.now());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const handleSend = async () => {
    // Check if messages are sent too fast
    const currentTime = Date.now();
    if (currentTime - lastMessageTime.current < RATE_LIMIT_DELAY) {
      setError("Please wait a moment before sending another message.");
      return;
    }
    lastMessageTime.current = currentTime;

    const trimmedInput = input.trim();
    setInput('');
    setError(null);

    //Check if message is only whitespace
    if (!trimmedInput) {
      setError("Please enter a message.");
      return;
    }

    //Check if message is too long
    if (trimmedInput.length > MAX_MESSAGE_LENGTH) {
      setError(`Message must be ${MAX_MESSAGE_LENGTH} characters or less.`);
      return;
    }

    //Display user message
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: trimmedInput, sender: 'user' },
    ]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/message/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ prompt: trimmedInput }),
      });

      const headers = response.headers;
      const contentType = headers.get('Content-Type');
      console.log(contentType);

      if(contentType === "application/json; charset=utf-8") {
        const data = await response.json();
        console.log(data);
        if (data.imageUrl) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: <img src={data.imageUrl} alt="bot response" className="max-w-full h-auto" />, sender: 'bot' },
          ]);
          setIsLoading(true);
        }
      } else {

        //read the streamed message
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          //parse through the text
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) {
                  throw new Error(data.error);
                }
                fullResponse += data;
                //display text as it comes in
                setMessages((prevMessages) => {
                  const lastMessage = prevMessages[prevMessages.length - 1];
                  if (lastMessage && lastMessage.sender === 'bot') {
                    return [
                      ...prevMessages.slice(0, -1),
                      { ...lastMessage, text: fullResponse },
                    ];
                  } else {
                    return [...prevMessages, { text: fullResponse, sender: 'bot' }];
                  }
                });
              } catch (err) {
                setError(err.message);
                break;
              }
            }
          }
        }
      }
    } catch (err) {
      setError("An error occurred while sending your message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100">
      <div className="bg-blue-600 text-white p-4 text-lg font-bold">
        Nika Cat Supplier
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg bg-white">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="max-w-[70%] p-3 rounded-lg bg-red-100 text-red-800">
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white">
        <div className="flex items-center bg-gray-100 rounded-full p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent outline-none px-2"
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;