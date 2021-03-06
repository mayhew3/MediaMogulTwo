// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {HttpClientModule} from '@angular/common/http';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {InMemoryDataService} from '../app/services/in-memory-data.service';
import {SocketService} from '../app/services/socket.service';
import {LoggerService} from '../app/services/logger.service';
import {InitSocketService} from '../app/services/init-socket.service';
import {SocketServiceMock} from '../app/services/socket.mock.service';
import {InitSocketMockService} from '../app/services/init-socket.mock.service';

export const environment = {
  production: false,
  httpModules: [HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, { dataEncapsulation: false, delay: 0 }
    )],
  clientID: 'HY2lTrNdFc6HDrTlSoKZNL0EriSi0dnW',
  domain: 'mayhew3.auth0.com',
  socketModule: {provide: SocketService, useClass: SocketServiceMock},
  loggerModule: {provide: LoggerService, useClass: LoggerService},
  initSocketModule: {provide: InitSocketService, useClass: InitSocketMockService}
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
