import { RequestHandler } from 'express';
import type { ServerError } from '../../types/types.ts';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ItemCategoryEnum = z.enum([
  'CLOTHING',
  'ELECTRONICS',
  'TOILETRIES',
  'DOCUMENTS',
  'ACCESSORIES',
  'MEDICATIONS',
  'EQUIPMENT',
]);

const WeatherConditionEnum = z.enum([
  'HOT',
  'COLD',
  'RAINY',
  'SNOWY',
  'MILD',
  'HUMID',
  'TROPICAL',
]);

const PackingItem = z.object({
  item: z.string(),
  quantity: z.number(),
  category: ItemCategoryEnum,
  isEssential: z.boolean(),
  notes: z.string().optional(),
});

const LocationDetails = z.object({
  country: z.string(),
  city: z.string(),
  weatherConditions: z.array(WeatherConditionEnum),
  localRestrictions: z.array(z.string()).optional(),
  recommendedItems: z.array(z.string()),
});

const TripDuration = z.object({
  startDate: z.string(),
  endDate: z.string(),
  totalDays: z.number(),
});

const PackingList = z.object({
  location: LocationDetails,
  duration: TripDuration,
  items: z.array(PackingItem),
  lastUpdated: z.string(),
  specialConsiderations: z.array(z.string()).optional(),
});

export const queryOpenAIChat: RequestHandler = async (_req, res, next) => {
  const { userQuery } = res.locals;
  const devPrompt = `You are a professional trip advisor responsible for creating detailed, customized packing lists. You will be provided with location information, and you must respond with a structured packing list that includes the following components:

1. LOCATION ASSESSMENT
- Analyze the destination's weather patterns and seasonal conditions
- Consider local cultural norms and dress codes
- Account for any local restrictions or regulations
- Identify location-specific recommended items

2. ITEM CATEGORIZATION
Each item must be categorized into one of the following:
- CLOTHING: Weather-appropriate attire and cultural considerations
- ELECTRONICS: Essential devices and location-specific adapters
- TOILETRIES: Personal care items considering local availability
- DOCUMENTS: Required paperwork and identification
- ACCESSORIES: Climate-appropriate gear
- MEDICATIONS: Essential health items
- EQUIPMENT: Activity-specific gear

3. QUANTITY DETERMINATION
- Base quantities on trip duration
- Account for laundry availability
- Consider local shopping possibilities
- Adjust for weather variations

4. ESSENTIAL FLAGGING
- Mark items as essential based on:
  * Safety requirements
  * Legal requirements
  * Weather protection
  * Health necessities

5. SPECIAL CONSIDERATIONS
- Note any destination-specific warnings
- Include cultural sensitivity requirements
- Add specific climate adaptations
- List activity-specific requirements

Format your response according to the provided schema, ensuring all required fields are populated. Include detailed notes for items where additional context would be valuable.

Remember to always consider:
- Weather conditions specific to travel dates
- Cultural appropriateness
- Activity requirements
- Transportation restrictions
- Accommodation facilities
- Local availability of items
`;

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
    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini-2024-07-18',
      messages: conversation,
      response_format: zodResponseFormat(PackingList, 'packing-list'),
    });

    if (completion.choices[0].message.refusal) {
      const error: ServerError = {
        log: 'OpenAI refused the request',
        status: 403,
        message: { err: completion.choices[0].message.refusal },
      };
      return next(error);
    }

    if (!completion.choices[0].message.parsed) {
      const error: ServerError = {
        log: 'OpenAI did not return parsed data',
        status: 500,
        message: { err: 'No parsed response' },
      };
      return next(error);
    }

    // TODO: remove and or comment out debug line
    // console.dir(completion.choices[0].message.parsed, { depth: null });
    console.log(
      '>>> OPENAI COMPLETION <<<',
      JSON.stringify(completion.choices[0].message.parsed, null, 2),
    );

    res.locals.tripAdvice = completion.choices[0].message.parsed;

    return next();
  } catch (err) {
    console.log('→ Caught an error in try/catch!'); // #11

    // Print the error object *in full*:
    console.log('Error details:', JSON.stringify(err, null, 2));
    // or:
    console.dir(err, { depth: null });
    const error: ServerError = {
      log: 'queryOpenAI: Error: OpenAI error',
      status: 500,
      message: { err: `An error occurred while querying OpenAI: ${err}` },
    };
    return next(error);
  }
};
