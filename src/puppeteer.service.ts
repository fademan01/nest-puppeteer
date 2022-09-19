import {
    Injectable
  } from '@nestjs/common';
  import {connect , launch} from 'puppeteer';
  import type { PuppeteerLaunchOptions, Browser } from 'puppeteer';
import { DebugOptions } from './interfaces';

@Injectable()
export class puppeteerService {
public browser : Browser | undefined;
    ready: Promise<this>;
    constructor(launchOptions: PuppeteerLaunchOptions, debugOptions: DebugOptions) {
        let createBrowser = async () => {
            try {
                this.browser = debugOptions.debugMode? 
                   await connect({ 
                  browserURL:debugOptions.browserURL,
                  defaultViewport: null
                }): await launch(launchOptions);
                // the isssue happen with the connect function only
            this.browser.on("disconnected", () => {
                if (this.browser?.process() != null) this.browser?.process()?.kill('SIGINT');
                createBrowser();
            });
            }catch(err){
                console.log('console log nef',err);
            }
            
            
        }
        this.ready =  (async () => {
            await createBrowser();

            return this;
        })();


    }
    
   
}

