const express = require('express');
const { Cluster } = require('../models/cluster_model'); // Adjust path as needed

const eshcolRouter = express.Router();

eshcolRouter.get('/', async (req, res) => {
  try {
    const eshcolsUser = await Cluster.findAll();
    console.log(eshcolsUser[0].id.id);
    
    const result = eshcolsUser.map((r) => ({ id: r.id.id, name: r.id.name }));
    res.json(result);
  } catch (error) {
    res.status(400).json({ result: error.message });
  }
});

module.exports = eshcolRouter;