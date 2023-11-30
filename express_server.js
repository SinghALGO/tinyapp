const express = require("express");
var cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  //Checking if it is a valid id(short URL)
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  } else {
    res.send("<h2>This short url does not exist.</h2>");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.send("<h2>This short url does not exist.</h2>");
  }
});

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const id = req.params.id;
    let newURL = "";
    req.body.newURL.slice(0, 7) === "http://"
      ? (newURL = req.body.newURL)
      : (newURL = "http://" + req.body.newURL);
    urlDatabase[id] = { longURL: newURL };
    res.redirect("/urls");
  } else {
    res.send("<h2>This short url does not exist.</h2>");
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies["user"] };
  res.render("user_registration", templateVars);
});
app.post("/login", (req, res) => {
  res.cookie.user = req.body.username;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //Clearing cookies
  res.clearCookie("user");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const { email, password } = req.body;
  users[userId] = { email, password };
  res.cookie.user_id = userId;
  res.redirect("/urls");
});

const generateRandomString = function () {
  return Array.from(Array(6), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
