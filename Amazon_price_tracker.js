// Amazon Price tracker
// Credits to Tomasz Baranowicz

const puppeteer  = require('puppeteer');
const cheerio = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

url = ('https://www.amazon.ca/Sony-WH1000XM3-Canceling-Headphones-WH-1000XM3/dp/B07G4MNFS1');

async function configureBrowser()   {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

async function checkPrice(page) {
    await page.reload();

    let html = await page.evaluate(() => document.body.innerHTML);
    // console.log(html)

    cheerio('#priceblock_ourprice', html).each(function()  {
        let dollarPrice = cheerio(this).text();
        console.log(dollarPrice);

        let currentPrice = Number(dollarPrice.replace(/[^0-9.-]+/g,""))
        //console.log(currentPrice)
        if (currentPrice < 1.50) {
            console.log("Buy!! " + currentPrice);
            sendNotification(currentPrice);
        }
    });

}

async function startTracking()  {
    const page = await configureBrowser();

    let job = new CronJob('*/1500 * * * * *', function()  {
        checkPrice(page);
    }, null, true, null, null, true);
    job.start();
}

async function sendNotification(price)   {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: '*****@gmail.com',
            pass: '*****'
        }
    });

    let textToSend = 'price dropped to ' + price;
    let htmlText =  `<a href=\"${url}\">Link to site</a>`;
    console.log(htmlText);

    let info = await transporter.sendMail({
        from: '"Price tracker" <*****@gmail.com>',
        to: '*****@gmail.com',
        subject: 'Price dropped to ' + price,
        text: textToSend,
        html: htmlText,
    });

    console.log("Message sent: %s", info.messageId);
}
startTracking();

async function monitor()    {
    let page = await configureBrowser();
    await checkPrice(page);
}

monitor();
