const userModel = require('../models/users')
const response = require('../helpers/response')
const bcrypt = require('bcrypt')
const fs = require('fs')
const qs = require('querystring')
const { APP_URL } = process.env

exports.detailUser = async (req, res) => {
  try {
    const { id } = req.params
    const results = await userModel.getUsersByCondition({ id })
    if (results.length > 0) {
      return response(res, 200, true, `Details ${results[0].username}`, results)
    }
    return response(res, 404, 'Cant Found Detail User')
  } catch (error) {
    return response(res, 400, 'Bad Request')
  }
}

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
        return response(res, 400, false, 'Update Failed, username already exists')
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
        return response(res, 400, false, 'Update Failed, phone number already exists')
      }
    }

    if (req.file) {
      const picture = req.file.filename
      const uploadImage = await userModel.updateUser(id, { picture })
      if (uploadImage.affectedRows > 0) {
        if (initialResults[0].picture !== null && initialResults[0].picture !== 'null') {
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
      console.log(initialResults[0].picture !== null && initialResults[0].picture !== 'null')
      if (initialResults[0].picture !== null && initialResults[0].picture !== 'null') {
        await userModel.updateUser(id, { picture: null })
        fs.unlinkSync(`upload/profile/${initialResults[0].picture}`)
        return response(res, 200, true, 'Image hash ben deleted', {
          id: initialResults[0].id,
          picture: null
        })
      } else {
        return response(res, 400, false, 'Failed to delete the image, the image is still blank')
      }
    } else {
      return response(res, 400, false, 'Failed to delete image')
    }
  } catch (error) {
    console.log(error)
    return response(res, 400, false, 'Bad Request')
  }
}

exports.getContact = async (req, res) => {
  try {
    const { id } = req.userData
    const cond = req.query
    cond.search = cond.search || ''
    cond.page = Number(cond.page) || 1
    cond.limit = Number(cond.limit) || 5
    cond.offset = (cond.page - 1) * cond.limit
    cond.sort = cond.sort || 'id'
    cond.order = cond.order || 'ASC'

    const results = await userModel.getAllContactByCondition(id, cond)

    const totalData = await userModel.getCountContact(id, cond)
    const totalPage = Math.ceil(Number(totalData[0].totalData) / cond.limit)

    return response(
      res,
      200,
      true,
      'List of all Contact',
      results,
      {
        totalData: totalData[0].totalData,
        currentPage: cond.page,
        totalPage,
        nextLink: cond.page < totalPage ? `${APP_URL}/user/contact?${qs.stringify({ ...req.query, ...{ page: cond.page + 1 } })}` : null,
        prevLink: cond.page > 1 ? `${APP_URL}/user/contact?${qs.stringify({ ...req.query, ...{ page: cond.page - 1 } })}` : null
      }
    )
  } catch (err) {
    console.log(err)
    return response(res, 400, false, 'Bad Request')
  }
}
