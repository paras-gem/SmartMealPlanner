const { ai } = require('./config');
const { z } = require('genkit');

// Flow 1: Identify Ingredients from Image
const identifyIngredientsFlow = ai.defineFlow(
  {
    name: 'identifyIngredients',
    inputSchema: z.object({
      imageBase64: z.string(), // Image in base64 format
    }),
    outputSchema: z.object({
      ingredients: z.array(z.string()),
      suggestion: z.string(),
    }),
  },
  async (input) => {
    const response = await ai.generate({
      prompt: [
        { text: 'Look at this fridge/pantry photo and identify as many food ingredients as you can. List only the ingredients found. Also, give a short 1-sentence cooking suggestion based on them.' },
        { media: { url: input.imageBase64, contentType: 'image/jpeg' } },
      ],
      config: {
        temperature: 0.4,
      },
    });

    const text = response.text();
    // Simple parsing logic: assume the model returns a list or JSON-like text
    // In production, you'd use structured output with a JSON schema
    return {
      ingredients: text.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace('-', '').trim()),
      suggestion: "I see several fresh items that would make a great stir-fry or salad!",
    };
  }
);

// Flow 2: Smart Nutrition Chat
const nutriChatFlow = ai.defineFlow(
  {
    name: 'nutriChat',
    inputSchema: z.object({
      history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({ text: z.string() })),
      })),
      message: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const response = await ai.generate({
      system: 'You are NutriBot, a helpful and knowledgeable nutritionist and professional chef. You provide advice on healthy eating, recipes, macro-tracking, and general wellness. Keep responses encouraging and practical.',
      prompt: input.message,
      history: input.history,
      config: {
        temperature: 0.7,
      },
    });

    return response.text();
  }
);

module.exports = { identifyIngredientsFlow, nutriChatFlow };
