const express = require("express");
const { check } = require('express-validator')
const { siginUser, signUpUser, updateUser, deleteUser } = require('../Controllers/user.controller')
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth.middleware');
const isAdmin = require("../middleware/isAdmin");

let userRouter = express.Router();

userRouter.post("/signin",[
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').notEmpty().withMessage('Password is required')
],siginUser);

userRouter.post("/signup", [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],signUpUser)

userRouter.patch("/:id",[verifyToken, isAdmin],updateUser)

userRouter.delete("/:id",[verifyToken, isAdmin], deleteUser)

module.exports = userRouter;