import { Injectable } from '@angular/core';
import {InMemoryDbService} from 'angular-in-memory-web-api';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService{

  games = [
    {
      id: 1,
      title: 'Half-Life: Alyx'
    },
    {
      id: 2,
      title: 'Subnautica'
    }];

  constructor() { }

  createDb(): {} {
    return {
      games: this.games
    };
  }
}
