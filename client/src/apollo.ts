import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const uri = 'http://localhost:3000/graphql'
const cache = new InMemoryCache()
const link = new HttpLink({ uri })

export const apolloClient = new ApolloClient({ link, cache })