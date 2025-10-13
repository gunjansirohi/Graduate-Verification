const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const {authenticateUser, roleMiddleware} = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/user/get-admin', chatController.getAssignedAdmin);
router.get('/conversation/:userId', chatController.getConversation);
router.get('/unread-count', chatController.getUnreadCount);
router.post('/messages/read', chatController.markAsRead);
router.post('/send', chatController.sendMessage);

router.get('/admin/conversations', roleMiddleware(['admin']), chatController.getAllConversations
);
router.get('/admin/all-users', 
  roleMiddleware(['admin']), 
  chatController.getChatUsers
);

module.exports = router;