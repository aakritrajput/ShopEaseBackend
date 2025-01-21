import { Router } from "express";
import {
    registerUser,
    verifyToken,
    loginUser,
    resendVerificationLink,
    logoutUser,
    changePassword,
    sendPassWordChangeOTP,
    verifyPassWordChangeOTP,
    resetPassword,
    getCurrentUserProfile,
    deleteAccount,
    updateAddress,
    updateProfile,
    addPhone,
    sendPhoneOtp,
    verifyPhoneOtp,
    getUserNotificaton
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser)
router.route("/verifyEmail").get(verifyToken)
router.route("/login").post(loginUser)
router.route("/resendVerificationLink/:email").get(resendVerificationLink)
router.route("/logout").get(logoutUser)
router.route("/changePassword").patch(verifyJWT, changePassword)
router.route("/sendPassWordChangeOTP").post(verifyJWT, sendPassWordChangeOTP)
router.route("/verifyPassWordChangeOTP").post(verifyJWT, verifyPassWordChangeOTP)
router.route("/resetPasswrd").patch(resetPassword)
router.route("/currentUserProfile").get(verifyJWT, getCurrentUserProfile)
router.route("/deleteAccount").delete(verifyJWT, deleteAccount)
router.route("/updateAddress").patch(verifyJWT, updateAddress)
router.route("/updateProfile").patch(verifyJWT, updateProfile)
router.route("/addPhone").post(verifyJWT, addPhone)
router.route("/sendPhoneOtp").post(verifyJWT, sendPhoneOtp)
router.route("/verifyPhoneOtp").post(verifyJWT,verifyPhoneOtp)
router.route("/userNotifications").get(verifyJWT, getUserNotificaton)

export default router ;