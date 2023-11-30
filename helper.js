const generateRandomString = function() {
  return Array.from(Array(6), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
};

const findUserByEmail = function(email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return null;
};

const urlsForUser = function(id, database) {
  const updatedUrlDatabase = {};
  for (let i in database) {
    if (database[i].userID === id) {
      updatedUrlDatabase[i] = database[i];
    }
  }
  return updatedUrlDatabase;
};

module.exports = { generateRandomString, findUserByEmail, urlsForUser };
