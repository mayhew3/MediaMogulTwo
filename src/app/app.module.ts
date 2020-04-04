import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameListComponent } from './components/game-list/game-list.component';
import {environment} from '../environments/environment';
import { GameCardComponent } from './components/game-card/game-card.component';
import { ImagePreloadDirective } from './directives/image-preload.directive';
import {NgbDatepickerModule, NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import { PlaytimePopupComponent } from './components/playtime-popup/playtime-popup.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    GameListComponent,
    GameCardComponent,
    ImagePreloadDirective,
    PlaytimePopupComponent
  ],
  imports: [
    BrowserModule,
    environment.httpModules,
    NgbPaginationModule,
    NgbDatepickerModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
