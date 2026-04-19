import * as z from 'zod';

export const chatSchema = z.object({
	id: z.string(),
	title: z.string()
});

export type chat = z.infer<typeof chatSchema>;
