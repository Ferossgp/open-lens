import { sql } from "@vercel/postgres";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge"
}

export default async function handler(req: NextRequest) {
  const { rows: users } = await sql`SELECT handle from users where attendee = true;`;

  console.log(`Processing top ${users.length} users on Lens`)

  return new Response(
    JSON.stringify({
      users: users.map((user) => ({
        handle: user.handle,
      }))
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    })
}

