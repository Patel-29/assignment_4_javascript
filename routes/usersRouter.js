const { Router } = require("express");
const usersController = require("../controllers/usersController.js");
const authController = require("../controllers/authController.js");

const usersRouter = Router();

usersRouter.get("/sign-up", usersController.getSignUp);
usersRouter.post("/sign-up", usersController.postSignUp);

usersRouter.get('/log-in', authController.getLogin);
usersRouter.post('/log-in', authController.postLogin);
usersRouter.get('/log-out', authController.getLogout);

usersRouter.get('/membership', usersController.getMembership);
usersRouter.post('/membership', usersController.postMembership);

usersRouter.get('/admin', usersController.getAdmin);
usersRouter.post('/admin', usersController.postAdmin);

module.exports = usersRouter;