import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { Context, Elysia } from 'elysia';
import { fetch } from 'bun';

const BASE_URL = "http://localhost:3000/v1";
const BASE_HEADER = {"X-Client-Type": "Cookie"};

describe('Elysia App', () => {
    let app: Elysia;

    // Test Server
    //   beforeAll(() => {
    //     app = new Elysia().get('/hello', () => 'Hello World');

    //     // app.use(({ set }:any) => {
    //     //     set('X-Custom-Header', 'CustomValue');
    //     //     return;
    //     //   })

    //     app.listen(3001); // Start the app on a different port for testing
    //   });

//   afterAll(() => {
//     app.stop(); // Gracefully stop the app after tests
//   });

  it('should return Hello World greeting on /hello', async () => {
    const expected = `It's a beautiful night in ${Bun.env.TZ ?? 'your area'} isn't it ?`;

    const response = await fetch(`${BASE_URL}/hello`, { headers: BASE_HEADER});
    
    const text:any = await response.json();
    // console.debug('Received',text);

    expect(response.status).toBe(200);
    expect(text.message).toBe(expected);
    
    
  });
});
