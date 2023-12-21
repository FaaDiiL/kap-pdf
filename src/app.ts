import express from 'express';
import puppeteerRoutes from './routes/puppeteerRoutes';
import cors from 'cors';


const app = express();
app.use(cors()); // This will enable CORS for all routes
const port = process.env.PORT || 3000;

app.use('/puppeteer', puppeteerRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

export default app;
