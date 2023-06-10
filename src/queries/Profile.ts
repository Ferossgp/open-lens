import { gql } from 'graphql-request'

export const FETCH_PROFILE = gql`
query Profile($request: SingleProfileQueryRequest!) {
  profile(request: $request) {
    id
    handle
    ownedBy
    name
    bio
    metadata
    followNftAddress
    attributes {
      key
      value
    }
    stats {
      totalFollowers
      totalFollowing
      totalPosts
      totalComments
      totalMirrors
      totalCollects
    }
  }
}`