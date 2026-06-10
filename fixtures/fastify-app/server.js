import Fastify from 'fastify'
const fastify = Fastify()
fastify.get('/health', async () => ({ ok: true }))
fastify.route({ method: 'POST', url: '/users', handler: async () => ({}) })
