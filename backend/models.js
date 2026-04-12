const mongoose = require('mongoose');

// A. Users
const UserSchema = new mongoose.Schema({
    firebaseUID: { type: String, unique: true, sparse: true },
    email: String,
    name: String,
    photoURL: String,
    authProvider: { type: String, enum: ['google', 'email'] },
    dietaryType: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan'] },
    allergies: [String],
    healthConditions: [{ type: String, enum: ['diabetic', 'hypertension', 'lactose-intolerant', 'celiac'] }],
    measurements: {
        height: Number,      // cm
        weight: Number,      // kg
        age: Number,
        gender: String,
        dailyCalorieGoal: Number
    },
    points: { type: Number, default: 0 },
    mealPreference: { type: String, default: 'Veg' },
    goal: { type: String, default: 'Healthy' },
    password: { type: String },
    themeColor: { type: String, default: '#6dba5f' },
    isDarkMode: { type: Boolean, default: false },
    isAIEnabled: { type: Boolean, default: true },
    fontSize: { type: String, default: 'medium' },
    subscriptionLevel: { type: String, enum: ['Basic', 'Pro', 'Family'], default: 'Basic' },
    familyMembers: [{ email: String, name: String, role: String }],
    googleCalendarTokens: {
        accessToken: String,
        refreshToken: String,
        expiryDate: Number,
        email: String
    }
}, { strict: false });

// B. Recipes
const RecipeSchema = new mongoose.Schema({
    title: String,
    category: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan', 'Sweet'] },
    ingredients: [{ name: String, qty: Number, unit: String }],
    steps: [String],
    calories: Number,
    proteinCount: Number,
    fiberCount: Number,
    sugarContent: Number,
    sodiumContent: Number,
    isPremium: { type: Boolean, default: false },
    scrapedFromWeb: { type: Boolean, default: false },
    imageURL: String,
    videoURL: String,
    diabeticFlag: { type: Boolean, default: false },
    diabeticSafeQty: String,
    ratings: [{
        userId: String,
        firebaseUID: String,
        userName: String,
        userPhoto: String,
        score: { type: Number, min: 1, max: 5 },
        review: String,
        createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
}, { strict: false });

// C. Calendar
const CalendarSchema = new mongoose.Schema({
    userId: String,
    firebaseUID: String,
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    recipeTitle: String,
    date: String,
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
    familyPlanId: String
}, { strict: false });

// D. NutritionistBlog
const BlogSchema = new mongoose.Schema({
    authorId: String,
    firebaseUID: String,
    authorName: String,
    title: String,
    bodyContent: String,
    tags: [String],
    publishedAt: { type: Date, default: Date.now }
}, { strict: false });

// E. UserAnalytics
const AnalyticsSchema = new mongoose.Schema({
    userId: String,
    firebaseUID: String,
    actionType: String,
    timestamp: { type: Date, default: Date.now },
    engagementScore: { type: Number, default: 0 },
    wasteTracker: [{ itemRemoved: String, removedAt: Date }]
}, { strict: false });

// F. FamilySync
const FamilySyncSchema = new mongoose.Schema({
    familyCode: { type: String, unique: true },
    createdBy: String,
    members: [{ userId: String, firebaseUID: String, name: String, email: String }],
    sharedCalendar: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Calendar' }],
    sharedGroceryList: [{ item: String, qty: String, addedBy: String, checked: Boolean }]
}, { strict: false });

// G. Grocery List
const GrocerySchema = new mongoose.Schema({
    firebaseUID: { type: String, required: true, unique: true },
    userId: String,
    items: [{ name: String, qty: String, checked: { type: Boolean, default: false } }],
    updatedAt: { type: Date, default: Date.now }
}, { strict: false });

// H. Feedback & Reports
const FeedbackSchema = new mongoose.Schema({
    userId: String,
    firebaseUID: String,
    name: String,
    email: String,
    subject: String,
    message: String,
    status: { type: String, enum: ['New', 'In Progress', 'Resolved'], default: 'New' },
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

// I. AI Generated Content
const AIContentSchema = new mongoose.Schema({
    userId: String,
    firebaseUID: String,
    contentType: { type: String, default: 'Video' },
    contentUrl: String,
    promptUsed: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

// J. AI Chat Sessions
const ChatSessionSchema = new mongoose.Schema({
    userId: String,
    firebaseUID: String,
    email: String, // Ensure email fallback unification
    messages: [{
        role: { type: String, enum: ['user', 'bot'] },
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    updatedAt: { type: Date, default: Date.now }
}, { strict: false });

// K. Community Threads
const ThreadSchema = new mongoose.Schema({
    recipeId: String,
    recipeTitle: String,
    user: String,
    email: String,
    avatar: String,
    content: String,
    rating: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    tag: String,
    replies: [{ user: String, email: String, text: String, createdAt: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

const User = mongoose.model('User', UserSchema, 'users');
const Recipe = mongoose.model('Recipe', RecipeSchema, 'recipes');
const Calendar = mongoose.model('Calendar', CalendarSchema, 'calendars');
const Blog = mongoose.model('Blog', BlogSchema, 'blogs');
const Analytics = mongoose.model('Analytics', AnalyticsSchema, 'analytics');
const FamilySync = mongoose.model('FamilySync', FamilySyncSchema, 'familysyncs');
const Grocery = mongoose.model('Grocery', GrocerySchema, 'groceries');
const Feedback = mongoose.model('Feedback', FeedbackSchema, 'feedbacks');
const AIContent = mongoose.model('AIContent', AIContentSchema, 'aicontents');
const ChatSession = mongoose.model('ChatSession', ChatSessionSchema, 'chatsessions');
const Thread = mongoose.model('Thread', ThreadSchema, 'threads');

module.exports = { User, Recipe, Calendar, Blog, Analytics, FamilySync, Grocery, Feedback, AIContent, ChatSession, Thread };
