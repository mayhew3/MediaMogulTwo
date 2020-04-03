import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameListComponent } from './components/game-list/game-list.component';
import {environment} from '../environments/environment';
import { GameCardComponent } from './components/game-card/game-card.component';
import { ImagePreloadDirective } from './directives/image-preload.directive';
import {NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    GameListComponent,
    GameCardComponent,
    ImagePreloadDirective
  ],
  imports: [
    BrowserModule,
    environment.httpModules,
    NgbPaginationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
