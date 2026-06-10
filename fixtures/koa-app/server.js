const Router = require('@koa/router')
const router = new Router()
router.get('/koa/items', (ctx) => { ctx.body = [] })
router.del?.('/never', () => {})
