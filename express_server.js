const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.set("view engine", "ejs");
const bodyParser = require("body-parser");//it useing for parsing the input undrestanding the data comes from URL
app.use(bodyParser.urlencoded({extended: true}));

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
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
//cookies === user_id
function checkEmailExist(email, users){
  for (let user in users){
    if(users[user].email === email){
      return users[user]
    }
  }
  return false
}
function checkPasswordExist(password, users){
  for (let user in users){
    if(users[user].password === password){
      return true
    }
  }
  return false
}
function generateRandomString(length) { //creating a function to generate 6randomletter
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

app.post("/urls", (req, res) => {
  console.log(req.body);//req.body= whatever client is requesting from browser to server
  const shortURL = generateRandomString(6)//shortURL a new box to our function result be in there
  const longURL = req.body.longURL
  urlDatabase[shortURL] = {"longURL":longURL, "userID": req.cookies["user_id"]}//changing the urlDatabase to a objec which has a key(shortURL) and value(longURL)
  res.redirect("/urls")//redirect the initial url to the new address
});



app.get("/urls/new", (req, res) => {
  const userCookie = req.cookies["user_id"]//getting the cookie information when someone is not login(part) for identification
  if (!userCookie) {
    return res.redirect("/login") ;
  }
  const templateVars = { urls: urlDatabase, username: req.cookies["user_id"]};
  res.render("urls_new", templateVars)
});

app.get("/urls", (req, res) => {
  console.log(req.cookies["user_id"])
  const templateVars = { urls: urlDatabase, username: req.cookies["user_id"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {username: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//for edite
app.post("/urls/:shortURL", (req, res) => {// params = parameters = what's in the address bar
  const shortURL = req.params.shortURL; // body = form data = what the user inputs
  const longURL = req.body.longURL;
  //urlDatabase[shortURL] = longURL;
  urlDatabase[shortURL] = {"longURL":longURL, "userID": req.cookies["user_id"]}
  res.redirect("/urls") 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("dosent matter")
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls")
});

//creat a route for user to register
app.get("/register", (req, res) => {
  console.log(req.cookies["register"])
  const templateVars = { urls: urlDatabase, username: req.cookies["user_id"]};
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
    users[req.body.email] = {"email": req.body.email , "password":req.body.password, "userId": userId}//adding a new property into the object by 3 para(email,pass,id)
    res.cookie("user_id", userId)
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  console.log(req.cookies["login"])
  const templateVars = { urls: urlDatabase, username: req.cookies["user_id"]};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  // console.log(email);
  if (!checkEmailExist(email, users)) {
    res.status("403").send("Please Register First");
  }
  if (checkEmailExist(email, users) && (!checkPasswordExist(password, users))) {
    res.status("403").send("Please Input the Correct Password");
  }
  const user = checkEmailExist(email, users)
  if(!user) return res.redirect('/urls')
  res.cookie("user_id", user.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
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

