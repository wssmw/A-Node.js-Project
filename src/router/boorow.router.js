const Router = require('koa-router')

const { search,returnbook,borrow } = require('../controller/borrow.controller')

const {verifyBook} = require('../middleware/borrow.middleware')
const { verifyAuth } = require('../middleware/login.middleware')

const BoorowRouter = new Router()

BoorowRouter.get('/search',verifyAuth, search)

BoorowRouter.post('/borrow',verifyAuth,verifyBook, borrow)

BoorowRouter.post('/return',verifyAuth, returnbook)

module.exports = BoorowRouter