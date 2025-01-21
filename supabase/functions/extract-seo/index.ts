import { serve } from "std/server";
import { chromium } from "playwright";

serve(async (req) => {
  const { url } = await req.json();

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const title = await page.title();
  const description = await page.$eval('meta[name="description"]', (el) => el.content);
  
  // Extraction des liens
  const extractLinks = async (page) => {
    const links = await page.$$eval('a', (elements) => {
      return elements.map(el => ({
        href: el.href,
        text: el.textContent?.trim(),
        isInternal: el.href.includes(window.location.hostname)
      }));
    });

    const internal = links.filter(link => link.isInternal).map(link => link.href);
    const external = links.filter(link => !link.isInternal).map(link => link.href);

    return { internal, external };
  };

  const { internal, external } = await extractLinks(page);

  const analysisData = {
    title,
    description,
    internal_links: internal,
    external_links: external,
  };

  await browser.close();
  return new Response(JSON.stringify(analysisData), {
    headers: { "Content-Type": "application/json" },
  });
});
