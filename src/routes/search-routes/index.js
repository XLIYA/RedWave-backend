import express from 'express';
import searchRoutes from './search.routes.js';
import searchSuggestionsRoutes from './searchSuggestions.routes.js';

const router = express.Router();

// هر دو مسیر زیر /api/search سوار می‌شن
router.use(searchRoutes);            // GET /
router.use(searchSuggestionsRoutes); // GET /suggestions

export default router;
