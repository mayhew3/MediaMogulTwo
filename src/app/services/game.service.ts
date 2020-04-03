import { Injectable } from '@angular/core';
import {Game} from '../interfaces/Game';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ArrayService} from './array.service';
import {plainToClass} from 'class-transformer';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  gamesUrl = 'api/games';
  cache: Game[];

  constructor(private http: HttpClient,
              private arrayService: ArrayService) {
    this.cache = [];
  }

  refreshCache(): Promise<Game[]> {
    return new Promise<Game[]>(resolve => {
      this.arrayService.emptyArray(this.cache);
      const subscription = this.http.get<Game[]>(this.gamesUrl).subscribe((gameObjs) => {
        const games = plainToClass(Game, gameObjs);
        this.arrayService.refreshArray(this.cache, games);
        resolve(games);
        subscription.unsubscribe();
      });
    });
  }
}
