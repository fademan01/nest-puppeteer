import { Injectable } from '@nestjs/common';
import { InjectPage } from '../../src/';
import { Page } from 'puppeteer';

@Injectable()
export class CrawlerService {
  constructor(@InjectPage() private readonly page: Page) {}

  async crawl(url: string) {
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    const content = await this.page.content();
    return { content };
  } 

  async crawlGoogle() {
    await this.page.goto('https://google.com', { waitUntil: 'networkidle2' });
    let content = await this.page.evaluate(() => document.body.textContent);
    return {content};
    
  }
}
