import {
  Module,
  Inject,
  Global,
  DynamicModule,
  Provider,
  OnApplicationShutdown,
  OnModuleDestroy,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { LaunchOptions, Browser, BrowserContext } from 'puppeteer';

import {
  PUPPETEER_INSTANCE_NAME,
  DEFAULT_PUPPETEER_INSTANCE_NAME,
  DEFAULT_CHROME_LAUNCH_OPTIONS,
  PUPPETEER_MODULE_OPTIONS,
  DEFAULT_DEBUG_OPTIONS,
} from './puppeteer.constants';
import type {
  PuppeteerModuleAsyncOptions,
  PuppeteerOptionsFactory,
  PuppeteerModuleOptions,
  DebugOptions
} from './interfaces/puppeteer-options.interface';
import {
  getBrowserToken,
  getContextToken,
  getPageToken,
  getSecondPageToken
} from './puppeteer.util';
import { puppeteerService } from './puppeteer.service';

@Global()
@Module({})
export class PuppeteerCoreModule
  implements OnApplicationShutdown, OnModuleDestroy {
  constructor(
    @Inject(PUPPETEER_INSTANCE_NAME) private readonly instanceName: string,
    private readonly moduleRef: ModuleRef,
  ) {}
  onApplicationShutdown() {
    return this.onModuleDestroy();
  }

  static forRoot(
    launchOptions: LaunchOptions = DEFAULT_CHROME_LAUNCH_OPTIONS,
    debugOptions: DebugOptions = DEFAULT_DEBUG_OPTIONS,
    instanceName: string = DEFAULT_PUPPETEER_INSTANCE_NAME    
  ): DynamicModule {
    const instanceNameProvider = {
      provide: PUPPETEER_INSTANCE_NAME,
      useValue: instanceName,
    };

    const browserProvider = {
      provide: getBrowserToken(instanceName),
      useFactory: async ()=> {
        return (await (new puppeteerService(launchOptions, debugOptions).ready)).browser;
      },
    };

    const contextProvider = {
      provide: getContextToken(instanceName),
      async useFactory(browser: Browser) {
        return  browser.defaultBrowserContext();
      },
      inject: [getBrowserToken(instanceName)],
    };

    const pageProvider = {
      provide: getPageToken(instanceName),
      async useFactory(context: BrowserContext) {
        return (await context.pages())[0];
      },
      inject: [getContextToken(instanceName)],
    };

   
    const secondPageProvider = {
      provide: getSecondPageToken(instanceName),
      async useFactory(context: BrowserContext) {
        while ((await context.pages()).length <2) {
          await context.newPage();
        
        }
        return (await context.pages())[1];
      },
      inject: [getContextToken(instanceName)],
    };
    
   

    return {
      module: PuppeteerCoreModule,
      providers: [
        instanceNameProvider,
        browserProvider,
        contextProvider,
        pageProvider,        
        secondPageProvider
      ],
      exports: [browserProvider, contextProvider, pageProvider,  secondPageProvider],
    };
  }

  static forRootAsync(options: PuppeteerModuleAsyncOptions): DynamicModule {
    const puppeteerInstanceName =
      options.instanceName ?? DEFAULT_PUPPETEER_INSTANCE_NAME;

    const instanceNameProvider = {
      provide: PUPPETEER_INSTANCE_NAME,
      useValue: puppeteerInstanceName,
    };

    const browserProvider = {
      provide: getBrowserToken(puppeteerInstanceName),
      async useFactory(puppeteerModuleOptions: PuppeteerModuleOptions) {
        return (await (new puppeteerService(
          puppeteerModuleOptions.launchOptions ?? DEFAULT_CHROME_LAUNCH_OPTIONS,
          puppeteerModuleOptions.debugOptions?? DEFAULT_DEBUG_OPTIONS
        ).ready)).browser;
      },
      inject: [PUPPETEER_MODULE_OPTIONS],
    };

    const contextProvider = {
      provide: getContextToken(puppeteerInstanceName),
      async useFactory(browser: Browser) {
        return browser.defaultBrowserContext();
      },
      inject: [
        PUPPETEER_MODULE_OPTIONS,
        getBrowserToken(puppeteerInstanceName),
      ],
    };

    const pageProvider = {
      provide: getPageToken(puppeteerInstanceName),
      async useFactory(context: BrowserContext) {
        return (await context.pages())[0];
      },
      inject: [
        PUPPETEER_MODULE_OPTIONS,
        getContextToken(puppeteerInstanceName),
      ],
    };
   
    const secondPageProvider = {
      provide: getSecondPageToken(puppeteerInstanceName),
      async useFactory(context: BrowserContext) {
        let pageLength = (await context.pages()).length;
        while (pageLength <2) {
          await context.newPage();
          pageLength++;
        }
        return (await context.pages())[1];
      },
      inject: [
        PUPPETEER_MODULE_OPTIONS,
        getContextToken(puppeteerInstanceName),
      ],
    };
    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: PuppeteerCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        browserProvider,
        contextProvider,
        pageProvider,
        secondPageProvider,
        instanceNameProvider,
      ],
      exports: [browserProvider, contextProvider, pageProvider, secondPageProvider],
    };
  }

  async onModuleDestroy() {
    const browser: Browser = this.moduleRef.get(
      getBrowserToken(this.instanceName),
    );
    puppeteerService.moduleDestroyedStatus = true;

    if (browser?.isConnected()&& puppeteerService.debugMode) browser.disconnect();
    else await browser.close();

  }

  private static createAsyncProviders(
    options: PuppeteerModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    } else if (options.useClass) {
      return [
        this.createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    } else {
      return [];
    }
  }

  private static createAsyncOptionsProvider(
    options: PuppeteerModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: PUPPETEER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    } else if (options.useExisting) {
      return {
        provide: PUPPETEER_MODULE_OPTIONS,
        async useFactory(optionsFactory: PuppeteerOptionsFactory) {
          return optionsFactory.createPuppeteerOptions();
        },
        inject: [options.useExisting],
      };
    } else if (options.useClass) {
      return {
        provide: PUPPETEER_MODULE_OPTIONS,
        async useFactory(optionsFactory: PuppeteerOptionsFactory) {
          return optionsFactory.createPuppeteerOptions();
        },
        inject: [options.useClass],
      };
    } else {
      throw new Error('Invalid PuppeteerModule options');
    }
  }
}
