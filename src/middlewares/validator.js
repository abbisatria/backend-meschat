const { checkSchema, validationResult } = require('express-validator')
const response = require('../helpers/response')
const fs = require('fs')

exports.validationResult = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    return response(res, 400, false, errors.array()[0].msg)
  }
  return next()
}

exports.updateUser = checkSchema({
  username: {
    optional: { options: { nullable: true } },
    isLength: {
      options: { min: 5, max: 50 },
      errorMessage: 'Username should be at least min 5 & max 50 character'
    }
  },
  phoneNumber: {
    optional: { options: { nullable: true } },
    isLength: {
      options: { min: 9, max: 12 },
      errorMessage: 'Phone number should be at least min 9 & max 12 character'
    }
  },
  password: {
    optional: { options: { nullable: true } },
    isLength: {
      options: { min: 5, max: 50 },
      errorMessage: 'Password should be at least min 5 & max 50 character'
    }
  }
})
