import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  // Language is handled client-side via user preference
  // Server components default to 'en'
  // Client components use the IntlProvider with user's preference
  return {
    locale: 'en',
    messages: (await import('./messages/en.json')).default
  }
})
