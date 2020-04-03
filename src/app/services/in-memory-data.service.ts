import { Injectable } from '@angular/core';
import {InMemoryDbService} from 'angular-in-memory-web-api';
import {Game} from '../interfaces/Game';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService{

  games: Game[] = [
    {
      id: 1,
      title: 'Half-Life: Alyx',
      steamID: '546560',
      logo: 'f7269f4b14f921e9dff13c05caf133ffe92b58ab',
      igdbPoster: null,
      giantBombMedium: 'https://www.giantbomb.com/api/image/scale_medium/3145045-alyx_coverart.jpg'
    },
    {
      id: 2,
      title: 'Subnautica',
      steamID: '264710',
      logo: 'd6bfaafed7b41466cc99b70972a944ac7e4d6edf',
      igdbPoster: 'tgjqi7pnqabsvgdtdujh',
      giantBombMedium: 'https://www.giantbomb.com/api/image/scale_medium/3067261-box_subn.png'
    }];

  constructor() { }

  createDb(): {} {
    return {
      games: this.games
    };
  }
}
