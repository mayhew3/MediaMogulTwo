import { Injectable } from '@angular/core';
import {Game} from '../interfaces/Game';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  gamesUrl = 'api/games';
  cache: Game[];

  constructor(private http: HttpClient) {
    this.cache = [];
  }

  // todo: switch to promise
  refreshCache(): Observable<Game[]> {
    return new Observable<Game[]>(observer => {
      this.cache.length = 0;
      // todo: unsubscribe
      this.http.get<Game[]>(this.gamesUrl).subscribe((games: Game[]) => {
        observer.next(games);
      });
    });
  }
}
