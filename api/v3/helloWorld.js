import playwright from "playwright-aws-lambda";
import { devices } from "playwright-core";

export default async (req, res) => {
    const data = await (async () => {
        const browser = await playwright.launchChromium({ headless: true });
        const UA = devices["Desktop Firefox"];
        const context = await browser.newContext(UA);
        const page = await context.newPage();

        // disable assets loading to save bandwidth
        page.route("**/*", (route) => {
            if (route.request().resourceType() == "document") route.continue();
            else route.abort();
        });

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
