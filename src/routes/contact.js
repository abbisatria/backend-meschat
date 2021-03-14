const routes = require('express').Router()
const userController = require('../controllers/users')
const authMiddleware = require('../middlewares/auth')

routes.get('', authMiddleware.authCheck, userController.getContact)

module.exports = routes
