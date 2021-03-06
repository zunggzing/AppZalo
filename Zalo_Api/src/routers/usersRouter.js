const express = require("express");
const router = express.Router();
const userController = require("../controllers/UsersController");

router.get("/", userController.getAPI);
router.get("/page", userController.getAPIByPage);
router.get("/searchPhone/:phone", userController.getAPIByPhone);
router.get("/searchUserName/:username", userController.getAPIByUserName);
router.get("/:id", userController.getAPIById);
router.post("/", userController.postAPI);
router.put("/:id", userController.putAPI);
router.delete("/:id", userController.deleteAPI);

module.exports = router;
