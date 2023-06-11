# Open Lens

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

## Process event attendee

Open `http://localhost:3000/api/batch` in the web browser.

This endpoint will fetch all the ETH Prague POAP holders from thegrah. 

For each attendee we will check if they are a lens user.

All lens handles will be added into the database and displayed on the home page.

## Process new user

To add a new user profile into dataset call the following url with GET method:

`http://localhost:3000/api/consume?handle=LENS_HANDLE`