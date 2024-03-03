const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();
async function getPrice(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  // Replace the selector with the appropriate one for the website you're working with
  const priceElement = await page.$(".currency_el");

  if (priceElement) {
    const price = await page.evaluate(
      (element) => element.textContent,
      priceElement
    );
    return price;
  } else {
    console.log("Could not find the price element on the page.");
  }

  await browser.close();
}

// Example usage:
const urlToMonitor =
  "https://shop.amul.com/en/product/amul-whey-protein-32-g-or-pack-of-30-sachets";
const targetPrice = 2000.0;

async function sendEmail(subject, body) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
  });

  const mailOptions = {
    from: "dheemanpati1@gmail.com",
    to: "dheemanpati53@gmail.com",
    subject: subject,
    html: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

getPrice(urlToMonitor)
  .then((currentPrice) => {
    let currentPriceNumeric = Number.parseFloat(
      currentPrice.slice(1).replace(",", "")
    );

    if (currentPriceNumeric < targetPrice) {
      console.log(
        `The price has dropped to ${currentPrice}. Sending an alert.`
      );
      // Implement your alert mechanism here (e.g., sending an email or using a notification library)

      sendEmail(
        `👾AMUL WHEY PRICE ALERT 💰${currentPrice} !!!!!!`,
        `<img src='https://shop.amul.com/s/62fa94df8c13af2e242eba16/6523d26993085e95c5ce80a8/02-fop_amul-whey-protein-960g-800x800.png'/>
        <br>
        <p>The price has dropped to ${currentPrice}. Sending an alert.<p>`
      )
        .then((resp) => {
          console.log(resp);
        })
        .catch((error) => console.log(error));
    } else {
      console.log(
        `The current price is ${currentPriceNumeric}. It's still above the target.`
      );
    }
  })

  .catch((error) => console.error(error));
