import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {GameListComponent} from './components/game-list/game-list.component';
import {environment} from '../environments/environment';
import {GameCardComponent} from './components/game-card/game-card.component';
import {ImagePreloadDirective} from './directives/image-preload.directive';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {PlaytimePopupComponent} from './components/playtime-popup/playtime-popup.component';
import {FormsModule} from '@angular/forms';
import {RatingBoxComponent} from './components/rating-box/rating-box.component';
import {GameDetailComponent} from './components/game-detail/game-detail.component';
import {AddPlatformsComponent} from './components/add-platforms/add-platforms.component';
import {NavBarComponent} from './components/nav-bar/nav-bar.component';
import {HomeComponent} from './components/home/home.component';
import {BrowseGamesComponent} from './components/browse-games/browse-games.component';
import {AppRoutingModule} from './app-routing.module';
import {ProfileComponent} from './components/profile/profile.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {BigCheckboxComponent} from './components/big-checkbox/big-checkbox.component';
import {SearchComponent} from './components/search/search.component';
import {PlatformListComponent} from './components/platform-list/platform-list.component';
import {PlatformDetailComponent} from './components/platform-detail/platform-detail.component';
import {MyPlatformsComponent} from './components/my-platforms/my-platforms.component';
import {AuthHttpInterceptor, AuthModule} from '@auth0/auth0-angular';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import { ErrorNotificationComponent } from './components/error-notification/error-notification.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MyAuthService} from './services/my-auth.service';
import {NgxsModule} from '@ngxs/store';
import {PersonState} from './states/person.state';
import {NgxsReduxDevtoolsPluginModule} from '@ngxs/devtools-plugin';
import {NgxsLoggerPluginModule} from '@ngxs/logger-plugin';

@NgModule({
  declarations: [
    AppComponent,
    GameListComponent,
    GameCardComponent,
    ImagePreloadDirective,
    PlaytimePopupComponent,
    RatingBoxComponent,
    GameDetailComponent,
    AddPlatformsComponent,
    NavBarComponent,
    HomeComponent,
    BrowseGamesComponent,
    ProfileComponent,
    DashboardComponent,
    BigCheckboxComponent,
    SearchComponent,
    PlatformListComponent,
    PlatformDetailComponent,
    MyPlatformsComponent,
    ErrorNotificationComponent
  ],
  imports: [
    BrowserModule,
    environment.httpModules,
    NgbModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    AppRoutingModule,
    NgxsModule.forRoot([
      PersonState
    ], {
      developmentMode: !environment.production
    }),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production
    }),
    AuthModule.forRoot({
      domain: environment.domain,
      clientId: environment.clientID,
      redirectUri: `${window.location.origin}`,
      audience: 'https://media-mogul-two.herokuapp.com',

      // Specify configuration for the interceptor
      httpInterceptor: {
        allowedList: ['/api/*'],
      },
    }),
    BrowserAnimationsModule,
  ],
  providers: [
    MyAuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
