const userModel = require('../models/users')
const response = require('../helpers/response')
const bcrypt = require('bcrypt')
const fs = require('fs')

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const {
      username,
      phoneNumber,
      password
    } = req.body

    const salt = await bcrypt.genSalt()
    const initialResults = await userModel.getUsersByCondition({ id })
    if (initialResults.length < 1) {
      return response(res, 400, false, 'User Not Found')
    }

    if (username) {
      const isExists = await userModel.getUsersByCondition({ username })
      if (isExists.length < 1) {
        const updateUsername = await userModel.updateUser(id, { username })
        if (updateUsername.affectedRows > 0) {
          return response(res, 200, true, 'Username has been updated', { id, username })
        }
        return response(res, 400, false, 'Cant update username')
      } else {
        return response(res, 400, 'Update Failed, username already exists')
      }
    }

    if (password) {
      const encryptedPassword = await bcrypt.hash(password, salt)
      const passwordResults = await userModel.updateUser(id, { password: encryptedPassword })
      if (passwordResults.affectedRows > 0) {
        return response(res, 200, true, 'Password have been updated', { id: initialResults[0].id })
      }
      return response(res, 400, false, 'Password cant update')
    }

    if (phoneNumber) {
      const isExists = await userModel.getUsersByCondition({ phoneNumber })
      if (isExists.length < 1) {
        const updatePhoneNumber = await userModel.updateUser(id, { phoneNumber })
        if (updatePhoneNumber.affectedRows > 0) {
          return response(res, 200, true, 'Phone number has been updated', { id, phoneNumber })
        }
        return response(res, 400, false, 'Cant update phone number')
      } else {
        return response(res, 400, 'Update Failed, phone number already exists')
      }
    }

    if (req.file) {
      const picture = req.file.filename
      const uploadImage = await userModel.updateUser(id, { picture })
      if (uploadImage.affectedRows > 0) {
        if (initialResults[0].picture !== null) {
          fs.unlinkSync(`upload/profile/${initialResults[0].picture}`)
        }
        return response(res, 200, true, 'Image hash been Updated', { id, picture })
      }
      return response(res, 400, false, 'Cant update image')
    }
  } catch (err) {
    console.log(err)
    return response(res, 400, false, 'Bad Request')
  }
}

exports.deletePicture = async (req, res) => {
  try {
    const { id } = req.params
    const initialResults = await userModel.getUsersByCondition({ id })
    if (initialResults.length > 0) {
      await userModel.updateUser(id, { picture: null })
      fs.unlinkSync(`upload/profile/${initialResults[0].picture}`)
      return response(res, 200, true, 'Image hash ben deleted', {
        id: initialResults[0].id,
        image: null
      })
    } else {
      return response(res, 400, false, 'Failed to delete image')
    }
  } catch (error) {
    console.log(error)
    return response(res, 400, false, 'Bad Request')
  }
}
