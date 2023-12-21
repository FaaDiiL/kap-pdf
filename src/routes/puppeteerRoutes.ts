import express from 'express';
import { downloadPageAsPdf } from '../controllers/puppeteerController';

const router = express.Router();

router.get('/*', downloadPageAsPdf);

export default router;
