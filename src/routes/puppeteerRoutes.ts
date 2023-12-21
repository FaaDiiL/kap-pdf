import express from 'express';
import { downloadPageAsPdf } from '../controllers/puppeteerController';

const router = express.Router();

router.get('/download-pdf', downloadPageAsPdf);

export default router;