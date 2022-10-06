import {
    Injectable
  } from '@nestjs/common';
  import {connect , launch} from 'puppeteer';
  import type { PuppeteerLaunchOptions, Browser } from 'puppeteer';
import { DebugOptions } from './interfaces';
import {
    NodeWebSocketTransport,
  } from "../node_modules/puppeteer/lib/cjs/puppeteer/node/NodeWebSocketTransport"; 


@Injectable()
export class puppeteerService  {
public browser : Browser | undefined;
static debugMode: Boolean = false;
static moduleDestroyedStatus: Boolean = false;
public ready: Promise<this>;
    constructor(launchOptions: PuppeteerLaunchOptions, debugOptions: DebugOptions) {
        let createBrowser = async () => {
           
            try {
                if (debugOptions.debugMode) {
                    puppeteerService.debugMode = true;
                   const transport = await NodeWebSocketTransport.create(debugOptions.browserWSEndpoint);
                   console.log(transport);
                    this.browser = await connect({ 
                        transport: transport
                    });
                } else {
                this.browser = await launch(launchOptions);
                }
                // the isssue happen with the connect function only
            this.browser.on("disconnected", () => {
                if (this.browser?.process() != null) this.browser?.process()?.kill('SIGINT');
                if (!puppeteerService.moduleDestroyedStatus) createBrowser();
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

