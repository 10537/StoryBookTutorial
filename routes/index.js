const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth.js')
const Stories = require('../models/Stories.js')

// @desc Login/Landing page
// @route GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: "login"
    })
})

// @desc Dashboar
// @route GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        const stories = await Stories.find({ user: req.user.id }).lean()
        console.log(stories)
        res.render('dashboard', 
            {
                layout: "main",
                name: req.user.firstName,
                stories,
            }
        )
    } catch (err) {
        console.error(err)
        res.render('error/error500')
    }

})


module.exports = router