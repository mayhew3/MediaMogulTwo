import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameListComponent } from './components/game-list/game-list.component';
import {environment} from '../environments/environment';
import { GameCardComponent } from './components/game-card/game-card.component';

@NgModule({
  declarations: [
    AppComponent,
    GameListComponent,
    GameCardComponent
  ],
  imports: [
    BrowserModule,
    environment.httpModules,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
