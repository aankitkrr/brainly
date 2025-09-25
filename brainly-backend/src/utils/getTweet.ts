import puppeteer from 'puppeteer';

export async function getTweetTextViaScraping(tweetUrl: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36'
    );
    await page.goto(tweetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('article [data-testid="tweetText"]', {
      timeout: 10000,
    });

    const tweetText = await page.$eval(
      'article [data-testid="tweetText"]',
      (el) => el.textContent?.trim() || ''
    );

    console.log(tweetText);

    return tweetText;
  } catch (err) {
    console.error('Tweet scraping failed:', err);
    throw new Error('Failed to fetch tweet content');
  } finally {
    await browser.close();
  }
}
