import { RequestHandler } from 'express';
import type { ServerError } from '../../types/types.ts';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const queryOpenAIChat: RequestHandler = async (_req, res, next) => {
  const { userQuery } = res.locals;
  const devPrompt = `You are a helpful assistant`;
  const conversation: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: devPrompt,
    },
    {
      role: 'user',
      content: userQuery,
    },
    /*
    {
      role: 'assistant',
      content: `Here is some context:`,
    },
    */
  ];

  if (!userQuery) {
    const error: ServerError = {
      log: 'queryOpenAIChat did not receive a user query',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversation,
      temperature: 0.5,
    });

    // TODO: remove and or comment out debug line
    console.log(completion.choices[0].message.content);

    if (!completion.choices[0].message.content) {
      const error: ServerError = {
        log: 'OpenAI did not return a completion',
        message: { err: 'An error occurred while querying OpenAI' },
        status: 500,
      };
      return next(error);
    }

    res.locals.tripAdvice = completion.choices[0].message.content;

    return next();
  } catch (err) {
    const error: ServerError = {
      log: 'queryOpenAI: Error: OpenAI error',
      status: 500,
      message: { err: `An error occurred while querying OpenAI: ${err}` },
    };
    return next(error);
  }
};
