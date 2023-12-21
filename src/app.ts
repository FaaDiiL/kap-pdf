import express from 'express';
import puppeteerRoutes from './routes/puppeteerRoutes';

const app = express();
const port = 3000;

app.use('/puppeteer', puppeteerRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

export default app;
