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
      .replaceAll(/((\d+) follow)\w+/g, '')
      .replaceAll(/((\d+) comm)\w+/g, '')
      .replaceAll(/((\d+) mirr)\w+/g, '')
      .replaceAll('#', '')
      .replaceAll('\n', '')
      .split(' ')

    const interm = words.length > 30 ? words.slice(0, 30).join(' ') : words.join(' ')

    const description = interm
    return `${user.handle}: ${description}, `
  }).join('|')

  return {
    role: "system",
    content: `You are an expert at matching people.

            No matter what the user ask, You should find one profile user should follow based on the asked query.
            
            You should always return their lens name in the response. 
            The lens name and description are delimited by ":".
            Users are delimited by "|".

            Domain specific terminology:
            1. Degen - an active trader, meme coins, risky investments

            All available profiles: ${messages}
            `,
  };
}

const MAX = 80

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
  // Select random users
  const { rows: users } = await sql`SELECT * from users where description is not null order by random() limit ${MAX}`;

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