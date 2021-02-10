import { enableProdMode, isDevMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'hammerjs';


if (environment.production) {
  enableProdMode();
}

if ( !isDevMode() ) {
  console.log = ( ...args: any[] ) => {};
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));


