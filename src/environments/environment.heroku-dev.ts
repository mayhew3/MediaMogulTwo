import {HttpClientModule} from '@angular/common/http';
import {EnvironmentConfig} from './environment.interface';

export const environment: EnvironmentConfig = {
  production: false,
  httpModules: [HttpClientModule],
  clientID: 'HY2lTrNdFc6HDrTlSoKZNL0EriSi0dnW',
  domain: 'mayhew3.auth0.com'
};
