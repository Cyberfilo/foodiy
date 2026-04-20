import OpenAI from 'openai';
import { z } from 'zod';
import {
  type MealAnalyzer,
  type DietParser,
  type AnalyzeMealInput,
  type ClarifyMealInput,
  type ParseDietInput,
} from './adapter';
import { MEAL_SYSTEM_PROMPT, MEAL_CLARIFY_SYSTEM_PROMPT, DIET_SYSTEM_PROMPT } from './prompts';
import { structuredMealSchema, dietPlanSchema } from './schemas';
import type { DietPlan, StructuredMeal } from '@/types';

const DEFAULT_MODEL = 'gpt-5.4';

export class OpenAIAdapter implements MealAnalyzer, DietParser {
  private client: OpenAI;
  private model: string;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY not set');
    this.client = new OpenAI({ apiKey: key });
    this.model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  }

  async analyze(input: AnalyzeMealInput): Promise<StructuredMeal> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: MEAL_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: input.userNote
              ? `Analyze this meal. User note: ${input.userNote}`
              : 'Analyze this meal.',
          },
          { type: 'image_url', image_url: { url: input.imageBase64DataUrl, detail: 'high' } },
        ],
      },
    ];

    const raw = await this.callJSON(messages);
    return parseWithFallback(raw, structuredMealSchema);
  }

  async clarify(input: ClarifyMealInput): Promise<StructuredMeal> {
    const qaText = input.userAnswers
      .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join('\n\n');
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: MEAL_CLARIFY_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              `Previous analysis:\n${JSON.stringify(input.previousJson)}\n\n` +
              `User answers:\n${qaText}`,
          },
          { type: 'image_url', image_url: { url: input.imageBase64DataUrl, detail: 'high' } },
        ],
      },
    ];
    const raw = await this.callJSON(messages);
    return parseWithFallback(raw, structuredMealSchema);
  }

  async parse(input: ParseDietInput): Promise<DietPlan> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: DIET_SYSTEM_PROMPT },
      { role: 'user', content: input.text.slice(0, 40_000) },
    ];
    const raw = await this.callJSON(messages);
    const parsed = parseWithFallback(raw, dietPlanSchema);
    return parsed as DietPlan;
  }

  private async callJSON(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  ): Promise<unknown> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error('empty response from OpenAI');
    try {
      return JSON.parse(text);
    } catch {
      // Best-effort recovery: strip code fences
      const stripped = text.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '');
      return JSON.parse(stripped);
    }
  }
}

function parseWithFallback<T>(raw: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  throw new Error(`AI response did not match schema: ${result.error.issues.map((i) => `${i.path.join('.')}:${i.message}`).join(', ')}`);
}
