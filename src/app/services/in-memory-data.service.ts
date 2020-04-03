import { Injectable } from '@angular/core';
import {InMemoryDbService} from 'angular-in-memory-web-api';
import {Game} from '../interfaces/Game';
import {MockGames} from '../mocks/games.mock';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService{

  games = MockGames;

  constructor() { }

  createDb(): {} {
    return {
      games: this.games
    };
  }
}
