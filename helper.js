function checkEmailExist(email, users){
  for (let user in users){
    if(users[user].email === email){
      return users[user]
    }
  }
  return false
}

function getUser (email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user]
    }
  }
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

const urlsForUser = function(id, urlDatabase) {
  const urls = {}
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key]
    }
  } return urls
}

module.exports = {
  checkEmailExist,
  getUser,
  checkPasswordExist,
  generateRandomString,
  urlsForUser,
}
