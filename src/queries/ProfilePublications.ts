import { gql } from 'graphql-request'

export const FETCH_PROFILE_PUBLICATIONS = gql`
query ProfilePublications(
  $request: PublicationsQueryRequest!
  $reactionRequest: ReactionFieldResolverRequest
  $profileId: ProfileId
) {
  publications(request: $request) {
    items {
      ... on Post {
        ...PostFields
      }
      ... on Comment {
        ...CommentFields
      }
      ... on Mirror {
        ...MirrorFields
      }
    }
  }
}
fragment PostFields on Post {
  metadata {
    ...MetadataFields
  }
}

fragment StatsFields on PublicationStats {
  totalUpvotes
}
fragment MetadataFields on MetadataOutput {
  content
}

fragment CommentFields on Comment {
  reaction(request: $reactionRequest)
  mirrors(by: $profileId)
  stats {
    ...StatsFields
  }
  metadata {
    ...MetadataFields
  }
  createdAt
  appId
}

fragment MirrorFields on Mirror {
  id

  stats {
    ...StatsFields
  }
  metadata {
    ...MetadataFields
  }
  createdAt
  appId
}`