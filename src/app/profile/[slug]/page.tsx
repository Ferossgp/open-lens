"use client";
import { LucideLoader } from "lucide-react";
import useSWR, { Fetcher } from "swr";

const fetcher: Fetcher<any, string> = async (...args) => {
  const res = await fetch(...args).then((res) => res.json());
  return res;
};

interface Params {
  params: {
    slug: string;
  };
}

export default function Page(params: Params) {
  const { data } = useSWR(`/api/profile?slug=${params.params.slug}`, fetcher);

  if (data == null || data.profile == null) {
    return (
      <div className="flex items-center justify-center w-full">
        <LucideLoader size={36} className="animate-spin" />
      </div>
    );
  }

  const { profile, description } = data;

  return (
    <div className="flex flex-1 h-full flex-col items-center gap-8">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full md:w-2/4">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {profile.name} ({params.params.slug})
          </h3>
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        </div>
        <div className="flex flex-col space-y-1.5 pb-6 px-6">
          <p className="text-base">AI profile</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
