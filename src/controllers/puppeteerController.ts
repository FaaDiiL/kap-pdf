import { Request, Response } from 'express';
import puppeteer from 'puppeteer';

const waitTillHTMLRendered = async (page: { content: () => any; evaluate: (arg0: () => number) => any; waitForTimeout: (arg0: number) => any; }, timeout = 30000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;
  
    while(checkCounts++ <= maxChecks){
      let html = await page.content();
      let currentHTMLSize = html.length; 
  
      let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);
  
      console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);
  
      if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
        countStableSizeIterations++;
      else 
        countStableSizeIterations = 0; //reset the counter
  
      if(countStableSizeIterations >= minStableSizeIterations) {
        console.log("Page rendered fully..");
        break;
      }
  
      lastHTMLSize = currentHTMLSize;
      await page.waitForTimeout(checkDurationMsecs);
    }  
  };

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
        return res.status(400).send('Invalid URL provided');
    }

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars', '--disable-web-security'],
            ignoreHTTPSErrors: true,
            headless: true, // Puppeteer defaults to headless mode
        });
        const page = await browser.newPage();
        await page.goto(url, {'timeout': 10000, 'waitUntil':'load'});
        await waitTillHTMLRendered(page)
        
        const pdf = await page.pdf({ ...configurations,format: 'A4' });

        await page.waitForNavigation({
            waitUntil: 'networkidle0',
        });
        
        res.setHeader('Content-Disposition', 'attachment; filename="download.pdf"');
        res.contentType("application/pdf");
        res.send(pdf);

        await browser.close();
    } catch (error) {
        console.log(error);
        res.status(500).send('Error generating PDF');
    }
}
