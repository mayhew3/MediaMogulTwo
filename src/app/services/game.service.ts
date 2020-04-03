import {Injectable} from '@angular/core';
import {Game} from '../interfaces/Game';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ArrayService} from './array.service';
import {plainToClass} from 'class-transformer';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

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
      const subscription = this.http.get<any[]>(this.gamesUrl).subscribe((gameObjs) => {
        const games = plainToClass(Game, gameObjs);
        this.arrayService.refreshArray(this.cache, games);
        resolve(games);
        subscription.unsubscribe();
      });
    });
  }

  updateGame(gameID: number, changedFields): Promise<any> {
    return new Promise<any>(resolve => {
      const payload = {gameID, changedFields};
      const subscription = this.http.patch(this.gamesUrl, payload, httpOptions).subscribe(() => {
        resolve();
        subscription.unsubscribe();
      });
    });
  }
}
