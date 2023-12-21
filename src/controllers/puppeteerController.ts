import { Request, Response } from 'express';
import puppeteer from 'puppeteer';

export async function downloadPageAsPdf(req: Request, res: Response) {
    const url = req.query.url;

    // Ensure url is a string
    if (typeof url !== 'string' || !url) {
        return res.status(400).send('Invalid URL provided');
    }

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        const pdf = await page.pdf({ format: 'A4' });

        res.contentType("application/pdf");
        res.send(pdf);

        await browser.close();
    } catch (error) {
        console.log(error);
        res.status(500).send('Error generating PDF');
    }
}
