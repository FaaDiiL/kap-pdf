import { Request, Response } from 'express';
import puppeteer from 'puppeteer';

export async function downloadPageAsPdf(req: Request, res: Response) {
    const url = req.query.url as string;

    if (!url) {
        res.status(400).send('URL is required');
        return;
    }

    // Heroku-specific Puppeteer configuration
    const launchOptions = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    };

    try {
        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: ['networkidle2'] });
        
        // Generate the PDF
        const pdfBuffer = await page.pdf({ format: 'A4' });

        await browser.close();

        // Set headers and send the PDF buffer to the client
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}