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

// Array to store refresh tokens (in-memory, not suitable for production)
let refreshTokens = []

// Endpoint for refreshing access tokens using a refresh token
app.post('/token', (req, res) => {
    // Extract the refresh token from the request body
    const refreshToken = req.body.token

    // Check if the refresh token is missing
    if (refreshToken == null) return res.sendStatus(401)

    // Check if the refresh token is valid
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

    // Verify the refresh token and generate a new access token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

// Endpoint for logging out (removing a refresh token)
app.delete('/logout', (req, res) => {
    // Remove the specified token from the refreshTokens array
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

// Endpoint for user login
app.post('/login', (req, res) => {
    // Authenticate user (here, just obtaining the username from the request)
    const username = req.body.username
    const user = { name: username }

    // Generate a new access token and refresh token
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

    // Store the refresh token in the array
    refreshTokens.push(refreshToken)

    // Respond with the generated access token and refresh token
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

// Function to generate a new access token
function generateAccessToken(user) {
    // Sign the user information with the access token secret and set expiration time
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

// Start the Express server on port 4000
app.listen(4000, () => {
    console.log('Server running on port 4000')
})
