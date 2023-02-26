import type { Context } from '@curveball/core';
import { BadRequest } from '@curveball/http-errors';
import { z, ZodError } from 'zod';

type CompatibleZodType = Pick<
  z.ZodType<unknown>,
  '_input' | '_output' | 'parse' | 'parseAsync'
>;

type CompatibleZodInfer<T extends CompatibleZodType> = T['_output'];

/**
 *
 * Creates validation functions for Curveball handlers and controllers
 * Throws HttpErrors that can be handled by @curveball/problem
 *
 * ### Example (es imports)
 * ```js
 * // validation.ts
 * import { validate } from 'curveball-zod'
 * const post = validate({ name: z.string() })
 *
 * // controller.ts:
 * import * as validate from './validation'
 *
 * class UserController extends Controller {
 *   post (ctx: Context) {
 *     const body = await validate.post(ctx)
 *     //    ^ { name: string }
 *   }
 * }
 * ```
 *
 * @returns a validation function
 */

export function validate<T extends CompatibleZodType>(
  validator: T
): (ctx: Context) => Promise<CompatibleZodInfer<T>> {
  return async (ctx: Context) => {
    try {
      return await validator.parseAsync(ctx.request.body);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw new BadRequest(JSON.stringify(error.flatten()));
      }
    }
  };
}
