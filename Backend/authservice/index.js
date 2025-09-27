require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const { 
  generateToken, 
  saveActiveToken, 
  verifyToken, 
  removeActiveToken
} = require('./utils/jwtUtils');

const app = express();

const PORT = process.env.PORT;

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Auth service Connected to MongoDB Atlas'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

app.post('/register', async (req, res) => {
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
});

app.post('/login', async (req, res) => {
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
});

app.post('/logout', async (req, res) => {
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
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            data: { message: "Access token is required" }
        });
    }

    try {
        const decoded = await verifyToken(token);
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        return res.status(403).json({
            data: { message: "Invalid or expired token" }
        });
    }
};


// Route to verify if token is valid
app.post('/verify-token', authenticateToken, async (req, res) => {
    return res.status(200).json({
        data: { 
            message: "Token is valid",
            user: {
                userId: req.user.userId,
                userName: req.user.userName
            }
        }
    });
});


app.listen(PORT,()=>{
    console.log(`auth service is listening on ${PORT}`)
})
