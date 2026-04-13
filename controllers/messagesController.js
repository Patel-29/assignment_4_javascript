const {body, validationResult} = require("express-validator");
const db = require("../db/messagesQueries.js");

exports.getIndex = async (req, res, next) => {
  try {
    const messages = await db.getAllMessages();
    res.render('messages/messages', {
      messages: messages
    });
  } catch (err) {
    next(err);
  }
};

exports.getNewMessage = (req, res) => {
  if (!req.user) return res.redirect('/log-in');

  res.render('messages/new-message-form');
};

exports.postNewMessage = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters.')
    .escape(),
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Message body is required.')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters.')
    .escape(),
  
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("messages/new-message-form", {
        errors: errors.array(),
        previousData: req.body,
      });
    }

    try {
      const { title, body } = req.body;
      const userId = req.user.id;

      await db.createMessage(title, body, userId);
      return res.redirect("/");
    } catch (err) {
      return next(err);
    }
  },
];


exports.postDeleteMessage = async (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    const err = new Error("Unauthorized");
    err.status = 403;
    return next(err);
  }

  try {
    await db.deleletMessage(req.params.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};