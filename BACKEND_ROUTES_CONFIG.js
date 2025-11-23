/**
 * Routes Configuration for Demolition Items
 * Add these routes to your Express.js backend router
 */

// Example route configuration (add to your existing routes file)
// File: routes/bids.js or routes/api.js

import express from 'express';
import { updateBidItems, updateDemolitionItem } from '../api/updatebid.js';

const router = express.Router();

// Existing routes...

// Update all demolition items in a bid (bulk update)
router.put('/bids/:id/items', updateBidItems);

// Update a single demolition item in a bid
router.put('/bids/:bidId/demolition-items/:itemId', updateDemolitionItem);

export default router;

/* 
 * Alternative route configuration if using different structure:
 * 
 * // In your main app.js or server.js file:
 * import { updateBidItems, updateDemolitionItem } from './api/updatebid.js';
 * 
 * app.put('/api/bids/:id/items', updateBidItems);
 * app.put('/api/bids/:bidId/demolition-items/:itemId', updateDemolitionItem);
 */
