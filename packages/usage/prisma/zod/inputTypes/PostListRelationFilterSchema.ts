import { z } from 'zod';
import * as PrismaClient from '@prisma/client';
import { PostWhereInputSchema } from './PostWhereInputSchema';

export const PostListRelationFilterSchema: z.ZodType<PrismaClient.Prisma.PostListRelationFilter> = z.object({
  every: z.lazy(() => PostWhereInputSchema).optional(),
  some: z.lazy(() => PostWhereInputSchema).optional(),
  none: z.lazy(() => PostWhereInputSchema).optional(),
}).strict()