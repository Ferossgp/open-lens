import { NextRequest } from "next/server";
import client from "@/lib/graphql";
import thegraph from "@/lib/thegraph";
import { FETCH_HANDLE_BY_ADDRESS } from "@/queries/Profile";
import { FETCH_POAPS, PoapHolders } from "@/queries/Poaps";
import { sql } from "@vercel/postgres";

export const config = {
  runtime: 'edge',
}

function chunk<T>(collection: T[], size: number): T[][] {
  var result = [];

  for (var x = 0; x < Math.ceil(collection.length / size); x++) {
    var start = x * size;
    var end = start + size;

    result.push(collection.slice(start, end));
  }

  return result;
}

export const fetchHandleByAddress = async (poaps: string[]) => {
  const chunks = chunk(poaps, 10)

  const handles = await Promise.all(chunks.map(async (chunk) => {
    return client.request<{ profiles: { items: { handle: string }[] } }>(FETCH_HANDLE_BY_ADDRESS, {
      request: { ownedBy: chunk },
    }).then((data) => data.profiles.items)
  }));


  return handles.flat();
}

// Check if user holds the poap
const EVENT_ID = 129410
export const getPoapHolders = async () => {
  const holders = await thegraph.request<PoapHolders>(FETCH_POAPS, {
    event: EVENT_ID,
  }).then((data) => data.event)

  return holders.tokens.map((token) => token.owner.id)
}

export default async function handler(req: NextRequest) {
  const holders = await getPoapHolders()
  const handles = await fetchHandleByAddress(holders)
  for (const item of handles) {
    await sql`INSERT INTO users (handle, attendee) VALUES (${item.handle.toLowerCase()}, true) ON CONFLICT (handle) DO UPDATE SET attendee = true;`
  }

  return new Response(
    JSON.stringify({
      response: 'ok',
      handles,
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  )
}