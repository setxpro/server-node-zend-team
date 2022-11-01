require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./Models/User");
const Support = require("./Models/Support");
const MessageClient = require("./Models/MessageNewClient");

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

// Create Support
app.post("/support/create", async (req, res) => {
  const { type, comment, screenshot } = req.body;

  if (!comment) {
    return res.status(422).json({ message: "Comentário é Obrigatório!" });
  }

  const support = new Support({
    type,
    comment,
    screenshot,
  });

  try {
    await Support.create(support);
    res.status(200).json({ message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    console.log(error);
  }
});

// Message
app.post("/message-client/create", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name) {
    return res.status(422).json({ message: "Nome é Obrigatório!" });
  }
  if (!email) {
    return res.status(422).json({ message: "Email é Obrigatório!" });
  }
  if (!phone) {
    return res.status(422).json({ message: "Telefone é Obrigatório!" });
  }
  if (!message) {
    return res.status(422).json({ message: "Mensagem é Obrigatório!" });
  }

  const messageClient = new MessageClient({
    name,
    email,
    phone,
    message,
  });

  try {
    await MessageClient.create(messageClient);
    res.status(200).json({ message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    console.log(error);
  }
});

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

// Find One User
app.get("/users/:id", async (req, res) => {
  const _id = req.params.id;
  const user = await User.findById(_id, "-password");
  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado!." });
  }
  res.status(200).json({ user });
});

// Find All Users
app.get("/users", async (req, res) => {
  const users = await User.find();

  if (!users) {
    return res
      .status(404)
      .json({ message: "Não há usuários cadastrados no sistema." });
  }
  res.status(200).json({ users });
});

// Update User
app.patch("/user/:id", async (req, res) => {
  const _id = req.params.id;
  const { name, username, email, phone, password, role, assignment, avatar } =
    req.body;

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = {
    name,
    username,
    email,
    phone,
    password: passwordHash,
    role,
    assignment,
    avatar,
  };

  try {
    const userUpdate = await User.updateOne({ _id }, user);
    if (userUpdate) {
      res.status(200).json({ message: "Usuário Atualizado com Sucesso!" });
      return;
    }
    if (userUpdate.matchedCount === 0) {
      res.status(422).json({ message: "Não foi possível alterar o usuário" });
      return;
    }
    res.status(200).json(userUpdate);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Delete User By ID
app.delete("/user/:id", async (req, res) => {
  const _id = req.params.id;
  const user = await User.findOne({ _id });

  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado!" });
    return;
  }

  try {
    await User.deleteOne({ _id });
    res.status(200).json({ message: "Usuário deletado com Sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Sign in

app.post("/auth/signin", async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(422).json({ msg: "Insira ao menos um login!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "Insira ao menos uma Senha!" });
  }

  // Check if user exists
  const user = await User.findOne({ username: username }); // verify username

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  // Check if password match
  const checkPass = await bcrypt.compare(password, user.password);

  if (!checkPass) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const secret = process.env.SECRET_HASH;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );
    res
      .status(200)
      .json({ msg: "Authenticação realizada com sucesso!", user, token });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "Erro com o servidor, tente novamente mais tarde!" });
  }
});

// Find All Supports
app.get("/support", async (req, res) => {
  const support = await Support.find();

  if (!support) {
    return res
      .status(404)
      .json({ message: "Não há usuários cadastrados no sistema." });
  }
  res.status(200).json({ support });
});

// Find All Message Client
app.get("/client-message", async (req, res) => {
  const clientMessage = await MessageClient.find();

  if (!clientMessage) {
    return res
      .status(404)
      .json({ message: "Não há usuários cadastrados no sistema." });
  }
  res.status(200).json({ clientMessage });
});

// Find One Message Client
app.get("/client-message/:id", async (req, res) => {
  const _id = req.params.id;
  const clientMessage = await MessageClient.findById(_id);
  if (!clientMessage) {
    return res.status(404).json({ message: "Mensagem não encontrada!." });
  }
  res.status(200).json({ clientMessage });
});

// Delete Message Client By ID
app.delete("/client-message/:id", async (req, res) => {
  const _id = req.params.id;
  const clientMessage = await MessageClient.findOne({ _id });

  if (!clientMessage) {
    res.status(404).json({ error: "Support não encontrado!" });
    return;
  }

  try {
    await Support.deleteOne({ _id });
    res.status(200).json({ message: "Support deletado com Sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Get onde Support by id
app.get("/support/:id", async (req, res) => {
  const _id = req.params.id;
  const support = await Support.findById(_id);
  if (!support) {
    return res.status(404).json({ message: "Usuário não encontrado!." });
  }
  res.status(200).json({ support });
});

// Delete Support By ID
app.delete("/support/:id", async (req, res) => {
  const _id = req.params.id;
  const support = await Support.findOne({ _id });

  if (!support) {
    res.status(404).json({ error: "Support não encontrado!" });
    return;
  }

  try {
    await Support.deleteOne({ _id });
    res.status(200).json({ message: "Support deletado com Sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error });
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
