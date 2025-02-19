// import { EmailVerify } from "../interface/EmailVerify.js";

/**
 * Validate email format
 * @param email - The email string to validate
 * @returns true if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param password - The password string to validate
 * @returns true if valid, false otherwise
 */
export const validatePassword = (password: string): boolean => {
    // Minimum 8 characters, at least one letter, one number, and one special character
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};


/**
 * Validate OTP format
 * @param otp - The OTP string to validate
 * @returns true if valid, false otherwise
 */
export const validateOtp = (otp: string): boolean => {
    // Ensure the OTP is exactly 4 digits (adjust length if needed)
    const otpRegex = /^\d{4}$/;
    return otpRegex.test(otp);
};


/**
 * Validate userId format (e.g., MongoDB ObjectId)
 * @param userId - The userId string to validate
 * @returns true if valid, false otherwise
 */
export const validateUserId = (userId: string): boolean => {
    // Match MongoDB ObjectId (24 hexadecimal characters)
    const objectIdRegex = /^[a-f\d]{24}$/i;
    return objectIdRegex.test(userId);
};



/**
 * Validate name
 * - Checks if the name is not empty after trimming
 * @param name - The name string to validate
 * @returns true if valid (non-empty), false otherwise
 */
export const validateName = (name: string): boolean => {
    return name.trim().length > 0;
};



export const validateBio = (title: string): boolean => {
    const wordCount = title.trim().split(/\s+/).length; // Count words
    return title.trim().length > 0 && wordCount <= 50;
};




 

       
