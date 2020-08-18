const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
// const SendmailTransport = require('nodemailer/lib/sendmail-transport');

url = ('https://finance.yahoo.com/quote/CAD=X/');


async function configureBrowser(){ //define the function
    const browser = await puppeteer.launch(); //await to launch the browser
    const page = await browser.newPage(); //await to go the page on the browser
    await page.goto(url); //await to go to the url on the open page
    return page;
}

async function checkPrice(page) {
    await page.reload();

    const [el3] = await page.$x('//*[@id="quote-header-info"]/div[3]/div[1]/div/span[1]');
    const txt2 = await el3.getProperty('textContent');
    const price = await txt2.jsonValue();
    let currentPrice = Number(price.replace(/[^0-9.-]+/g,""))
    console.log({currentPrice});

    if (currentPrice < 1.5000)  {
        console.log("Buy!! " + currentPrice);
        sendNotification(currentPrice);
    }

    // browser.close();
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
            user: '36in6uday@gmail.com',
            pass: 'Oceazon4$'
        }
    });

    // let textToSend = 'price dropped to ' + price;
    // let htmlText =  `<a href=\"${url}\">Link to site</a>`;
    // console.log(htmlText);

    let info = await transporter.sendMail({
        from: '"Uday CAD tracker" <36in6uday@gmail.com>',
        to: 'stswarna@mun.ca',
        subject: 'CAD to USD update',
        text: 'This is the daily CAD to USD exchange rate update: '+ price +`\n Link to site: \"${url}\" \n`+'\n Subsrcibe for more such updates and price drop alerts.',
        // html: `<a href=\"${url}\">Link to site</a>`,
    });

    console.log("Message sent: %s", info.messageId);
}
startTracking();

async function monitor()    {
    let page = await configureBrowser();
    await checkPrice(page);
}

monitor();

