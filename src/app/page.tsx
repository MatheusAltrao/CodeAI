'use client';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CornerDownLeft } from 'lucide-react';
import { FormEvent, useOptimistic, useState, useTransition } from 'react';

import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type MessageType = {
  type: 'user' | 'ia';
  content: string;
  id?: string;
  isBold?: boolean;
  isTitle?: boolean;
};

type ChoiceType = {
  message: { content: string };
};

export default function Home() {
  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<MessageType[]>([]);

  const [isPending, startTransition] = useTransition();

  const [optimisticMessages, addOptimisticMessage] = useOptimistic<MessageType[], MessageType>(
    messages,
    (messages, newMessage) => [...messages, newMessage]
  );

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    const userMessage: MessageType = { type: 'user', content: prompt };
    addOptimisticMessage(userMessage);

    startTransition(async () => {
      setPrompt('');

      try {
        const response = await fetch('/api/openia', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        setMessages((prev) => [
          ...prev,
          userMessage, // Add user message to the actual state
          ...result.choices.map((choice: ChoiceType) => ({
            type: 'ia',
            content: choice.message.content,
          })),
        ]);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
  };

  return (
    <div className="h-screen lg:py-10">
      <div className=" lg:rounded-xl  bg-muted/50 w-full max-w-[900px] flex flex-1 flex-col h-full  mx-auto">
        <Header />

        <div className="h-full w-full grid grid-rows-[5fr_1fr] ">
          <div className="row-span-6 p-4 gap-4 flex max-h-[550px] flex-col  flex-1 overflow-y-auto ">
            {optimisticMessages.map((msg, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                key={index}
                className={`message-${msg.type}`}
              >
                <ReactMarkdown
                  className={
                    'space-y-5 prose prose-p:text-base prose-h1:text-2xl prose-h2:text-lg prose-a:text-blue-500 '
                  }
                >
                  {msg.content}
                </ReactMarkdown>
              </motion.div>
            ))}

            {isPending && (
              <Loader
                className="animate-spin text-primary"
                size={20}
              />
            )}
          </div>
          <div className="p-4">
            <form
              onSubmit={handleSendMessage}
              className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
            >
              <Label
                htmlFor="message"
                className="sr-only"
              >
                Message
              </Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                id="message"
                placeholder="Pergunte-me qualquer coisa. "
                className="min-h-28 resize-none font-medium border-0 p-3 shadow-none focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <div className="flex items-center p-3 pt-0">
                <Button
                  disabled={prompt.length == 0 || isPending}
                  type="submit"
                  size="sm"
                  className={`ml-auto gap-1.5 ${prompt.length == 0 ? 'opacity-60' : 'opacity-100'}`}
                >
                  Enviar
                  <CornerDownLeft className="size-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
