import { z } from 'zod';

// Enum de categorías
export const PostCategoryEnum = z.enum([
  'ARTICULOS',
  'GUIAS_LEGALES',
  'JURISPRUDENCIA_COMENTADA',
  'NOTICIAS',
  'OPINION',
  'RESENAS'
]);

export type PostCategory = z.infer<typeof PostCategoryEnum>;

export const createPostSchema = z.object({
   id: z.string().min(1, 'Id is required').max(200, 'Id is too long'),
   slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
   excerpt: z.string().optional(),
   title: z.string(),
   content: z.any().optional(),
   categorie: PostCategoryEnum.optional(),
   tags: z.string().optional(),
   status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
   featuredImage: z.string().optional(),
   authorId: z.string(),
});

export const updatePostSchema = createPostSchema.partial();

export const PostParamsSchema = z.object({
  id: z.string().cuid(),
});

export const PostQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  date: z.string().optional(),
  categorie: PostCategoryEnum.optional()
});

export type CreatePostBody = z.infer<typeof createPostSchema>
export type UpdatePostBody = z.infer<typeof updatePostSchema>
export type PostQueryParams = z.infer<typeof PostQuerySchema>