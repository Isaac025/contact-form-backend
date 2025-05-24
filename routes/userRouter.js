const {
  handleContact,
  handleVerify,
} = require("../controllers/userController");
const router = require("express").Router();

router.post("/contact", handleContact);
router.post("/verify-email/:token", handleVerify);

module.exports = router;
