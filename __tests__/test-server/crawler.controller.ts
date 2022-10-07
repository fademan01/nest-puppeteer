import { Controller, Post, Body, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { InjectContext } from '../../src/';
import { BrowserContext } from 'puppeteer';

@Controller('crawler')
export class CrawlerController {
  constructor(
    @InjectContext() private readonly context: BrowserContext,
    private readonly crawlerService: CrawlerService,
  ) {}

  @Post('/')
  async crawl(@Body() params: { url: string }) {
    return this.crawlerService.crawl(params.url);
  }

  @Get('/google')
  async getGoogleText() {
   return await this.crawlerService.crawlGoogle();   
  }

  @Get('/context')
  async contextType() {
    return { incognito: this.context.isIncognito() };
  }
}
