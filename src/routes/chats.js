const router = require('express').Router()
const chatController = require('../controllers/chats')
const authMiddleware = require('../middlewares/auth')

router.post('/send', authMiddleware.authCheck, chatController.sendChat)
router.post('/history', authMiddleware.authCheck, chatController.historyChat)
router.get('/list-history', authMiddleware.authCheck, chatController.listHistoryChat)

module.exports = router
