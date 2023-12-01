/**
 * Function to generate random six digit alphanumeric string
 * @returns six digit random alphanumeric string
 */
const generateRandomString = function () {
  return Array.from(Array(6), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
};

/**
 * Function to find if a particular user exists or not by taking email from form as parameter.
 * @param {*} email
 * @returns null if user not found, if user found then returns the specific user object.
 */
const findUserByEmail = function (email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return null;
};

/**
 *
 * @param {*} id
 * @return URLs where the userID is equal to the id of the current logged-in user.
 */
const urlsForUser = function (id, database) {
  const updatedUrlDatabase = {};
  for (let i in database) {
    if (database[i].userID === id) {
      updatedUrlDatabase[i] = database[i];
    }
  }
  return updatedUrlDatabase;
};

/**
 *
 * @param {}
 * @return date
 */
const getTime = function () {
  const date = new Date();

  return (
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2)
  );
};

/**
 *
 * @param {an array of objects}
 * @return length of the array with no duplicates in it
 */
const getUniqueVisitorsCount = function (visitorsArray) {
  let eleArr = [];
  visitorsArray.map((ele) => {
    if (eleArr.indexOf(Object.keys(ele)[0]) === -1) {
      eleArr.push(Object.keys(ele)[0]);
    }
  });
  return eleArr.length;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  getTime,
  getUniqueVisitorsCount,
};
