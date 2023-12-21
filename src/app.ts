import express from 'express';
import puppeteerRoutes from './routes/puppeteerRoutes';



const app = express();

const port = process.env.PORT || 3000;

app.use('/', puppeteerRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

export default app;
