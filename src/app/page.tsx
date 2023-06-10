"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormEventHandler, use, useCallback, useMemo, useState } from "react";
import { LucideLoader } from "lucide-react";
import useSWR, { Fetcher } from "swr";

const EXAMPLE_PROMPTS = [
  "Folks who posted about ETH Prague",
  "Who to follow to get rich 🤑",
  "Whos the most degen on lens?",
  "Looking for people to colaborate in Music NFTs",
];

const fetcher: Fetcher<{ handle: string }[], string> = async (...args) => {
  const res = await fetch(...args).then((res) => res.json());
  return res.users;
};

export default function Home() {
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { data: attendees } = useSWR("/api/attendees", fetcher);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      try {
        setIsLoading(true);
        event.preventDefault();
        const endpoint = `/api/explore?q=${inputValue}`;

        const options = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        const response = await fetch(endpoint, options);

        const result = await response.json();
        console.log("response from server", result);
        setResponse(result.response);
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue]
  );

  return (
    <div className="flex flex-1 h-full flex-col items-center gap-8">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full md:w-2/4">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Explore Lens
          </h3>
          <p className="text-sm text-muted-foreground">
            Find people that match your interest the most!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 pt-0">
          <div className="flex flex-row gap-4">
            <Input
              placeholder="Looking to know..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              name="query"
            />
            <Button
              size="lg"
              className="gap-2 flex flex-row"
              disabled={isLoading}
            >
              {isLoading && <LucideLoader size={24} className="animate-spin" />}
              Explore
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm">Examples:</p>
            {EXAMPLE_PROMPTS.map((prompt) => (
              <p
                key={prompt}
                className="text-sm text-muted-foreground"
                onClick={() => setInputValue(prompt)}
              >
                {prompt}
              </p>
            ))}
          </div>
        </form>
      </div>
      {response != null ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full md:w-2/4">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Recommendation
            </h3>
            <p className="text-sm text-muted-foreground">
              We have a perfect match for you!
            </p>
          </div>
          <div className="flex flex-row gap-4 p-6 pt-0">
            <p className="text-sm">{response}</p>
          </div>
        </div>
      ) : null}

      {attendees != null && attendees.length > 0 ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full md:w-2/4">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              📍 ETH Prague
            </h3>
            <p className="text-sm text-muted-foreground">
              People now at ETH Prague
            </p>
          </div>
          <div className="flex flex-row flex-wrap gap-4 p-6 pt-0">
            {attendees.map((attendee: { handle: string }) => (
              <a
                className="h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground"
                href={`/profile/${attendee.handle}`}
                key={attendee.handle}
              >
                <p className="text">{attendee.handle}</p>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <LucideLoader size={36} className="animate-spin" />
        </div>
      )}
    </div>
  );
}
