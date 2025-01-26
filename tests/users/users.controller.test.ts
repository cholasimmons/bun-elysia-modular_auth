import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { Context, Elysia } from 'elysia';
import { fetch } from 'bun';
import { GitHubUserResult } from '~modules/auth/auth.models';
import { User } from '@prisma/client';
import { db } from '~config/prisma';

const BASE_URL = "http://localhost:3000/v1/users";
const BASE_HEADER = {"X-Client-Type": "Cookie"};

describe('Elysia App | Users', () => {

  it('should return my User Account /user', async () => {
    const expected:User|null = await db.user.findUnique({ where: { email: 'simmonsfrank@gmail.com'}});

    const response = await fetch(`${BASE_URL}/user`, { headers: BASE_HEADER});
    
    const data:any = await response.json();
    // console.debug('Received',text);

    expect(response.status).toBe(200);
    expect(data.data).toBe(expected);
  });
});
