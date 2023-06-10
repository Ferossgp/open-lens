This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Env Vars

Create a `.env` file and set the OPENAI_KEY and vercel postgres keys.

## Process new user

To add a new user profile into dataset call the following url with GET method:

`http://localhost:3000/api/consume?handle=LENS_HANDLE`