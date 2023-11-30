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
  //Checking if user is logged-in
  if (req.cookie.user_id) {
    const templateVars = { user: users[req.cookie.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  //Checking if user is logged-in
  if (req.cookie.user_id) {
    const id = generateRandomString();
    let longURL = "";
    req.body.longURL.slice(0, 7) === "http://"
      ? (longURL = req.body.longURL)
      : (longURL = "http://" + req.body.longURL);
    urlDatabase[id] = { longURL };
    res.redirect(`/urls/${id}`);
  } else {
    res.send("<h2>Plese login to use this feature.</h2>");
  }
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
  //Checking if user is logged-in
  if (req.cookie.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.cookie.user_id] };
    res.render("user_register", templateVars);
  }
});

app.post("/login", (req, res) => {
  res.cookie.user = req.body.username;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //Clearing cookies
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  } else if (findUserByEmail(req.body.email, users)) {
    res.sendStatus(400);
  } else {
    const id = generateRandomString();
    users[id] = { id: id, email: req.body.email, password: req.body.password };
    res.cookie.user_id = id;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  //Checking if the user is already logged in
  if (req.cookie.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.cookie.user_id] };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  //Calling findUserbyEmail function and using it's return value in "if" statement. If user is registered then only let him login
  const userFinder = findUserbyEmail(req.body.email, users);
  if (!userFinder) {
    res.sendStatus(403);
  } else {
    //Comparing passwords entering in login form and password entered while registering
    if (req.body.password === userFinder.password) {
      req.cookie.user_id = userFinder.id;
      res.redirect("urls");
    } else {
      res.sendStatus(403);
    }
  }
});

const generateRandomString = function () {
  return Array.from(Array(6), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
};

const findUserByEmail = function (email, users) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
