import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Browser } from 'puppeteer';

import { PuppeteerModule, InjectBrowser } from '../../src/';
import { CrawlerModule } from './crawler.module';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';

@Module({
  imports: [PuppeteerModule.forRoot({ headless: false, isGlobal: true },'BrowserInstanceName', {debugMode: true, browserURL:'http://127.0.0.1:9222'}), CrawlerModule],
  controllers: [AppController, CrawlerController],
  providers: [AppService, CrawlerService],
})
export class AppModule {
  constructor(@InjectBrowser() private readonly browser: Browser) {}

  async configure() {
    const version = await this.browser.version();
    Logger.log(`Launched browser: ${version}`, 'Test');
  }
}
