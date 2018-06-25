'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const { editPlanById, deletePlanById, insertPlan } = require('../models/plans');

/* =====POST TO PLANS====== */

router.post('/trips/:id/plans', (req, res, next) => {
  const { id } = req.params;
  const userId = getUserId(req);
  const { date, description, link } = req.body;
  const newPlan = {
    trip_id: id,
    date,
    description,
    link
  };
  const success = insertPlan(newPlan);
  if(success){
      res.status(201).json();
  }else {
      res.status(500).json();
  }
});

/* ==== PUT/UPDATE PLANS BY ID ==== */
router.put('/plans/:id', (req, res, next) => {
    const planId = req.params.id;
    const { date, description, link } = req.body;

    const updatedPlan = {
      date,
      description,
      link
    };

    const success = editPlanById(planId, updatedPlan)

    if (success) {
        res.status(201).json();
    } else {
        res.status(500).json();
    }
});
/* ===== DELETE PLANS BY ID ===== */
router.delete('/plans/:id', (req, res, next) => {
    const planId = req.params.id;

    const success = deletePlanById(planId);

    if (success) {
        res.status(204).json();
    } else {
        res.status(500).json();
    }
})
module.exports = router;
