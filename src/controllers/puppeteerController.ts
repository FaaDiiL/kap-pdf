import { Request, Response } from 'express';
import puppeteer from 'puppeteer';

// Function to create a delay
function delay(time: number) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}


export async function downloadPageAsPdf(req: Request, res: Response) {
    const url = req.query.url;

    const configurations = {
        displayHeaderFooter: true,
        margin: {
          bottom: 150,
          left: 50,
          right: 50,
          top: 30,
        },
        printBackground: true,
    }

    if (typeof url !== 'string' || !url) {
        console.log('Invalid URL provided');
        return res.status(400).send('Invalid URL provided');
    }

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars', '--disable-web-security'],
            ignoreHTTPSErrors: true,
            headless: 'new', // Puppeteer defaults to headless mode
        });
        const page = await browser.newPage();
        console.log('Page created');
        await page.goto(url, { waitUntil: ['load', 'networkidle0', 'domcontentloaded'] });
        await delay(9000)
        const pdf = await page.pdf({ ...configurations,format: 'A4' });

        res.setHeader('Content-Disposition', 'attachment; filename="download.pdf"');
        res.contentType("application/pdf");
        res.send(pdf);

        await browser.close();
    } catch (error) {
        console.log(error);
        res.status(500).send('Error generating PDF');
    }
}
