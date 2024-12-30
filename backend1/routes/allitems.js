const express = require('express');
const router = express.Router();
const MyItem = require('../db/myitems'); 
const { verifyToken } = require('../middleware/auth-middleware');
const mongoose = require('mongoose');
const User=require("../db/user");
const Trade=require("./../db/alltrades");
const { getAllItems,buildFilterQuery } = require('../handlers/all-items-handler'); 


// Get Recommended Items for Logged-In User
router.get('/recommended', verifyToken, async (req, res) => {
  try {
      const loggedInUserId = req.user.id; // Extract logged-in user ID from token

      // Fetch the user's created items from the myitems collection
      const userItems = await MyItem.find({ userId: loggedInUserId });

      if (!userItems || userItems.length === 0) {
          return res.status(404).json({ message: 'No items found for the logged-in user.' });
      }

      // Extract unique preferences from the user's created items
      const userPreferences = new Set();
      userItems.forEach((item) => {
          if (item.preferences && Array.isArray(item.preferences)) {
              item.preferences.forEach((preference) => userPreferences.add(preference));
          }
      });

      // If no preferences are found, return an empty result
      if (userPreferences.size === 0) {
          return res.status(404).json({ message: 'No preferences found for the logged-in user.' });
      }

      // Fetch recommended items from the TradeItem collection (allitems)
      const recommendedItems = await MyItem.find({
          preferences: { $in: Array.from(userPreferences) }, // Match any of the user's preferences
          userId: { $ne: loggedInUserId }, // Exclude items created by the logged-in user
      })
          .limit(4) // Limit to 4 recommendations
          .exec();  

      // Return the recommended items
      res.status(200).json({ data: recommendedItems });
  } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({
          message: 'Failed to fetch recommendations',
          error: error.message,
      });
  }
});

router.get('/allitems',verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
        const { searchTerm, exactMatch, date, page = 1, pageSize = 4 } = req.query;
        const filterQuery = buildFilterQuery({ searchTerm, exactMatch, date });
        // filterQuery.isBlocked = { $ne: true };
        filterQuery.userId={$ne:userId};
        const skip = (parseInt(page) - 1) * parseInt(pageSize);
        const items = await MyItem.find(filterQuery)
            .populate('userId', 'name isSuspended')
            .skip(skip)
            .limit(parseInt(pageSize))
            .exec();
        const totalCount = await MyItem.countDocuments(filterQuery);
        res.status(200).json({ data: items, totalCount, currentPage: parseInt(page), pageSize: parseInt(pageSize) });
    } catch (err) {
        console.error('Error fetching all items:', err);
        res.status(500).json({ message: 'Failed to fetch items. Please try again later.' });
    }
});
router.get('/myitem', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { searchTerm, exactMatch, date, page = 1, pageSize = 4 } = req.query;
        const filterQuery = buildFilterQuery({ searchTerm, exactMatch, date });
        filterQuery.userId = userId;
        // filterQuery.isBlocked = { $ne: true };
        const skip = (parseInt(page) - 1) * parseInt(pageSize);
        const items = await MyItem.find(filterQuery)
            .populate('userId', 'name isSuspended')
            .skip(skip)
            .limit(parseInt(pageSize))
            .exec();
        const totalCount = await MyItem.countDocuments(filterQuery);
        res.status(200).json({ data: items, totalCount, currentPage: parseInt(page), pageSize: parseInt(pageSize) });
    } catch (err) {
        console.error('Error fetching my items:', err);
        res.status(500).json({ message: 'Failed to fetch items. Please try again later.' });
    }
});






// Endpoint to block an item
router.patch('/block/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Update the item's isBlocked status to true
        const updatedItem = await MyItem.findByIdAndUpdate(
            id,
            { isBlocked: true },
            { new: true } // Return the updated document
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item successfully blocked', item: updatedItem });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
});


router.patch('/unblock/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const updatedItem = await MyItem.findByIdAndUpdate(
        id,
        { isBlocked: false },
        { new: true }
      );
  
      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      res.status(200).json({ message: 'Item successfully unblocked', item: updatedItem });
    } catch (error) {
      console.error('Error unblocking item:', error);
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  });
  

  
module.exports = router;
