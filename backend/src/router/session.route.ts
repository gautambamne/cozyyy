
import { Router } from 'express';
import { getAllSessionController, deleteSessionById, deleteAllSessionExceptCurrent } from '../controllers/session.controller';
import { AuthMiddleware } from '../middleware/auth.middlewate';

const sessionRouter = Router();

// Get all sessions for the authenticated user
sessionRouter.get('/', AuthMiddleware, getAllSessionController);

// Delete a session by session_id
sessionRouter.delete('/:session_id', AuthMiddleware, deleteSessionById);

// Delete all sessions except the current one
sessionRouter.delete('/', AuthMiddleware, deleteAllSessionExceptCurrent);

export default sessionRouter;
