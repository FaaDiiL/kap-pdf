import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

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
            "--incognito",
            "--no-sandbox",
            "--single-process",
            "--no-zygote"
        ],
    };
    try {
        const browser = await puppeteer.launch(chromeOptions);
        /*
        const browser = await puppeteer.launch(chromeOptions{
            headless: 'new',
            args: [ '--no-sandbox', '--hide-scrollbars', '--disable-web-security' ],
        });
        */
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(60000);
        await page.goto(url, { waitUntil: 'networkidle0' });

        // Define PDF path and options
        const pdfPath = path.resolve('temp', `download-${Date.now()}.pdf`);
        await page.pdf({ path: pdfPath, format: 'A4' });

        await browser.close();
        // Send the PDF file to the client
        res.download(pdfPath, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error sending the file');
            }
            // Delete the file after sending to client
            fs.unlinkSync(pdfPath);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}
