const { handleContact } = require("../controllers/userController");
const router = require("express").Router();

router.post("/contact", handleContact);

module.exports = router;
