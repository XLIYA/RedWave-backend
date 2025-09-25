import express from 'express';
import listCommentsRoutes from './listComments.routes.js';
import addCommentRoutes from './addComment.routes.js';
import updateCommentRoutes from './updateComment.routes.js';
import deleteCommentRoutes from './deleteComment.routes.js';

const router = express.Router();

// ترتیب مهم نیست؛ مسیرهای هر فایل یکتا هستند
router.use(listCommentsRoutes);   // GET /:songId
router.use(addCommentRoutes);     // POST /:songId
router.use(updateCommentRoutes);  // PUT /:id
router.use(deleteCommentRoutes);  // DELETE /:id

export default router;
