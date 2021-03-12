const routes = require('express').Router()
const userController = require('../controllers/users')
const authMiddleware = require('../middlewares/auth')
const validator = require('../middlewares/validator')
const uploadImage = require('../middlewares/uploadProfile')

routes.patch('/:id', authMiddleware.authCheck, uploadImage, validator.updateUser, validator.validationResult, userController.updateUser)
routes.patch('/delete-photo/:id', authMiddleware.authCheck, userController.deletePicture)

module.exports = routes
