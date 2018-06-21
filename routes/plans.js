'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');

/* =====POST TO PLANS====== */

router.post('/trips/:id/plans', (req, res, next) => {
    const { id } = req.params;
    const userId = getUserId(req);
    const { date, description } = req.body;
    const newPlans = {
        trip_id: id,
        date,
        description
    }
    knex
        .insert(newPlans)
        .into('plans')
        .returning('id')
        .then(([id]) => id)
        .then(result => {
            res.json(result);
          })
          .catch(err => {
            next(err);
          });

});

/* ==========DELETE PLAN =========== */
router.delete('/trips/:id/plans/:id', (req, res, next)=> {
    
    const planId = req.params;

    knex.del()
        .where('id', planId)
        .from('plans')
        .then(res => {
          if(res){
            res.status(204).end();
          } else {
            next();
          }
        })
          .catch(next);

})
//ammend sql 
module.exports = router;
