const express = require('express');
const router = express.Router();
const passport = require('passport');
const fetch = require('node-fetch');
const requireAuth = passport.authenticate('jwt', { session: false });
const keys = require('../config/keys')

router.post('/getFood', requireAuth, async (req, res) => {
   const { query, fields } = req.body
   const API_URL = `https://api.nutritionix.com/v1_1/search`
   
   fetch(API_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: keys.nutritionixAppId,
          appKey: keys.nutritionixAppKey,
          query,
          fields,
        })
    })
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