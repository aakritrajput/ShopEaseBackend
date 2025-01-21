import jwt from "jsonwebtoken";
import  asyncHandler  from "../utils/AsyncHandler.utils.js";
import { User } from "../models/mongoModels/user.model.js";
import ApiError from "../utils/ApiError.utils.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Retrieve the access token
        const accessToken = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
        //console.log('req:', req.cookies)
        if (!accessToken) {
            throw new ApiError(401, "Unauthorized request - No access token provided");
        }

        // Verify the access token
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?.id).select("-password -otp -otpExpiry");
        if (!user) {
            throw new ApiError(401, "Invalid access token - User not found");
        }

        req.user = user; // Attach user to request
        next(); // Proceed to the next middleware

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // Handle expired access token
            try {
                const refreshToken = req.cookies?.refreshToken;
                if (!refreshToken) {
                    throw new ApiError(401, "No refresh token provided");
                }

                // Verify the refresh token
                const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                const user = await User.findById(decodedToken?.id).select("-password -refreshToken");
                if (!user) {
                    throw new ApiError(401, "Invalid refresh token - User not found");
                }

                // Generate new access token
                const newAccessToken = user.generateAccessToken();
                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: true, // Ensure cookies are sent over HTTPS
                    sameSite: 'None', // CSRF protection
                });

                req.user = user; // Attach user to request
                next(); // Proceed to the next middleware

            } catch (refreshError) {
                res.status(refreshError.statusCode || 401).json( refreshError.message || "Invalid or expired refresh token");
            }
        } else {
            res.status(error.statusCode || 401).json( error.message || "Unauthorized");
        }
    }
});

export {verifyJWT}
