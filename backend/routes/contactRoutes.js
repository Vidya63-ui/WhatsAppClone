import express from 'express';
import { createContact, getContacts, updateContact, deleteContact, getContact} from '../controller/contactController.js';
import isAuthenticated from '../middleware/auth.js';
const router = express.Router();

router.post('/', isAuthenticated, createContact);
router.get('/', isAuthenticated, getContacts);
router.get('/:id', isAuthenticated, getContact);
router.put('/:id', isAuthenticated, updateContact);
router.delete('/:id', isAuthenticated, deleteContact);

export default router;