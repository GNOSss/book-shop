const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

let dotenv = require("dotenv");
dotenv.config();

app.listen(process.env.PORT);

const usersRouter = require("./routes/users");
const booksRouter = require("./routes/books");
const categoryRouter = require("./routes/category");
const likesRouter = require("./routes/likes");
const cartsRouter = require("./routes/carts");
const ordersRouter = require("./routes/orders");

app.use("/users", usersRouter);
app.use("/books", booksRouter);
app.use("/category", categoryRouter);
app.use("/likes", likesRouter);
app.use("/carts", cartsRouter);
app.use("/orders", ordersRouter);
