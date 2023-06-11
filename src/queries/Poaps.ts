import { gql } from 'graphql-request'

export const FETCH_POAPS = gql`
query Events($event: ID!) {
  event(id: $event) {
    tokens(first: 1000) {
      owner {
        id
      }
    }
  }
}`

export type PoapHolders = {
  event: {
    tokens: {
      owner: {
        id: string
      }
    }[]
  }
}