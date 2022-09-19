import chalk from 'chalk';
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
            console.log(debugOptions);
            try {
                this.browser = debugOptions.debugMode? 
                   await connect({ 
                  browserURL:debugOptions.browserURL,
                  defaultViewport: null
                }): await launch(launchOptions);
                // console.log(launchOptions);
         console.log(this.browser);
            this.browser.on("disconnected", () => {
                if (this.browser?.process() != null) this.browser?.process()?.kill('SIGINT');
                createBrowser();
            });
            }catch(err){
                console.log('console log nef',err);
            }
            
            
        }
        this.ready =  (async () => {

            console.log(chalk.green('Setup Puppeteer abc'))
            // if (!fs.existsSync(DIR)) {
            //     fs.mkdirSync(DIR);
            //   }
            await createBrowser();

            return this;
        })();


    }
    
   
}

