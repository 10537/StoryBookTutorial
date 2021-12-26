const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const Users = require("../models/Users")

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, 
    async (accessToken, refreshToken, profile, done) => {
        //Create new user object
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }

        
        try {
            // Check if the user exist
            let user = await Users.findOne({ googleId: profile.id})
            if (user) {
                done(null, user)
            } else {
                user = await Users.create(newUser)
                done(null, user)
            }
        } catch (err){
            console.error(err)
        }

    }))

    passport.serializeUser((user, done) => done(null, user.id))
      
    passport.deserializeUser((id, done) => Users.findById(id, (err, user) => done(err, user)))
}