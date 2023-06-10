import { GraphQLClient } from 'graphql-request'

export const API_URL = 'https://api.lens.dev/'

const client = new GraphQLClient(API_URL, { fetch })

export default client