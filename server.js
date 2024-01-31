// Load environment variables from a .env file
require('dotenv').config()

// Import the 'express' framework
const express = require('express')

// Create an Express application
const app = express()

// Import the 'jsonwebtoken' library for handling JWTs
const jwt = require('jsonwebtoken')

// Middleware to parse incoming JSON requests
app.use(express.json())

// Array of posts (for demonstration purposes)
const posts = [
    {
        username: 'Harriet',
        title: 'Post 1'
    },
    {
        username: 'Izzy',
        title: 'Post 2'
    },
]

// Endpoint to retrieve posts, requires authentication
app.get('/post', authenticateToken, (req, res) => {
    // Filter posts based on the authenticated user's name
    res.json(posts.filter(post => post.username === req.user.name))
})

// Endpoint for user login
app.post('/login', (req, res) => {
    // Authenticate user (here just obtaining the username from the request)
    const username = req.body.username
    const user = { name: username }

    // Generate a new access token
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

    // Respond with the generated access token
    res.json({ accessToken: accessToken })
})

// Middleware function to authenticate tokens
function authenticateToken(req, res, next) {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    // Check if the token is missing
    if (token == null) res.sendStatus(401)

    // Verify the token and attach the user information to the request
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

// Start the Express server on port 3000
app.listen(3000, () => {
    console.log('Server running on port 3000')
})
