import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { ParsedQs } from 'qs';

export type Evaluator = () => any[]; // Replace 'any[]' with a more specific type if possible

export async function crawler(url: string, evaluator: Evaluator) {
  const browser = await puppeteer.launch({
    headless: true, // Set to true for headless mode
  });
  const page = await browser.newPage();
  await page.goto(url); // Navigate to the specified URL

  const result = await page.evaluate(evaluator);

  await browser.close(); // Close the browser after crawling

  return result;
}




export async function downloadPageAsPdf(req: Request, res: Response) {
    const url = req.query.url;
    if (typeof url !== 'string' || !url) {
        return res.status(400).send('Invalid URL provided');
    }
    
    (async () => {
        let result = await crawler(url, () => {
          const nodes = Array.from(document.querySelectorAll('a'));
          return nodes.map(({ innerText }) => innerText);
        });
        console.log(result); // Log the result to the console
      })();

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

   

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars', '--disable-web-security'],
            ignoreHTTPSErrors: true,
            headless: true, // Puppeteer defaults to headless mode
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
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
