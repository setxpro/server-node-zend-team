require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./Models/User");

const app = express();

app.use(express.json());

// Permission to API server
// app.use((res, next) => {
//   //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
//   res.header("Access-Control-Allow-Origin", "*");
//   //Quais são os métodos que a conexão pode realizar na API
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//   app.use(cors());
//   next();
// });
app.use(cors());
// Create user
app.post("/auth/create", async (req, res) => {
  const { name, username, email, phone, password, role, assignment, avatar } =
    req.body;

  // Validation
  if (!name) {
    return res.status(422).json({ message: "Nome é obrigatório!" });
  }
  if (!username) {
    return res.status(422).json({ message: "Nome de usuário é obrigatório!" });
  }
  if (!phone) {
    return res.status(422).json({ message: "Celular é obrigatório!" });
  }
  if (!email) {
    return res.status(422).json({ message: "E-mail é obrigatório!" });
  }
  if (!password) {
    return res.status(422).json({ message: "Senha é obrigatório!" });
  }
  if (!role) {
    return res.status(422).json({ message: "Senha é obrigatório!" });
  }
  if (!assignment) {
    return res.status(422).json({ message: "Senha é obrigatório!" });
  }
  // end validation

  // Check if exists

  const userUserNameExists = await User.findOne({ username: username });
  const userEmailExists = await User.findOne({ email: email });

  if (userUserNameExists) {
    return res
      .status(422)
      .json({ message: "Por favor, utilize outro Nome de usuário" });
  }
  if (userEmailExists) {
    return res.status(422).json({ message: "Por favor, utilize outro E-mail" });
  }

  // Create Passwors

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create User

  const user = new User({
    name,
    username,
    email,
    phone,
    password: passwordHash,
    role,
    assignment,
    avatar,
  });

  try {
    await User.create(user);
    res.status(200).json({ message: "Usuário criado com sucesso!" });
  } catch (error) {
    console.log(error);
  }
});

// Connection to database
mongoose
  .connect(`${process.env.MONGO_URL}`)
  .then(() => {
    console.log("Connected to Mongoose");
    app.listen(process.env.PORT || 3333, () => {
      console.log("Server running on port " + process.env.PORT);
    });
  })
  .catch((err) => console.error(err));
