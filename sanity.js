import { createClient } from '@sanity/client'

export const client = createClient({
    projectId: 'zowu1wia',
    dataset: 'production',
    apiVersion: '2025-01-01',
    useCdn: true,
})