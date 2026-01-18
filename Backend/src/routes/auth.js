import express from "express"
import { signup , login , logout, updateProfile} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
const router = express.Router();

router.use(arcjetProtection);

router.post('/signup' , signup);

router.post('/login', login);

router.post('/logout', logout);

router.get("/cloudinary-test", async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    );
    res.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

//if user is authenticate(protectRoute) ,then only they can call next function (updateprofile)
//check auth middleware for code of this function

router.put('/update-profile',  protectRoute ,updateProfile);

router.get("/check",  protectRoute , (req , res)=>res.status(200).json(req.user));

export default router