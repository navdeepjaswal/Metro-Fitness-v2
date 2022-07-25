const express = require('express');
const router = express.Router();
const passport = require('passport');
const fetch = require('node-fetch');
const requireAuth = passport.authenticate('jwt', { session: false });
const keys = require('../config/keys')

router.post('/getPlaces', requireAuth, async (req, res) => {
   const { place, longitude, latitude, radius } = req.body
   const API_URL = `https://api.geoapify.com/v2/places?categories=${place}&filter=circle:${longitude},${latitude},${radius}&bias=proximity:${longitude},${latitude}&limit=10&apiKey=${keys.placesAPIKey}`
   
   fetch(API_URL, { method: 'GET' })
    .then(function (res) {
        return res.json()
    })
    .then(function (data) {
        res.send(data)
    })
    .catch(function (err) {
        reject(err)
    })
});

module.exports = router;