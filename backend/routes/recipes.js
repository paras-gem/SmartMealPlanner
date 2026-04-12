const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Recipe } = require('../models');

const API_KEY = process.env.SPOONACULAR_API_KEY;

// GET /api/recipes - fetch all or by category
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.category && req.query.category !== 'All') {
            filter.category = req.query.category;
        }
        const recipes = await Recipe.find(filter);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/recipes/search - Spoonacular external lookup
router.get("/search", async (req, res) => {
    const { query = "pasta", number = 10 } = req.query;

    try {
        const { data } = await axios.get(
            `https://api.spoonacular.com/recipes/complexSearch`,
            { params: { query, number, addRecipeInformation: true, apiKey: API_KEY } }
        );

        const recipes = data.results || [];

        const saved = await Promise.all(
            recipes.map(r => {
                let category = 'Non-Veg';
                if (r.vegetarian) category = 'Veg';
                if (r.vegan) category = 'Vegan';
                if (r.dishTypes?.some(d => ['dessert', 'sweet'].includes(d.toLowerCase()))) category = 'Sweet';

                return Recipe.findOneAndUpdate(
                    { spoonacularId: r.id },
                    {
                        spoonacularId: r.id,
                        title: r.title,
                        imageURL: r.image,
                        category,
                        calories: r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || Math.floor(Math.random() * 500) + 200,
                        scrapedFromWeb: true,
                        readyInMinutes: r.readyInMinutes,
                        servings: r.servings,
                        summary: r.summary?.replace(/(<([^>]+)>)/gi, '').slice(0, 300) || ''
                    },
                    { upsert: true, new: true }
                );
            })
        );

        res.json({ count: saved.length, recipes: saved });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/recipes/by-category - fetch many recipes per Spoonacular diet tag
router.get("/by-category", async (req, res) => {
    const { category = "All", number = 12 } = req.query;

    // Map our UI category names to Spoonacular diet/type params
    const CATEGORY_MAP = {
        "Veg": { diet: "vegetarian" },
        "Vegan": { diet: "vegan" },
        "Non-Veg": { type: "main course" },
        "Sweet": { type: "dessert" },
        "Keto": { diet: "ketogenic" },
        "High-Protein": { query: "high protein" },
        "Low-Carb": { diet: "low carb" },
    };

    if (!API_KEY) {
        // Fallback to DB if no API key
        const filter = category === 'All' ? {} : { category };
        const recipes = await Recipe.find(filter).limit(Number(number));
        return res.json(recipes);
    }

    try {
        const paramMap = category === "All" ? { query: "healthy" } : (CATEGORY_MAP[category] || { query: category.toLowerCase() });
        const { data } = await axios.get(
            `https://api.spoonacular.com/recipes/complexSearch`,
            { params: { ...paramMap, number, addRecipeInformation: true, addRecipeNutrition: true, apiKey: API_KEY } }
        );

        const results = data.results || [];
        const saved = await Promise.all(results.map(r => {
            const catLabel = category === "All" ? (r.vegetarian ? "Veg" : "Non-Veg") : category;
            return Recipe.findOneAndUpdate(
                { spoonacularId: r.id },
                {
                    spoonacularId: r.id,
                    title: r.title,
                    imageURL: r.image,
                    category: catLabel,
                    calories: r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || Math.floor(Math.random() * 500) + 200,
                    scrapedFromWeb: true,
                    readyInMinutes: r.readyInMinutes,
                    servings: r.servings,
                    summary: r.summary?.replace(/(<([^>]+)>)/gi, '').slice(0, 300) || ''
                },
                { upsert: true, new: true }
            );
        }));
        res.json(saved);
    } catch (err) {
        // Fall back to local DB on Spoonacular failure
        const filter = category === 'All' ? {} : { category };
        const recipes = await Recipe.find(filter).limit(Number(number));
        res.json(recipes);
    }
});

// GET /api/recipes/saved - returns scraped/saved specifically
router.get("/saved", async (req, res) => {
    try {
        const recipes = await Recipe.find({ scrapedFromWeb: true }).sort({ _id: -1 });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/recipes/reviewed - Get all reviewed recipes for community feed
router.get('/reviewed', async (req, res) => {
    try {
        const recipes = await Recipe.find({ 'ratings.0': { $exists: true } })
            .select('title ratings averageRating');
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/recipes/:id/review — add a rating
router.post('/:id/review', async (req, res) => {
    try {
        const { userId, firebaseUID, userName, userPhoto, score, review } = req.body;
        const uid = firebaseUID || userId;
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ error: "Recipe not found" });

        recipe.ratings.push({ userId: uid, firebaseUID: uid, userName, userPhoto, score, review });
        recipe.totalRatings = recipe.ratings.length;
        recipe.averageRating = recipe.ratings.reduce((a, b) => a + b.score, 0) / recipe.totalRatings;

        await recipe.save();
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
