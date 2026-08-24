import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const uri = import.meta.env.VITE_GRAPHQL_URL ?? '/graphql'
const cache = new InMemoryCache()
const link = new HttpLink({ uri })

export const apolloClient = new ApolloClient({ link, cache })