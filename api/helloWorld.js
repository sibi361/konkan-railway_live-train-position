import playwright from "playwright-aws-lambda";

export default async (req, res) => {
    const data = await (async () => {
        // const browser = await puppeteer.launch({ headless: "true" });
        let browser = null;
        browser = await playwright.launchChromium({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        // testing
        await page.goto("https://icanhazip.com");

        const html = await page.evaluate(() => {
            console.log("test");
            return document.body.textContent.trim();
        });
        await browser.close();
        console.log("# browser says ", html);
        return html;
    })();

    res.send({ your_ip: data });
};
