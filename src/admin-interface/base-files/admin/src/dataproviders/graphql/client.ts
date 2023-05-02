import { Client, cacheExchange, fetchExchange } from '@urql/core'

class ApiClient {
  private token = ''
  client: Client
  url: string

  constructor(url: string) {
    this.url = url
    this.client = new Client({
      url,
      exchanges: [cacheExchange, fetchExchange],
      fetchOptions: () => {
        return {
          headers: { authorization: this.token ? `Bearer ${this.token}` : '' },
        }
      },
    })
  }

  setAccessToken(token: string) {
    this.token = token
    return this
  }
}

export const instance = new ApiClient(import.meta.env.VITE_GRAPHQL_ENDPOINT);
export default instance.client
