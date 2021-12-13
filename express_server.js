const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//var cookieParser = require('cookie-parser') // replaced by var cookieSession = require('cookie-session') reason: security
// app.use(cookieParser())
app.set("view engine", "ejs");
const bodyParser = require("body-parser");//it useing for parsing the input undrestanding the data comes from URL
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcryptjs');//password hash
var cookieSession = require('cookie-session')

app.use(cookieSession({//for running the cookieSession
  name: 'session',
  keys: ["key1", "key2"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const {checkEmailExist, getUser, checkPasswordExist, generateRandomString, urlsForUser} = require("./helper")

app.post("/urls", (req, res) => {
  console.log(req.body);//req.body= whatever client is requesting from browser to server
  const shortURL = generateRandomString(6)//shortURL a new box to our function result be in there
  const longURL = req.body.longURL
  urlDatabase[shortURL] = {"longURL":longURL, "userID": req.session["user_id"]}//changing the urlDatabase to a objec which has a key(shortURL) and value(longURL)
  res.redirect("/urls")//redirect the initial url to the new address
});

app.get("/urls/new", (req, res) => {
  const userCookie = req.session["user_id"]//getting the cookie information when someone is not login(part) for identification
  if (!userCookie) {
    return res.redirect("/login") ;
  }
  const templateVars = {
    urls: urlDatabase, 
    username: req.session["user_id"]
  };
  res.render("urls_new", templateVars)
});

app.get("/urls", (req, res) => {
  console.log(req.session["user_id"]);
  console.log("text", users)
  const userId = req.session["user_id"];
  const userURLs = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: userURLs, username: req.session["user_id"]};
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {username: req.session["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//for edite
app.post("/urls/:shortURL", (req, res) => {// params = parameters = what's in the address bar
  const shortURL = req.params.shortURL; // body = form data = what the user inputs
  const longURL = req.body.longURL;
  //urlDatabase[shortURL] = longURL;
  urlDatabase[shortURL] = {"longURL":longURL, "userID": req.session["user_id"]}
  res.redirect("/urls") 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userCookie = req.session["user_id"]
  const shortURL = req.params.shortURL;
  const usersHasURL = urlDatabase[shortURL] && urlDatabase[shortURL].userID === userCookie
  if (usersHasURL){
    delete urlDatabase[shortURL];
    res.redirect("/urls")
    return 
  }
  res.render("error_url")
});

//creat a route for user to register
app.get("/register", (req, res) => {
  console.log(req.session["register"])
  const templateVars = { urls: urlDatabase, username: req.session["user_id"]};
  res.render("registration_page", templateVars);
});
//let user register for a new account
app.post("/register", (req, res) => {
  const {email, password} = req.body
  console.log(req.body)//for taking the values form submission in the path
  if (email === "" || password === "") {
    return res.status("400").send("Please fill the Email and Password inputs");
  }
  if (checkEmailExist(email, users)) {
    res.status("400").send("email already exists!");
  }
  if(!users[req.body.email]){
    const userId = generateRandomString(6)//if its a new user creat a new id for it
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);//for password hashing in registration moment
    users[userId] = {"email": req.body.email , "password":hashedPassword, "id": userId}//"password":hashedPassword(:to hash the paa), "id": userId(id to show the object's key in terminal as id) 
    console.log(res, "this the respond object?");
    // req.session("user_id", userId)
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  console.log(req.session["login"])
  const templateVars = { urls: urlDatabase, username: req.session["user_id"]};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const userFromDataBase = getUser(email, users);////with the email from the request looping through the database for user object
  const passwordFromDataBase = userFromDataBase.password;  //comparing the password in userobject(hashpasword)
  const isPasswordCorrect = bcrypt.compareSync(password, passwordFromDataBase);//for comparing hashed passwords in login
  const userId = generateRandomString(6)
  console.log(users,"user");
  if (!checkEmailExist(email, users)) { // if there is no email
    res.status("403").send("Please Register First");
  } else {//if there is email do this...
    if (!isPasswordCorrect) {
      res.status("403").send("Please Input the Correct Password");
    } else {
      req.session.user_id = userId;
      res.redirect('/urls');
    }
  } 
});

app.post("/logout", (req, res) => {
  console.log(req.session, "just test");
  delete req.session.user_id; 
  // res.clearCookie('user_id')
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] ? urlDatabase[req.params.shortURL].longURL : null// if longurl is avalable for accecing to the longurl as link // : null === else
  if (!longURL) {
    return res.status(404).send("shortURL not found")
  }
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



