const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

const {
  findUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helper");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["test"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  const refinedUrlsDatabase = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    user: users[req.session.user_id],
    urls: refinedUrlsDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //Checking if user is logged-in
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  //Checking if user is logged-in
  if (req.session.user_id) {
    //Checking if the id(short URL) was created and exists in urlDatabase
    if (urlDatabase[req.params.id]) {
      //Checking if the id(short URL) belongs to the user and was created by him
      if (urlDatabase[req.params.id].userID === req.session.user_id) {
        const longURL = urlDatabase[req.params.id].longURL;
        const templateVars = {
          user: users[req.session.user_id],
          id: req.params.id,
          longURL,
        };
        res.render("urls_show", templateVars);
      } else {
        res.send("This short URL is not accessible to you.");
      }
    } else {
      res.send("Wrong short URL ");
    }
  } else {
    res.send("Please register/login first");
  }
});

app.post("/urls", (req, res) => {
  //Checking if user is logged-in
  if (req.session.user_id) {
    const id = generateRandomString();
    let longURL = "";
    req.body.longURL.slice(0, 7) === "http://"
      ? (longURL = req.body.longURL)
      : (longURL = "http://" + req.body.longURL);
    urlDatabase[id] = { longURL, userID: req.session.user_id };
    res.redirect(`/urls/${id}`);
  } else {
    res.send("<h2>Plese login to use this feature.</h2>");
  }
});

app.get("/u/:id", (req, res) => {
  //Checking if it is a valid id(short URL)
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.send("<h2>This short url does not exist.</h2>");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  //Checking if user is logged in
  if (req.session.user_id) {
    //Checking if the id(short URL exists in urlDatabase)
    if (urlDatabase[req.params.id]) {
      //Checking if the id(short URL) belongs to the user and was created by him
      if (urlDatabase[req.params.id].userID === req.session.user_id) {
        const id = req.params.id;
        delete urlDatabase[id];
        res.redirect("/urls");
      } else {
        res.send(
          "You can not delete it as this short URL is not accessible to you."
        );
      }
    } else {
      res.send("Wrong short URL id ");
    }
  } else {
    res.send("Please register/login first");
  }
});

app.post("/urls/:id", (req, res) => {
  //Checking if user is logged in
  if (req.session.user_id) {
    //Checking if the id(short URL) was created and exists in urlDatabase
    if (urlDatabase[req.params.id]) {
      //Checking if the id(short URL) belongs to the user and was created by him
      if (urlDatabase[req.params.id].userID === req.session.user_id) {
        const id = req.params.id;
        let newURL = "";
        req.body.newURL.slice(0, 7) === "http://"
          ? (newURL = req.body.newURL)
          : (newURL = "http://" + req.body.newURL);
        urlDatabase[id] = { longURL: newURL, userID: req.session.user_id };
        res.redirect("/urls");
      } else {
        res.send(
          "You can not edit it as this short URL is not accessible to you."
        );
      }
    } else {
      res.send("Wrong short URL id ");
    }
  } else {
    res.send("Please register/login first");
  }
});

app.get("/register", (req, res) => {
  //Checking if user is logged-in
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("user_registration", templateVars);
  }
});

app.post("/logout", (req, res) => {
  //Clearing cookies
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  } else if (findUserByEmail(req.body.email, users)) {
    res.sendStatus(400);
  } else {
    const id = generateRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = { id: id, email: req.body.email, password: hashedPassword };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  //Checking if the user is already logged in
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  //Calling findUserbyEmail function and using it's return value in "if" statement. If user is registered then only let him login
  const userFinder = findUserByEmail(req.body.email, users);
  if (!userFinder) {
    res.sendStatus(403);
  } else {
    //Comparing passwords entering in login form and password entered while registering
    if (bcrypt.compareSync(req.body.password, userFinder.password)) {
      req.session.user_id = userFinder.id;
      res.redirect("urls");
    } else {
      res.sendStatus(403);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
