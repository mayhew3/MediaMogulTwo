import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameListComponent } from './components/game-list/game-list.component';
import {environment} from '../environments/environment';
import { GameCardComponent } from './components/game-card/game-card.component';
import { ImagePreloadDirective } from './directives/image-preload.directive';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { PlaytimePopupComponent } from './components/playtime-popup/playtime-popup.component';
import {FormsModule} from '@angular/forms';
import { RatingBoxComponent } from './components/rating-box/rating-box.component';
import { GameDetailComponent } from './components/game-detail/game-detail.component';
import { AddPlatformsComponent } from './components/add-platforms/add-platforms.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { HomeComponent } from './components/home/home.component';
import { BrowseGamesComponent } from './components/browse-games/browse-games.component';
import {AppRoutingModule} from './app-routing.module';
import { ProfileComponent } from './components/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BigCheckboxComponent } from './components/big-checkbox/big-checkbox.component';
import { SearchComponent } from './components/search/search.component';
import { PlatformListComponent } from './components/platform-list/platform-list.component';
import { PlatformDetailComponent } from './components/platform-detail/platform-detail.component';
import { MyPlatformsComponent } from './components/my-platforms/my-platforms.component';

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
    MyPlatformsComponent
  ],
  imports: [
    BrowserModule,
    environment.httpModules,
    NgbModule,
    FormsModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
