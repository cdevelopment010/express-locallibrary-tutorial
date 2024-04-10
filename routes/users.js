var express = require('express');
var router = express.Router();

// // Set up mongoose connection
// const mongoose = require("mongoose");
// mongoose.set("strictQuery", false);

// main().catch((err) => console.log(err));
// async function main() {
//   await mongoose.connect(mongoDB);
// }


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/cool', function(req, res, next) {
  res.send("You're so cool")
})

module.exports = router;
