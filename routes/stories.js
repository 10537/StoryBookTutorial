const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth.js')
const Stories = require("../models/Stories.js")

// @desc Show add page
// @route GET /stories/add

router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add')
})


// @desc Process add form
// @route POST /stories/save

router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Stories.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/error500')
    }
})

// @desc Get the Story
// @route POST /stories/read/:id

router.get('/read/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Stories.findById({_id: req.params.id}).populate('user').lean()
        if (!story) {
            return res.render('error/error404')
        }
        res.render('stories/read', {
            story,
            loggedUser: req.user || null

        })
    } catch (err) {
        console.error(err)
        res.render('error/error500')
    }
})

// @desc Get the Stories of the user
// @route POST /stories/main/:id

router.get('/user/:id', ensureAuth, async (req, res) => {
    try {
        const stories = await Stories.find({ status: 'public', user: req.params.id }).populate({path: 'user'}).sort({ createAt: 'desc'}).lean()
        res.render('stories/index', {
            stories,
            loggedUser: req.user || null
        })
    } catch (err) {
        console.error(err)
        res.render('error/error500')
    }
})

// @desc Show all stories
// @route GET /stories/main

router.get('/main', ensureAuth, async (req, res) => {
    try {
        const stories = await Stories.find({ status: 'public' }).populate({path: 'user'}).sort({ createAt: 'desc'}).lean()
        res.render('stories/index', {
            stories,
            loggedUser: req.user || null
        })
    } catch (err) {
        console.error(err)
        res.render('error/error500')
    }
})

// @desc Edit stories
// @route GET /stories/edit/:id

router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Stories.findOne({_id: req.params.id}).lean()
        if (!story) {
            return res.render('error/error404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories/main')
        }else {
            res.render('stories/edit', {
                story
            })
        }
    } catch (err) {
        console.error(err)
        res.redirect('error/error500')
    }
    
})

// @desc Update Story
// @route PUT /stories/save/:id

router.put('/save/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Stories.findById(req.params.id).lean()
        if (!story) {
            return res.render('error/error404')
        } 

        if (story.user != req.user.id) {
            res.redirect('/stories/main')
        }else {
            story = await Stories.findOneAndUpdate({_id: req.params.id}, req.body, {
                new: true,
                runValidators: true
            })
            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        res.redirect('error/error500')
    }
    
})

// @desc Delete Story
// @route DELETE /stories/:id

router.delete('/delete/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Stories.findById(req.params.id).lean()
        if (!story) {
            return res.render('error/error404')
        } 

        if (story.user != req.user.id) {
            res.redirect('/stories/main')
        }else {
            story = await Stories.deleteOne({_id: req.params.id})
            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        res.redirect('error/error500')
    }
})

module.exports = router
