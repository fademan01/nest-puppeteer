// import {
//     Injectable
//   } from '@nestjs/common';
  import {connect , launch} from 'puppeteer';
  import type { PuppeteerLaunchOptions, Browser } from 'puppeteer';
import { DebugOptions } from './interfaces';
import {
    NodeWebSocketTransport,
  } from "../node_modules/puppeteer/lib/cjs/puppeteer/node/NodeWebSocketTransport"; 


export class puppeteerService {
public browser : Browser | undefined;
    ready: Promise<this>;
    constructor(launchOptions: PuppeteerLaunchOptions, debugOptions: DebugOptions) {
        let createBrowser = async () => {
           
            try {
                const browserWSEndpoint = "ws://127.0.0.1:9222/devtools/browser/b6d4695e-e344-4e81-9c54-085e566bc15e" // change to your was endpoint
                const transport = await NodeWebSocketTransport.create(browserWSEndpoint);
                this.browser = debugOptions.debugMode? 
                   await connect({ 
                 transport: transport
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

