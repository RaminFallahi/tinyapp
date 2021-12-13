// aim === the function getting the right user from testUsers variable (object)
const { assert } = require('chai');

const { getUser } = require('../helper.js');

const testUsers = {
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
};

describe('getUser', function() {
  it('should return a user with valid email', function() {
    const user = getUser("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    console.log(user, "testing")
    assert.equal(user.id, expectedUserID);// Write your assert statement here, it saying these 2 peram should come same 2 things
  });
});