import express, {RequestHandler} from "express";
import { createUser, deleteUser, getAllUsers, loggedInUser, login, logout, refreshAccessToken, updateMyDetailes, updateUser } from "../controllers/userController";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { upload } from "../middlewares/multer.middleware";

const app = express.Router();

app.route("/all").get(isUserAuthenticated, getAllUsers);
app.route("/new").post(upload.single("avatar"), createUser);
app.route("/login").post(login);
app.route("/logout").post(isUserAuthenticated, logout);
app.route("/refresh-token").post(refreshAccessToken);
app.route("/me").get(isUserAuthenticated, loggedInUser);
app.route("/update").put(isUserAuthenticated, updateMyDetailes);


app.route("/:userId").put(isUserAuthenticated, updateUser)
                    .delete(deleteUser);

export default app;
