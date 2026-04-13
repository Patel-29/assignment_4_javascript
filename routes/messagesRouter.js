const {Router} = require('express');
const messagesController = require('../controllers/messagesController.js');
const messagesRouter = Router();

messagesRouter.get('/', messagesController.getIndex);
messagesRouter.get('/', messagesController.getNewMessage);
messagesRouter.post('/:id', messagesController.postNewMessage);

messagesRouter.post('/messages/:id/delete', messagesController.postDeleteMessage);

module.exports = messagesRouter;