import asyncHandler from "../utils/AsyncHandler.utils.js"
import ApiError from "../utils/ApiError.utils.js"
import ApiResponse from "../utils/ApiResponse.utils.js"
import { User } from "../models/mongoModels/user.model.js"
import jwt from "jsonwebtoken"
import sendSms from "../services/sms.service.js"
import {getNotifications} from "../utils/notification.utils.js"

const generateVerificationToken = (email) => {
    const token = jwt.sign({email}, process.env.VERIFICATION_TOKEN_SECRET , { expiresIn: process.env.VERIFICATION_TOKEN_EXPIRY });
    return token;
  };

const sendVerificationEmail = async (email, token) => {
    try {
      const verificationLink = `http://localhost:3000/api/v1/verifyEmail?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
      const transporter = nodemailer.createTransport({
        service: "gmail", 
        auth: {
          user: process.env.PROJECT_OWNER_EMAIL, 
          pass: process.env.PROJECT_OWNER_PASSWORD, 
        }
      });
  
      const mailOptions = {
        from: `"ShopEase" <${process.env.PROJECT_OWNER_EMAIL}>`, 
        to: email, 
        subject: "Email Verification",
        html: `
          <p>Hello,</p>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationLink}">Verify Email</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      };

      await transporter.sendMail(mailOptions);

      console.log("Verification email sent successfully to:", email);
    } catch (error) {
      console.log("Failed to send verification email:", error.message);
      throw new ApiError(500, error.message || "Email sending failed. Please try again.");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details 
    // validate details -- not empty
    // check if user already exists by email or username  
    // get files
    // upload files on cloudinary 
    // create user with email unverified 
    // send verification email 

    try {
        const {name , email, password} = req.body
    
        const requiredFields = { name , email, password };
        
        // Check for missing fields
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value) // Check for falsy values
            .map(([key]) => key); // Extract field names
        
        if (missingFields.length > 0) {
            throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
        }
    
        const existingUser = await User.find({
            email
        })

        if(existingUser.length > 0){
            console.log(existingUser)
            throw new ApiError(400, "user already exists with the given username or email!!")
        }
    
        const user = await User.create({
           name,
           email,
           password
        })

        if(!user){
            throw new ApiError(500, "something went wrong while registering the user !!")
        }
        const verificationToken = generateVerificationToken(email);
        await sendVerificationEmail(email, verificationToken)
    
        const createdUser = await User.findById(user._id).select("-password -verificationToken")
    
        res.status(201).json(new ApiResponse(201, createdUser, "User registred !! Check your email for email-verification .."))
    
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "error registering user !!" }) 
    }
})

const verifyToken = asyncHandler(async(req,res)=>{
    const {token, email} = req.query;
    const decodedToken = decodeURIComponent(token)
    const decodedEmail = decodeURIComponent(email)
    //console.log(`decodedToken: ${decodedToken} , decodedEmail: ${decodedEmail}`)
    try {
        if(!decodedToken || !decodedEmail){
            throw new ApiError(500, "error decoding uri components")
        }
        const user = await User.find({
                email: decodedEmail
            })
        if(user.length === 0){
            throw new ApiError("error getting the user with decoded email")
        }
        const token = jwt.verify(decodedToken, process.env.VERIFICATION_TOKEN_SECRET)
        if(token.email !== user[0].email){
            console.log("token.email: ", token.email, "user.email: ", user.email)
            throw new ApiError(400, "email in token does not match with the email in the database")
        }
        user[0].isVarified = true;
        await user[0].save({validateBeforeSave: false})
        res.status(200).json(new ApiResponse(200, {}, "email successfully verified !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json( error.message || "verification link expired or not valid !! ")
    }
})

const loginUser = asyncHandler(async(req, res)=>{
    try {
        const {emailOrPhone, password} = req.body
        if(!emailOrUsername || !password){
            throw new ApiError(400, "Both email or phone and password is required !!")
        }
    
        const user = await User.find({
            $or : [
                {email: emailOrUsername},{phone: emailOrUsername}
            ]
        })
    
        if(user.length === 0){
            throw new ApiError(400, "user with the given email or phone does not exist!!")
        }
    
        if(user[0].isVarified === false){
            throw new ApiError(402, "Your email is not verified !! check email-box for verification link or ")
        }
    
        const isPasswordCorrect = await user[0].comparePassword(password)
        if(!isPasswordCorrect){
            throw new ApiError(400, "Incorrect password")
        }
    
        const accessToken = await user[0].generateAccessToken()
        if(!accessToken){
            throw new ApiError(500, "error genarating access token !")
        }
        const refreshToken = await user[0].generateRefreshToken()
        if(!refreshToken){
            throw new ApiError(500, "error genarating refresh token !")
        }
    
        const loggedInUser = await User.findById(user[0]._id).select("-password -otp -otpExpiry")
    
        const options = {  
           httpOnly: true
        //    secure: true , 
        //    sameSite: 'None'
        }
     
        res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "User logged in successfully"))
    
    } catch (error) {
        res.status(error.statusCode || 500).json( error.message || "error logging user in ..")
    }
})  

const resendVerificationLink = asyncHandler(async(req, res)=> {
    try {
        const {email} = req.params
        const decodedEmail = decodeURIComponent(email)
        console.log(decodedEmail)
        const user = await User.find({email: decodedEmail})
        console.log("user:",user)
        if(user.length === 0){
            throw new ApiError(400, "No user with the given email !!")
        }
        if(user[0].isVarified ){
            throw new ApiError(400, "User with the given email is already verified")
        }
        const verificationToken = generateVerificationToken(user[0].email);
        await sendVerificationEmail(user[0].email, verificationToken);
        res.status(200).json(new ApiResponse(200, {},"verification link sent successfully"))
    } catch (error) {
        res.status(error.statusCode || 500).json( error.message || "Error Sending Verification link")
    }
})

const logoutUser = asyncHandler(async(req, res)=> {
    try {
        const options = {  
            httpOnly: true,
            // secure: true,
            // sameSite: 'None'
        }
    
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"))
    } catch (error) {
        res.status(error.statusCode || 500).json( error.message || "Error Logging out the user")
    }
})

const changePassword = asyncHandler(async(req, res)=>{
    try {
        const {oldPassword, newPassword} = req.body;
        if(!oldPassword || !newPassword){
            console.log("both are required !!")
            throw new ApiError(400, "Both , old and new passwords are required !!")
        }
        const user = await User.findById(req.user._id);
        const isPassCorrect = await user.comparePassword(oldPassword);
        if(!isPassCorrect){
            throw new ApiError(400, "Incorrect old password")
        }
        user.password = newPassword;
        await user.save({validateBeforeSave: false})
    
        res.status(200).json(new ApiResponse(200, "password changed successfully!!"))
    } catch (error) {
        throw new ApiError(500, error.message || "Error changing the password")
    }
})

const sendPassWordChangeOTP = asyncHandler(async(req, res)=>{
    try {
        const {email} = req.body
        if(!email){
            throw new ApiError(400, "email is required to reset the password !!")
        }
        const user = await User.find({email})
        if(user.length === 0){
            throw new ApiError(400, "No user exists with the given email !!")
        }
        const OTP = Math.floor(1000 + Math.random() * 900000)
        const otpExpiry = Date.now() + 2 * 60 * 1000 // 2minute expiry 

        user[0].otp = OTP
        user[0].otpExpiry = otpExpiry
        await user[0].save({validateBeforeSave:false})

        const transporter = nodemailer.createTransport({
            service: "gmail", // Use Gmail's service
            auth: {
              user: process.env.PROJECT_OWNER_EMAIL, 
              pass: process.env.PROJECT_OWNER_PASSWORD, 
            },
          });
      
          const mailOptions = {
            from: `"ShopEase" <${process.env.PROJECT_OWNER_EMAIL}>`, 
            to: email, 
            subject: "Password Reset OTP",
            text: `Your OTP for resetting the password is: ${OTP}. It is valid for 2 minutes.`,    
          };
    
          await transporter.sendMail(mailOptions);
      
          console.log("Password Reset OTP sent successfully to email:", email);
          res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully to the registered email !!"))

    } catch (error) {
        throw new ApiError(500, error.message || "error sending OTP")
    }
    
})

const verifyPassWordChangeOTP = asyncHandler(async(req, res)=> {
    try {
        const {email, otp} = req.body
        if(!email || !otp){
            throw new ApiError(400, "both email and otp are required to verify OTP")
        }
        const user = await User.find({email})
        if(user.length === 0){
            throw new ApiError(400, "No user with given email")
        }
    
        if(user[0].otp !== Number(otp) || user[0].otpExpiry < Date.now()){
            throw new ApiError(400, "OTP expired or Invalid")
        }
    
        user[0].otp = undefined;
        user[0].otpExpiry = undefined;
        user[0].save({validateBeforeSave:false})
        res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"))
    } catch (error) {
        throw new ApiError(400, error.message || "error verifying otp")
    }
})

const resetPassword = asyncHandler(async(req, res)=> {
    const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if(!user.isVarified){
        throw new ApiError(400, "the given email is not verified request for verification link and check your email !!")
    }
    // Update password and clear OTP fields
    user.password = newPassword; 
    await user.save({validateBeforeSave:false});

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    throw new ApiError(500, error.message || "error reseting your password !")
  }
})

const getCurrentUserProfile = asyncHandler(async(req, res)=> {
    try {
        const user = req.user
        res.status(200).json(new ApiResponse(200, user, "fetched current user profile successfully !"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "error fetching users profile")
    }
 })

const deleteAccount = asyncHandler(async(req, res)=>{
    try {
        await User.findByIdAndDelete(req.user._id)
        res.status(200).json(new ApiResponse(200, {}, "Successfully deleted users Account"))
    } catch (error) {
        res.status(error.statusCode || 500).json( error.message || "Error deleting Users account !")
    }
})

const updateAddress = asyncHandler(async(req, res)=> {
    try {
        const {fullname, street, city, state, zipcode, country} = req.body;
        const updatedAddress = await User.findByIdAndUpdate(
            req.user._id,
            {
                address: [{fullname, street, city, state, zipcode, country}]
            },
            {
                new: true
            }
        )
        res.status(200).json(new ApiResponse(200, updatedAddress.address, "Address updated successfully"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "error updating the address")
    }
})

const updateProfile = asyncHandler(async(req, res)=> {
    try {
        const {name, phone} = req.body
        if (!name && !phone){
            throw new ApiError(400, "please provide name or email to update!!")
        }
        const user = await User.findById(req.user._id);
        user.name = name ? name : user.name ;
        user.phone = phone ? phone : user.phone ;
        user.isPhoneVerified = phone ? false : user.isPhoneVerified ;

        await user.save({validateBeforeSave: false});

        res.status(200).json(new ApiResponse(200, {}, "profile updated successfully !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "error updating the profile !!")
    }
})

const addPhone = asyncHandler(async(req, res)=>{
    try {
        const {phone} = req.body;
        const user = await User.findById(req.user._id);
        if(user.phone === undefined){
            throw new ApiError(400).json("Phone number linked to this account already exists !")
        }
        user.phone = phone;
        await user.save({validateBeforeSave:false})
        res.status(200).json(new ApiResponse(200, {}, "phone number added"))
    } catch (error) {
        res.status(error.status || 500).json(error.message || "Error adding phone number !!")
    }
})

const sendPhoneOtp = asyncHandler(async(req, res)=>{
    try {
        const {phone} = req.body
        if(!phone){
            throw new ApiError(400, " please provide valid phone number !!")
        }
        const user = await User.findById(req.user._id)
        const OTP = Math.floor(1000 + Math.random() * 900000);
        const otpExpiry = Date.now() + 2 * 60 * 1000 // 2minute expiry
        user.otp = OTP;
        user.otpExpiry = otpExpiry;
        await user.save({validateBeforeSave: true})
        await sendSms({to: phone, body: `OTP for your phone verification is ${OTP}`})
        res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully to the given phone number !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || " Error sending OTP..")
    }
})

const verifyPhoneOtp = asyncHandler(async(req, res)=> {
    try {
        const {otp} = req.body;
        const user = await User.findById(req.user._id)
        if(user.length === 0){
            throw new ApiError(400, "No user with given email")
        }
    
        if(user.otp !== Number(otp) || user.otpExpiry < Date.now()){
            throw new ApiError(400, "OTP expired or Invalid")
        }
    
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save({validateBeforeSave:false})
        res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"))
    } catch (error) {
        res.status(error.statusCode || 400).json( error.message || "OTP verification failed!!")
    }
})

const getUserNotificaton = asyncHandler(async(req, res)=> {
    try {
        const notification = await getNotifications(req.user._id)
        res.status(200).json(new ApiResponse(200, notification , "successfully fetched notifications "))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "error fetching user notifications !!")
    }
})

export {
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
}