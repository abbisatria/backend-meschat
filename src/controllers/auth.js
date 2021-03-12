const userModel = require('../models/users')
const response = require('../helpers/response')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { APP_KEY } = process.env

exports.signUp = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body
    const isExists = await userModel.getUsersByCondition({ phoneNumber })
    if (isExists.length < 1) {
      const salt = await bcrypt.genSalt()
      const encryptedPassword = await bcrypt.hash(password, salt)
      const createUser = await userModel.createUser({ phoneNumber, password: encryptedPassword })
      if (createUser.insertId > 0) {
        const user = await userModel.getUsersByCondition({ id: createUser.insertId })
        const token = jwt.sign({ id: user.id, username: user.username, phoneNumber: user.phoneNumber, picture: user.picture }, APP_KEY)
        const results = {
          token
        }
        return response(res, 200, true, 'Register Success', results)
      } else {
        return response(res, 400, false, 'Register Failed')
      }
    } else {
      return response(res, 400, 'Register Failed, phone number already exists')
    }
  } catch (error) {
    return response(res, 400, false, 'Bad Request')
  }
}

exports.signIn = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body
    const existingUser = await userModel.getUsersByCondition({ phoneNumber })
    if (existingUser.length > 0) {
      const compare = bcrypt.compareSync(password, existingUser[0].password)
      if (compare) {
        const { id, username, phoneNumber, picture } = existingUser[0]
        const token = jwt.sign({ id, username, phoneNumber, picture }, APP_KEY)
        const results = {
          token
        }
        return response(res, 200, 'Sign In succesfully', results)
      } else {
        return response(res, 401, 'Wrong password')
      }
    }
    return response(res, 401, false, 'Phone Number not registered')
  } catch (error) {
    return response(res, 400, false, 'Bad Request')
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { phoneNumber } = req.body
    const existingUser = await userModel.getUsersByCondition({ phoneNumber })
    if (existingUser.length > 0) {
      const id = existingUser[0].id
      const token = jwt.sign({ id }, APP_KEY)
      return response(res, 200, true, 'Please to reset password!', token)
    }
    return response(res, 401, false, 'Phone number not registered')
  } catch (error) {
    return response(res, 400, false, 'Bad Request')
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const data = jwt.verify(token, APP_KEY)
    const password = req.body
    const salt = await bcrypt.genSalt()
    const encryptedPassword = await bcrypt.hash(password.password, salt)
    const update = await userModel.updateUser(data.id, { password: encryptedPassword })
    if (update.affectedRows > 0) {
      return response(res, 200, true, 'Reset Password Success')
    }
    return response(res, 400, false, 'Failed reset password')
  } catch (error) {
    console.log(error)
    return response(res, 400, false, 'Bad Request')
  }
}
