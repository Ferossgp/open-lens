import { GraphQLClient } from 'graphql-request'

export const API_URL = 'https://api.thegraph.com/subgraphs/name/franz101/poap-xdai'

const thegraph = new GraphQLClient(API_URL, { fetch })

export default thegraph