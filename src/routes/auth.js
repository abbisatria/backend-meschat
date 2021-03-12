const routes = require('express').Router()
const authController = require('../controllers/auth')

routes.post('/sign-up', authController.signUp)
routes.post('/sign-in', authController.signIn)
routes.post('/forgot-password', authController.forgotPassword)
routes.patch('/reset-password/:token', authController.resetPassword)

module.exports = routes
