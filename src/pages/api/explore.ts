import type { NextRequest } from 'next/server'
import { IMessage, UserResponse } from './types';
import { getOpenAICompletion } from '@/lib/ai';
import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
}

const systemMessageTemplate = (users: UserResponse[]): IMessage => {
  const messages = users.map((user) => {
    if (user.description == null) return ''

    const words = user.description
      .replace('User: ', '')
      .replace('Description: ', '')
      .replace('Interests: ', '')
      .replaceAll('#', '')
      .split(' ')

    const interm = words.length > 50 ? words.slice(0, 50).join(' ') : words.join(' ')

    const description = interm
    return `${user.handle}: ${description}, `
  }).join('\n')

  return {
    role: "system",
    content: `You are an expert at matching people.

            No matter what the user ask, You should find one profile user should follow based on the asked query.
            
            You should always return their lens handle in the response. The handle is delimited by ":" from the user description.

            Domain specific terminology:
            1. Degen - a person who is interested in high risk high reward investments

            Here is the list of all available profiles: ${messages}
            `,
  };
}

const MAX = 100

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (query != null && query.length > 500) {
    return new Response(
      JSON.stringify({
        response: 'query too long'
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }
    )
  }

  console.log('Processing user query:', query)
  const { rows: users } = await sql`SELECT * from users limit ${MAX}`;

  console.log(`Processing top ${users.length} users on Lens`)

  const messages = [
    systemMessageTemplate(users as UserResponse[]),
    {
      role: "user",
      content: query?.trim() || "who is the most interested in DeFi?",
    },
  ];

  const response = await getOpenAICompletion({
    conversation: messages,
  });

  console.log('Response from Open AI:', response)

  return new Response(
    JSON.stringify({
      response
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  )
}