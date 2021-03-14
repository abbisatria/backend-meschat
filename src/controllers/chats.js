const chatModel = require('../models/chats')
const userModel = require('../models/users')
const response = require('../helpers/response')
const qs = require('querystring')
const { APP_URL } = process.env

exports.sendChat = async (req, res) => {
  try {
    const { id } = req.userData
    const { idReceiver, message } = req.body
    const isExitsts = await userModel.getUsersByCondition({ id: idReceiver })
    if (isExitsts.length > 0) {
      const results = await chatModel.createChat({ idSender: id, idReceiver: idReceiver, message })
      if (results.insertId > 0) {
        console.log(results)
        req.socket.emit(idReceiver, results)
        return response(res, 200, true, 'Successfully sent the message')
      }
      return response(res, 400, 'Failed to send message')
    } else {
      return response(res, 404, 'Receiver Not Found')
    }
  } catch (error) {
    return response(res, 400, false, 'Bad Request')
  }
}

exports.historyChat = async (req, res) => {
  try {
    const { id } = req.userData
    const { idReceiver } = req.body
    const cond = req.query
    cond.search = cond.search || ''
    cond.page = Number(cond.page) || 1
    cond.limit = Number(cond.limit) || 10
    cond.offset = (cond.page - 1) * cond.limit
    cond.sort = cond.sort || 'id'
    cond.order = cond.order || 'DESC'

    const results = await chatModel.getHistoryChat(id, idReceiver, cond)

    const totalData = await chatModel.getCountHistoryChat(id, idReceiver, cond)
    const totalPage = Math.ceil(Number(totalData[0].totalData) / cond.limit)

    // if (results.length > 0) {
    return response(
      res,
      200,
      true,
      'History Chat',
      results,
      {
        totalData: totalData[0].totalData,
        currentPage: cond.page,
        totalPage,
        nextLink: cond.page < totalPage ? `${APP_URL}/chat/history?${qs.stringify({ ...req.query, ...{ page: cond.page + 1 } })}` : null,
        prevLink: cond.page > 1 ? `${APP_URL}/chat/history?${qs.stringify({ ...req.query, ...{ page: cond.page - 1 } })}` : null
      }
    )
    // }
    // return response(res, 200, true, 'No history')
  } catch (error) {
    console.log(error)
    return response(res, 400, false, 'Bad Request')
  }
}

exports.listHistoryChat = async (req, res) => {
  try {
    const { id } = req.userData
    const user = await chatModel.getChatList(id)
    console.log(user)
    const results = user.filter(item => item.idSender !== id)
    const newResult = []
    for (let i = 0; i < results.length; i++) {
      const lastMsg = await chatModel.getLastMsg(results[i].idSender, id)
      const list = { ...results[i], ...lastMsg[0] }
      newResult.push(list)
    }
    return response(res, 200, true, 'Success', newResult)
  } catch (error) {
    console.log(error)
    return response(res, 400, false, 'Bad Request')
  }
  // const { id } = req.userData
  // const cond = req.query
  // cond.search = cond.search || ''
  // cond.page = Number(cond.page) || 1
  // cond.limit = Number(cond.limit) || 10
  // cond.offset = (cond.page - 1) * cond.limit
  // cond.sort = cond.sort || 'id'
  // cond.order = cond.order || 'DESC'

  // const results = await chatModel.getListHistoryChat(id, cond)

  // const totalData = await chatModel.getCountListHistoryChat(id, cond)
  // const totalPage = Math.ceil(Number(totalData[0].totalData) / cond.limit)

  // return response(
  //   res,
  //   200,
  //   true,
  //   'List History Chat',
  //   results,
  //   {
  //     totalData: totalData[0].totalData,
  //     currentPage: cond.page,
  //     totalPage,
  //     nextLink: cond.page < totalPage ? `${APP_URL}/chat/list-history?${qs.stringify({ ...req.query, ...{ page: cond.page + 1 } })}` : null,
  //     prevLink: cond.page > 1 ? `${APP_URL}/chat/list-history?${qs.stringify({ ...req.query, ...{ page: cond.page - 1 } })}` : null
  //   }
  // )
}
