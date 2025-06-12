import { z } from 'zod';

export const JOBS_SCHEMA = z.object({
  propuestas: z.array(
    z.object({
      title: z.string().describe('The title of the job').nullish(), // Añadido .nullish() por consistencia
      description: z.string().describe('The description of the job').nullish(),
      company: z.string().describe('The name of the company').nullish(),
      location: z.string().describe('The location of the job').nullish(),
      salary: z.string().describe('The salary of the job').nullish(),
      date: z.string().describe('The date of the job in format YYYY-MM-DD').nullish(),
      technologies: z
        .array(z.string())
        .describe(
          'A list of technologies relevant to the job (e.g., React, Angular, Vue, Odoo).',
        )
        .nullish(),
      skills: z
        .array(z.string())
        .describe(
          'A list of required skills for the job (e.g., communication, problem-solving, project management).',
        )
        .nullish(),
      experience: z
        .string()
        .describe(
          'The experience required for the job (e.g., Junior, Senior, 2+ years).',
        )
        .nullish(),
      salaryRange: z
        .object({
          min: z.number().nullish().describe('The minimum salary of the job.'),
          max: z.number().nullish().describe('The maximum salary of the job.'),
          currency: z
            .string()
            .nullish()
            .describe('The currency of the salary range (e.g., USD, EUR).'),
        })
        .nullish(),
      telegramUserId: z
        .number()
        .describe('The Telegram identifier of the poster.')
        .nullish(),
    }),
  ),
});
