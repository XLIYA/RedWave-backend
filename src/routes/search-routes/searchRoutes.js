// src/routes/searchRoutes.js
import express from 'express';
import { search, searchSuggestions } from '../../controllers/search-controllers/searchController.js';

const router = express.Router();

/**
 * @openapi
 * /api/search:
 *   get:
 *     summary: Search in songs/users/playlists
 *     description: Advanced search with support for standard text matching and fuzzy similarity search using PostgreSQL trigrams
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: 
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *         description: Search query (supports partial matching, special characters, and fuzzy search)
 *         examples:
 *           simple:
 *             value: "travis scott"
 *             summary: Simple artist search
 *           fuzzy:
 *             value: "FE!N"
 *             summary: Search with special characters
 *           partial:
 *             value: "sic mo"
 *             summary: Partial title search
 *           leetspeak:
 *             value: "tr4v1s"
 *             summary: Leetspeak search
 *       - in: query
 *         name: scope
 *         schema: 
 *           type: string
 *           enum: [songs, users, playlists]
 *           default: songs
 *         description: Search scope - determines what type of content to search
 *         examples:
 *           songs:
 *             value: "songs"
 *             summary: Search in songs (title, artist, genre)
 *           users:
 *             value: "users"
 *             summary: Search in users (username, bio)
 *           playlists:
 *             value: "playlists"
 *             summary: Search in playlists (name, description)
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *     responses:
 *       200:
 *         description: Search results with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scope: 
 *                   type: string
 *                   enum: [songs, users, playlists]
 *                   description: The search scope that was used
 *                 q: 
 *                   type: string
 *                   description: The original search query
 *                 page: 
 *                   type: integer
 *                   minimum: 1
 *                   description: Current page number
 *                 pageSize: 
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 100
 *                   description: Number of items per page
 *                 total: 
 *                   type: integer
 *                   minimum: 0
 *                   description: Total number of matching items
 *                 pages: 
 *                   type: integer
 *                   minimum: 0
 *                   description: Total number of pages
 *                 searchType:
 *                   type: string
 *                   enum: [standard, similarity]
 *                   description: Type of search performed (standard for exact matches, similarity for fuzzy matches)
 *                 items:
 *                   type: array
 *                   description: Array of search results (content varies by scope)
 *                   items:
 *                     oneOf:
 *                       - type: object
 *                         title: Song Result
 *                         description: Song search result (when scope=songs)
 *                         properties:
 *                           id: 
 *                             type: string
 *                             format: uuid
 *                             description: Unique song identifier
 *                           title: 
 *                             type: string
 *                             description: Song title
 *                           artist: 
 *                             type: string
 *                             description: Artist name
 *                           genre: 
 *                             type: string
 *                             description: Music genre
 *                           coverImage: 
 *                             type: string
 *                             format: uri
 *                             description: Cover image URL
 *                           fileUrl: 
 *                             type: string
 *                             format: uri
 *                             description: Audio file URL
 *                           releaseDate: 
 *                             type: string
 *                             format: date-time
 *                             description: Release date
 *                           createdAt: 
 *                             type: string
 *                             format: date-time
 *                             description: Upload date
 *                           uploadedBy:
 *                             type: object
 *                             properties:
 *                               id: 
 *                                 type: string
 *                                 format: uuid
 *                               username: 
 *                                 type: string
 *                               profileImage: 
 *                                 type: string
 *                                 format: uri
 *                                 nullable: true
 *                           analytics:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id: 
 *                                 type: string
 *                                 format: uuid
 *                               playCount: 
 *                                 type: integer
 *                                 minimum: 0
 *                                 description: Total play count
 *                               uniqueListeners: 
 *                                 type: integer
 *                                 minimum: 0
 *                                 description: Number of unique listeners
 *                               lastPlayed: 
 *                                 type: string
 *                                 format: date-time
 *                                 description: Last play timestamp
 *                           _count:
 *                             type: object
 *                             description: Related items count
 *                             properties:
 *                               likes: 
 *                                 type: integer
 *                                 minimum: 0
 *                               comments: 
 *                                 type: integer
 *                                 minimum: 0
 *                               moodTags: 
 *                                 type: integer
 *                                 minimum: 0
 *                       - type: object
 *                         title: User Result
 *                         description: User search result (when scope=users)
 *                         properties:
 *                           id: 
 *                             type: string
 *                             format: uuid
 *                             description: Unique user identifier
 *                           username: 
 *                             type: string
 *                             description: Username
 *                           bio: 
 *                             type: string
 *                             nullable: true
 *                             description: User biography
 *                           profileImage: 
 *                             type: string
 *                             format: uri
 *                             nullable: true
 *                             description: Profile image URL
 *                           createdAt: 
 *                             type: string
 *                             format: date-time
 *                             description: Account creation date
 *                           _count:
 *                             type: object
 *                             description: User statistics
 *                             properties:
 *                               followers: 
 *                                 type: integer
 *                                 minimum: 0
 *                                 description: Number of followers
 *                               following: 
 *                                 type: integer
 *                                 minimum: 0
 *                                 description: Number of users being followed
 *                               songs: 
 *                                 type: integer
 *                                 minimum: 0
 *                                 description: Number of uploaded songs
 *                       - type: object
 *                         title: Playlist Result
 *                         description: Playlist search result (when scope=playlists)
 *                         properties:
 *                           id: 
 *                             type: string
 *                             format: uuid
 *                             description: Unique playlist identifier
 *                           name: 
 *                             type: string
 *                             description: Playlist name
 *                           description: 
 *                             type: string
 *                             nullable: true
 *                             description: Playlist description
 *                           createdAt: 
 *                             type: string
 *                             format: date-time
 *                             description: Playlist creation date
 *                           updatedAt: 
 *                             type: string
 *                             format: date-time
 *                             description: Last update date
 *                           owner:
 *                             type: object
 *                             description: Playlist owner information
 *                             properties:
 *                               id: 
 *                                 type: string
 *                                 format: uuid
 *                               username: 
 *                                 type: string
 *                               profileImage: 
 *                                 type: string
 *                                 format: uri
 *                                 nullable: true
 *                           _count:
 *                             type: object
 *                             description: Playlist statistics
 *                             properties:
 *                               songs: 
 *                                 type: integer
 *                                 minimum: 0
 *                                 description: Number of songs in playlist
 *             examples:
 *               songs_search_standard:
 *                 summary: Standard songs search
 *                 description: Example of successful song search with exact matches
 *                 value:
 *                   scope: "songs"
 *                   q: "travis scott"
 *                   page: 1
 *                   pageSize: 20
 *                   total: 15
 *                   pages: 1
 *                   searchType: "standard"
 *                   items:
 *                     - id: "123e4567-e89b-12d3-a456-426614174001"
 *                       title: "SICKO MODE"
 *                       artist: "Travis Scott"
 *                       genre: "Hip-Hop"
 *                       coverImage: "http://localhost:5000/uploads/covers/cover1.jpg"
 *                       fileUrl: "http://localhost:5000/uploads/audio/audio1.mp3"
 *                       releaseDate: "2018-08-03T00:00:00.000Z"
 *                       createdAt: "2025-01-01T12:00:00.000Z"
 *                       uploadedBy:
 *                         id: "user123"
 *                         username: "musiclover"
 *                         profileImage: "http://localhost:5000/uploads/covers/profile1.jpg"
 *                       analytics:
 *                         id: "analytics123"
 *                         playCount: 1500
 *                         uniqueListeners: 800
 *                         lastPlayed: "2025-08-13T10:30:00.000Z"
 *                       _count:
 *                         likes: 120
 *                         comments: 35
 *                         moodTags: 8
 *                     - id: "123e4567-e89b-12d3-a456-426614174002"
 *                       title: "goosebumps"
 *                       artist: "Travis Scott"
 *                       genre: "Hip-Hop"
 *                       coverImage: "http://localhost:5000/uploads/covers/cover2.jpg"
 *                       fileUrl: "http://localhost:5000/uploads/audio/audio2.mp3"
 *                       releaseDate: "2016-12-09T00:00:00.000Z"
 *                       createdAt: "2025-01-02T12:00:00.000Z"
 *                       uploadedBy:
 *                         id: "user124"
 *                         username: "travisscottfan"
 *                         profileImage: null
 *                       analytics:
 *                         id: "analytics124"
 *                         playCount: 2100
 *                         uniqueListeners: 1200
 *                         lastPlayed: "2025-08-13T09:15:00.000Z"
 *                       _count:
 *                         likes: 89
 *                         comments: 42
 *                         moodTags: 12
 *               songs_search_similarity:
 *                 summary: Fuzzy songs search
 *                 description: Example of fuzzy search when exact matches not found
 *                 value:
 *                   scope: "songs"
 *                   q: "FE!N"
 *                   page: 1
 *                   pageSize: 20
 *                   total: 3
 *                   pages: 1
 *                   searchType: "similarity"
 *                   items:
 *                     - id: "123e4567-e89b-12d3-a456-426614174003"
 *                       title: "FE!N"
 *                       artist: "Travis Scott"
 *                       genre: "Hip-Hop"
 *                       coverImage: "http://localhost:5000/uploads/covers/cover3.jpg"
 *                       uploadedBy:
 *                         id: "user125"
 *                         username: "utopia_fan"
 *                       analytics:
 *                         playCount: 892
 *                         uniqueListeners: 445
 *                       _count:
 *                         likes: 67
 *                         comments: 23
 *                         moodTags: 5
 *               users_search:
 *                 summary: Users search
 *                 description: Example of user search results
 *                 value:
 *                   scope: "users"
 *                   q: "travis"
 *                   page: 1
 *                   pageSize: 20
 *                   total: 5
 *                   pages: 1
 *                   searchType: "standard"
 *                   items:
 *                     - id: "user456"
 *                       username: "travis_fan_2024"
 *                       bio: "Travis Scott superfan since 2015 🌵"
 *                       profileImage: "http://localhost:5000/uploads/covers/profile2.jpg"
 *                       createdAt: "2024-05-15T08:30:00.000Z"
 *                       _count:
 *                         followers: 250
 *                         following: 180
 *                         songs: 45
 *                     - id: "user457"
 *                       username: "travis_beats"
 *                       bio: "Producer inspired by Travis Scott"
 *                       profileImage: null
 *                       createdAt: "2024-03-22T14:20:00.000Z"
 *                       _count:
 *                         followers: 89
 *                         following: 67
 *                         songs: 23
 *               playlists_search:
 *                 summary: Playlists search
 *                 description: Example of playlist search results
 *                 value:
 *                   scope: "playlists"
 *                   q: "chill"
 *                   page: 1
 *                   pageSize: 20
 *                   total: 8
 *                   pages: 1
 *                   searchType: "standard"
 *                   items:
 *                     - id: "playlist789"
 *                       name: "Chill Vibes"
 *                       description: "Perfect playlist for relaxing and studying"
 *                       createdAt: "2024-12-01T18:45:00.000Z"
 *                       updatedAt: "2025-01-15T10:30:00.000Z"
 *                       owner:
 *                         id: "user890"
 *                         username: "chillmaster"
 *                         profileImage: "http://localhost:5000/uploads/covers/profile3.jpg"
 *                       _count:
 *                         songs: 47
 *                     - id: "playlist790"
 *                       name: "Sunday Chill"
 *                       description: "Lazy Sunday afternoon vibes"
 *                       createdAt: "2024-11-20T16:20:00.000Z"
 *                       updatedAt: "2025-02-01T12:15:00.000Z"
 *                       owner:
 *                         id: "user891"
 *                         username: "sunday_lover"
 *                         profileImage: null
 *                       _count:
 *                         songs: 32
 *               empty_results:
 *                 summary: No results found
 *                 description: Example when no matches are found
 *                 value:
 *                   scope: "songs"
 *                   q: "nonexistentsongquery123"
 *                   page: 1
 *                   pageSize: 20
 *                   total: 0
 *                   pages: 0
 *                   searchType: "standard"
 *                   items: []
 *       400:
 *         description: Bad Request - Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_query:
 *                 summary: Missing search query
 *                 value:
 *                   message: "q الزامی است"
 *               invalid_scope:
 *                 summary: Invalid search scope
 *                 value:
 *                   message: "scope باید یکی از: songs, users, playlists باشد"
 *               query_too_long:
 *                 summary: Search query too long
 *                 value:
 *                   message: "جستجو نباید بیش از 200 کاراکتر باشد"
 *       500: 
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', search);

/**
 * @openapi
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     description: Provides autocomplete suggestions based on existing song titles and artist names
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: 
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         description: Partial search query (minimum 2 characters)
 *         examples:
 *           artist_search:
 *             value: "trav"
 *             summary: Artist name suggestion
 *           title_search:
 *             value: "sick"
 *             summary: Song title suggestion
 *           mixed_search:
 *             value: "hip"
 *             summary: Mixed suggestions
 *       - in: query
 *         name: limit
 *         schema: 
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: Maximum number of suggestions to return
 *         examples:
 *           small_limit:
 *             value: 5
 *             summary: Get 5 suggestions
 *           large_limit:
 *             value: 15
 *             summary: Get 15 suggestions
 *     responses:
 *       200:
 *         description: List of search suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   description: Array of suggestion objects
 *                   items:
 *                     type: object
 *                     required: [type, value]
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [title, artist]
 *                         description: Type of suggestion (song title or artist name)
 *                       value:
 *                         type: string
 *                         description: The suggested text
 *                         maxLength: 200
 *             examples:
 *               artist_suggestions:
 *                 summary: Artist name suggestions
 *                 description: Suggestions for "trav" query
 *                 value:
 *                   suggestions:
 *                     - type: "artist"
 *                       value: "Travis Scott"
 *                     - type: "artist"
 *                       value: "Travis Barker"
 *                     - type: "title"
 *                       value: "Traveler's Song"
 *                     - type: "title"
 *                       value: "Travel Mode"
 *               title_suggestions:
 *                 summary: Song title suggestions
 *                 description: Suggestions for "sick" query
 *                 value:
 *                   suggestions:
 *                     - type: "title"
 *                       value: "SICKO MODE"
 *                     - type: "title"
 *                       value: "Sick Beat"
 *                     - type: "title"
 *                       value: "Sickest Flow"
 *                     - type: "artist"
 *                       value: "Sick Beats Producer"
 *               mixed_suggestions:
 *                 summary: Mixed suggestions
 *                 description: Mix of titles and artists for "hip" query
 *                 value:
 *                   suggestions:
 *                     - type: "title"
 *                       value: "Hip Hop Hooray"
 *                     - type: "artist"
 *                       value: "Hip Hop Legends"
 *                     - type: "title"
 *                       value: "Hiphopopotamus"
 *                     - type: "artist"
 *                       value: "Hipster Beats"
 *                     - type: "title"
 *                       value: "Hip to the Beat"
 *               empty_suggestions:
 *                 summary: No suggestions found
 *                 description: When no matches are found for the query
 *                 value:
 *                   suggestions: []
 *       400:
 *         description: Bad Request - Invalid suggestion parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               query_too_short:
 *                 summary: Query too short
 *                 value:
 *                   message: "حداقل 2 کاراکتر برای پیشنهاد لازم است"
 *               missing_query:
 *                 summary: Missing query parameter
 *                 value:
 *                   message: "پارامتر q الزامی است"
 *               invalid_limit:
 *                 summary: Invalid limit parameter
 *                 value:
 *                   message: "limit باید بین 1 تا 20 باشد"
 *       500: 
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/suggestions', searchSuggestions);

export default router;