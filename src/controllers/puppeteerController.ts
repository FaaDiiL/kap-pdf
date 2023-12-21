import { Request, Response } from 'express';
import puppeteer from 'puppeteer';

export async function downloadPageAsPdf(req: Request, res: Response) {
    const url = req.query.url as string;

    if (!url) {
        res.status(400).send('URL is required');
        return;
    }

    const chromeOptions = {
        headless: true,
        defaultViewport: null,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu"
        ],
    };

    try {
        const browser = await puppeteer.launch(chromeOptions);
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(120000);
        await page.goto(url, { waitUntil: ['networkidle2', 'domcontentloaded'] });
        await page.waitForSelector('.ShareRegisterPDF', { visible: true, timeout: 120000 });
        
        // Generate the PDF
        const pdfBuffer = await page.pdf({ format: 'A4' });

        await browser.close();

        // Convert the PDF buffer to a Base64 string
        const base64String = pdfBuffer.toString('base64');

        // Send the Base64 string to the client
        res.send(base64String);

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}
