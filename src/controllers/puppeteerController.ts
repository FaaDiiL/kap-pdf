import { Request, Response } from 'express';
import puppeteer from 'puppeteer';

export async function downloadPageAsPdf(req: Request, res: Response) {
    const url = req.query.url as string;

    if (!url) {
        res.status(400).send('URL is required');
        return;
    }

    const chromeOptions = {
        headless: "new",
        defaultViewport: null,
        args: [
            "--incognito",
            "--no-sandbox",
            "--single-process",
            "--no-zygote"
        ],
    };

    try {
        const browser = await puppeteer.launch(chromeOptions);
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(60000);
        await page.goto(url, { waitUntil: 'networkidle0' });

        // Generate PDF in memory
        const pdfBuffer = await page.pdf({ format: 'A4' });

        await browser.close();

        // Set headers and send the PDF buffer to the client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}
