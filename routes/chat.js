const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { User } = require("../models/User");
const Chat = require("../models/Chat");
const  Message  = require("../models/Message");
const authorization = require("../middleware/authorization");
const admin = require("../middleware/admin");
//const { Admin } = require('../models/Admin');

router.post("/create", authorization, async (req, res) => {
  //send admin id
  console.log(req.body);
  let chat = await Chat.findOne({ user: req.user._id, admin: req.body.admin });
  if (!chat) {
    chat = new Chat({
      user: req.user._id,
      admin: req.body.admin,
    });
    await chat.save();
  }
  await chat.populate("admin", "name");
  return res.status(200).json(chat);
});

//get all chats
router.get("/all", authorization, async (req, res) => {
  let chats = await Chat.find();
  if (!chats) return res.status(400).json("No Chats Found");

  const chatLength = chats.length;
  if (chatLength === 0) return res.status(400).json("No Chats Found");
  let count = 0;
  chats.forEach(async (chat) => {
    await chat.populate("admin", "name");
    count++;
    if (chatLength === count) {
      return res.status(200).json(chats);
    }
  });
});

//send message to admin
router.post("/send", authorization, async (req, res) => {
  let message = new Message({
    sender: req.user._id,
    chat: req.body.chat,
    content: req.body.content,
  });
  await message.save();
  //await message.populate("sender", "name");
  return res.status(200).json(message);
});

//get user messages from admin
router.get("/messages", authorization, async (req, res) => {
  let messages = await Message.find({ chat: req.body.chat });
  if (!messages) return res.status(400).json("No Messages Found");
  const messageLength = messages.length;
  if (messageLength === 0) return res.status(400).json("No Messages Found");
  let count = 0;
  messages.forEach(async (message) => {
    await message.populate("sender", "name");
    count++;
    if (messageLength === count) {
      return res.status(200).json(messages);
    }
  });
  });

//admin send message to the user
router.post("/send/user", authorization, async (req, res) => {
  let message = new Message({
    sender: req.user._id,
    chat: req.body.chat,
    content: req.body.content,
  });
  console.log(message);
  await message.save();
  await message.populate("sender", "name");
  return res.status(200).json(message);
});

//admin get messages from user
router.get("/messages/user", authorization, async (req, res) => {
  let messages = await Message.find({ chat: req.body.chat });
  if (!messages) return res.status(400).json("No Messages Found");
  const messageLength = messages.length;
  if (messageLength === 0) return res.status(400).json("No Messages Found");
  let count = 0;
  messages.forEach(async (message) => {
    await message.populate("sender", "name");
    count++;
    if (messageLength === count) {
      return res.status(200).json(messages);
    }
  });
  });





module.exports = router;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjhiNDJhNmYwMmRmZTJhMDZiMWI1YTIiLCJuYW1lIjoiTXVoYW1tYWQgWmVlc2hhbiBBc2hyYWYiLCJyb2xlIjoidXNlciIsImlhdCI6MTY1NDUwMjEwNX0.gKTEZOEgHljRnB3bZwJKtRFff4ZXT4WyQgJOXF5-7AE
