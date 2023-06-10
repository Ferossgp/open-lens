import { FETCH_PROFILE } from "@/queries/Profile";
import { IMessage } from "./types";
import client from "@/lib/graphql";
import { NextRequest } from "next/server";
import { FETCH_PROFILE_PUBLICATIONS } from "@/queries/ProfilePublications";
import { getOpenAICompletion } from "@/lib/ai";
import { sql } from "@vercel/postgres";

type Posts = {
  publications: {
    items: {
      metadata: {
        content: string;
      }
    }[]
  }
}

type Profile = {
  profile: {
    id: string,
    ownedBy: string,
    name: string,
    followNftAddress: string
    bio: string,
    stats: Record<string, number>,
  }
}

const systemMessageTemplate = (profile: Profile, posts: Posts): IMessage => {
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
            2. If the user ask many times, you should generate the interests based on the previous context.
            3. Here is the JSON containing user profile: ${JSON.stringify(profile.profile)}
            4. Here is a JSON containing a list of posts from a user separated by "|":
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

export async function processHandle(handle: string) {
  const profile = await fetchProfile(handle);
  const publications = await fetchLatestPosts(profile.profile.id)
  const messages = [
    systemMessageTemplate(profile, publications),
    {
      role: "user",
      content: "give a short description of the user, and a list of their interests. Keep it as short and concise as possible."
    },
  ];

  const resp = await getOpenAICompletion({
    conversation: messages,
  });


  await sql`INSERT INTO users (handle, description) VALUES (${handle}, ${resp}) ON CONFLICT (handle) DO UPDATE SET description = excluded.description;`

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