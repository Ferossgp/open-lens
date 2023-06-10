import { sql } from "@vercel/postgres";
import { NextRequest } from "next/server";
import { processHandle } from "./consume";
import client from "@/lib/graphql";
import { FETCH_PROFILE, Profile } from "@/queries/Profile";

export const config = {
  runtime: "edge"
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (slug == null) {
    return new Response(
      JSON.stringify({
        response: 'no slug'
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }
    )
  }

  const data = await client.request<Profile>(FETCH_PROFILE, {
    request: { handle: slug },
  });

  const description = await processHandle(slug, true);

  return new Response(
    JSON.stringify({
      profile: data.profile,
      description: description,
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    })
}

