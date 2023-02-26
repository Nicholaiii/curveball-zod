import { Context, MemoryRequest, MemoryResponse } from '@curveball/core';
import { isHttpError } from '@curveball/http-errors';
import test from 'ava';
import { z } from 'zod';

import { validate } from './validate';

const validator = validate(z.object({ name: z.string() }));

test('it parses a proper body', async (t) => {
  const inputBody = {
    name: 'Foo Bar',
  };

  const ctx = new Context(
    new MemoryRequest('POST', '/', 'localhost', undefined),
    new MemoryResponse('localhost')
  );

  ctx.request.body = inputBody;

  await t.notThrowsAsync(validator(ctx));
  const body = await validator(ctx);
  t.deepEqual(body, inputBody);
});

test('it throws on malformed body', async (t) => {
  const inputBody = {
    wrong: 'Foo Bar',
  };

  const ctx = new Context(
    new MemoryRequest('POST', '/', 'localhost', undefined),
    new MemoryResponse('localhost')
  );

  ctx.request.body = inputBody;

  await t.throwsAsync(validator(ctx));
  try {
    await validator(ctx);
    t.fail('Validator did not throw'); /* Should never reach */
  } catch (error: unknown) {
    if (!isHttpError(error)) {
      t.fail('Error was not an HttpError');
      return;
    }
    t.is(error.httpStatus, 400);
  }
});
