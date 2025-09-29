const User = require('../models/User');

const { 
  generateToken, 
  saveActiveToken, 
  removeActiveToken
} = require('../utils/jwtUtils');

const registerUser = async (req, res) => {
    try {
        const { userName, password } = req.body;
        
        if (!userName || !password) {
            return res.status(400).json({
                data: { message: "Username / password cannot be empty" }
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(409).json({
                data: { message: "This username already exists . please use the valid credentials to login" }
            });
        }

        // Create new user
        const user = new User({ userName, password });
        await user.save();

        return res.status(201).json({
            data: { message: "user created successfully" }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            data: { message: "Internal server error" }
        });
    }
}

const loginUser = async (req, res) => {
    try {
        const { userName, password } = req.body;
        
        if (!userName || !password) {
            return res.status(400).json({
                data: { message: "Username / password cannot be empty" }
            });
        }

        // Find user in database
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(401).json({
                data: { message: "user not exists. please register the user to login" }
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                data: { message: "invalid password . please enter valid credentials" }
            });
        }

        // Generate JWT token
        const token = generateToken({
            userId: user._id,
            userName: user.userName
        });

        // Save the active token to database
        try {
            await saveActiveToken(token, user.userName);
        } catch (tokenSaveError) {
            console.error('Error saving token:', tokenSaveError);
        }

        return res.status(200).json({
            data: { 
                token,
                message: "Login successful"
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            data: { message: "Internal server error" }
        });
    }
}

const logoutUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(400).json({
                data: { message: "Token is required for logout" }
            });
        }

        // Verify token before blacklisting
        try {
            await removeActiveToken(token);
            
            return res.status(200).json({
                data: { message: "User logout successfully" }
            });
        } catch (tokenError) {
            return res.status(401).json({
                data: { message: "Invalid token" }
            });
        }

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            data: { message: "Internal server error" }
        });
    }
}

const verifyUserToken = async (req, res) => {
    return res.status(200).json({
        data: { 
            message: "Token is valid",
            user: {
                userId: req.user.userId,
                userName: req.user.userName
            }
        }
    });
}

module.exports = {registerUser,loginUser,logoutUser,verifyUserToken}