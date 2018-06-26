'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');

router.get('/airports', (req, res, next) => {
    const { searchTerm } = req.query;
    // searchTerm.toLowerCase();
    return knex.select(
        'ap.airportname',
        'ap.city',
        'ap.airportcode',
        'ap.latitude',
        'ap.longitude',
        'ap.country'
    )
        .from('airports as ap')
        .modify(function (queryBuilder) {
            if (searchTerm) {
                if (searchTerm.length === 3) {
                    queryBuilder.orWhere('ap.airportcode', 'like', `%${searchTerm}%`);
                } else {
                    queryBuilder.where('ap.airportname', 'like', `%${searchTerm}%`).orWhere('ap.airportcode', 'like', `%${searchTerm}%`);
                }
            }
        })
        .limit(10)
        .then(list => {
            res.json(list);
        })
        .catch(err => {
            next(err);
        });
});

module.exports = router;