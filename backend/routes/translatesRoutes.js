import express from 'express';
import {
  getAllLanguages,
  getEthiopianLanguages,
  textTranslators
} from '../controllers/translatesController.js';

const router = express.Router();

router.get('/', getAllLanguages);
router.get('/ethiopians', getEthiopianLanguages);
router.post('/', textTranslators);

export default router;