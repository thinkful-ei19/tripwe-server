'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const {
    editAccomodationById,
    deleteAccomodationById,
    insertNewAccommodation,
    insertUserIntoAccommodation,
    response
} = require('../models/accommodation');
const { getUsersByAccommodationId } = require('../models/trip');

router.post('/trips/:id/accommodations', async (req, res, next) => {
    const userId = getUserId(req);
    //getUserId(req);
    const { id } = req.params;

    const { name, address, reference, arrival, departure, phone } = req.body;

    const newAccommodation = {
        trip_id: id,
        name,
        address,
        reference,
        arrival,
        departure,
        phone
    };

    const NewAccommodationId = await insertNewAccommodation(newAccommodation);
    const result = await response(NewAccommodationId);
    const success = await insertUserIntoAccommodation(userId, NewAccommodationId, id);
    const userResult = await getUsersByAccommodationId(NewAccommodationId);

    if (success) {
        res.status(201).json({ result, userResult });

    } else {
        res.status(500).json();
    }
});

router.put('/trips/:tripId/accommodations/:accId', async (req, res, next) => {
    const { tripId, accId } = req.params;

    const { userId } = req.body;
    console.log(userId, accId, tripId)
    const success = await insertUserIntoAccommodation(userId, accId, tripId);
    const result = await getUsersByAccommodationId(accId);
    const userResult = await getUsersByAccommodationId(accId);

    if (success) {
        res.status(201).json({ result, userResult });

    } else {
        res.status(500).json();
    }
});
/* ===== PUT/UPDATE ACCOMMODATIONS ====== */
router.put('/accommodations/:id', (req, res, next) => {
    const accommodationId = req.params.id;
    const { name, address, reference, arrival, departure, phone } = req.body;

    const updatedAccommodation = {
        name,
        address,
        reference,
        arrival,
        departure,
        phone
    };

    const success = editAccomodationById(accommodationId, updatedAccommodation)
    if (success) {
        res.status(201).json(result);
    } else {
        res.status(500).json();
    }
});
/* ======== DELETE ACCOMMODATION ======== */
router.delete('/accommodations/:id', (req, res, next) => {
    const accommodationId = req.params.id;
    console.log(accommodationId, "ID")
    const success = deleteAccomodationById(accommodationId);

    if (success) {
        res.status(204).json();
    } else {
        res.status(500).json();
    }
})

module.exports = router;
