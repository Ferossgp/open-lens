import { FETCH_PROFILE, Profile } from "@/queries/Profile";
import { IMessage } from "./types";
import client from "@/lib/graphql";
import { NextRequest } from "next/server";
import { FETCH_PROFILE_PUBLICATIONS } from "@/queries/ProfilePublications";
import { getOpenAICompletion } from "@/lib/ai";
import { sql } from "@vercel/postgres";
import { isMemeHolder } from "@/lib/memeBalances";

type Posts = {
  publications: {
    items: {
      metadata: {
        content: string;
      }
    }[]
  }
}

const systemMessageTemplate = (profile: Profile, posts: Posts, memecoins: boolean): IMessage => {
  const messages = posts.publications.items.map((publication: any) => {
    return publication.metadata.content
  })
    .join(' | ')
    .replace(/(?:https?|ar|ipfs):\/\/[\n\S]+/g, '')

  return {
    role: "system",
    content: `You are a great assistant at Lens protocol, a social network application.

            You should understand the user profile based on user query with the history of users posts and profile.

            Besides, Here are some requirements:
            1. Detect patterns in the user's query and response with the most relevant interests.
            2. Here is the JSON containing user profile: ${JSON.stringify(profile.profile)}
            3. Do not include their profile stats in the response.
            4. ${memecoins ? 'User is a meme coin holder (degen)' : 'User is not a meme holder'}
            5. Here is a JSON containing a list of posts from a user separated by "|":
            ${JSON.stringify(messages).substring(0, 10000)}
            `,
  }
}
const fetchProfile = async (handle: string) => {
  const data = await client.request<Profile>(FETCH_PROFILE, {
    request: { handle: handle },
  });

  return data;
}

const fetchLatestPosts = async (id: string) => {
  const data = await client.request<Posts>(FETCH_PROFILE_PUBLICATIONS, {
    request: { limit: 50, profileId: id, publicationTypes: ["POST"] },
  });

  return data;
}

export const config = {
  runtime: 'edge',
}

export async function processHandle(handle: string, attendee?: boolean, long?: boolean): Promise<string> {
  const profile = await fetchProfile(handle);
  const [publications, memecoins] = await Promise.all([
    fetchLatestPosts(profile.profile.id),
    isMemeHolder(profile.profile.ownedBy),
  ]);

  const messages = [
    systemMessageTemplate(profile, publications, memecoins),

    long ?
      {
        role: "user",
        content: "Give a breif description of user profile, and list their interests"
      }
      :
      {
        role: "user",
        content: "In one phrase give a description in up to 10 words of the user, and a list of their interests. Keep it under 50 tokens"
      },
  ];

  const { rows: users } = await sql`SELECT * from users where handle = ${handle.toLowerCase()} limit 1;`;

  if (users.length > 0) {
    if (long && users[0].long_description != null)
      return users[0].long_description;
    else if (!long && users[0].description != null)
      return users[0].description;
  }

  const resp = await getOpenAICompletion({
    conversation: messages,
  });

  if (long)
    await sql`INSERT INTO users (handle, long_description, attendee) VALUES (${handle.toLowerCase()}, ${resp}, ${attendee}) ON CONFLICT (handle) DO UPDATE SET long_description = excluded.long_description;`
  else
    await sql`INSERT INTO users (handle, description, attendee) VALUES (${handle.toLowerCase()}, ${resp}, ${attendee}) ON CONFLICT (handle) DO UPDATE SET description = excluded.description;`

  return resp
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const handle = searchParams.get('handle')

  if (!handle) {
    return new Response(
      JSON.stringify({
        error: 'handle is required',
      }),
      {
        status: 400,
        headers: {
          'content-type': 'application/json',
        },
      }
    )
  }

  const resp = await processHandle(handle);

  return new Response(
    JSON.stringify({
      resp
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  )
}