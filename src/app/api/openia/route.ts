import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  let totalTokensUsed = 0;
  const TOKEN_LIMIT = 1000;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  const { prompt } = await request.json();

  const response = await openai.chat.completions.create({
    model: '',
    messages: [
      {
        role: 'system',
        content: 'Sempre responda em pt-BR e seu nome é Code IA',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0,
    max_tokens: TOKEN_LIMIT,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  if (response.usage) {
    totalTokensUsed += response.usage.total_tokens;

    if (totalTokensUsed >= TOKEN_LIMIT) {
      console.warn('Você atingiu o limite de tokens');
      throw new Error('Você atingiu o limite de tokens');
    }
  }

  return NextResponse.json(response);
}
