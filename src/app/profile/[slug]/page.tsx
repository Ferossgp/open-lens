import client from "@/lib/graphql";
import { processHandle } from "@/pages/api/consume";
import { FETCH_PROFILE, Profile } from "@/queries/Profile";
import { sql } from "@vercel/postgres";

export default async function Page({ params }: Params) {
  const { profile, description } = await getData(params.slug)
  console.log(profile)

  return (
    <div className="flex flex-1 h-full flex-col items-center gap-8">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full md:w-2/4">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">{profile.name} ({params.slug})</h3>
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        </div>
        <div className="flex flex-col space-y-1.5 pb-6 px-6">
          <p className="text-base">AI profile</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

async function getData(slug: string): Promise<Profile & {
  description?: string
}> {
  const data = await client.request<Profile>(FETCH_PROFILE, {
    request: { handle: slug },
  });

  const description = await processHandle(slug, true);

  return {
    profile: data.profile,
    description: description,
  }
}


type Params = {
  params: {
    slug: string
  }
}
