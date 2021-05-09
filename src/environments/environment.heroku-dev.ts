import {HttpClientModule} from '@angular/common/http';
import {EnvironmentConfig} from './environment.interface';
import {LoggerService} from '../app/services/logger.service';
import {SocketService} from '../app/services/socket.service';
import {InitSocketService} from '../app/services/init-socket.service';

export const environment: EnvironmentConfig = {
  production: false,
  httpModules: [HttpClientModule],
  clientID: 'HY2lTrNdFc6HDrTlSoKZNL0EriSi0dnW',
  domain: 'mayhew3.auth0.com',
  socketModule: {provide: SocketService, useClass: SocketService},
  loggerModule: {provide: LoggerService, useClass: LoggerService},
  initSocketModule: {provide: InitSocketService, useClass: InitSocketService}
};
