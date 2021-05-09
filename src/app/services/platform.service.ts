import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {GamePlatform} from '../interfaces/Model/GamePlatform';
import {HttpClient} from '@angular/common/http';
import {filter, map} from 'rxjs/operators';
import _ from 'underscore';
import fast_sort from 'fast-sort';
import {PersonService} from './person.service';
import {MyGlobalPlatform} from '../interfaces/Model/MyGlobalPlatform';
import {Game} from '../interfaces/Model/Game';
import {AvailableGamePlatform} from '../interfaces/Model/AvailableGamePlatform';
import {ApiService} from './api.service';
import {Store} from '@ngxs/store';
import {GetGlobalPlatforms} from '../actions/global.platform.action';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor(private http: HttpClient,
              private apiService: ApiService,
              private store: Store,
              private personService: PersonService) {
    this.personService.me$.subscribe(me => {
      this.store.dispatch(new GetGlobalPlatforms(me.id));
    });
  }

  // public observable for all changes to platform list
  get platforms(): Observable<GamePlatform[]> {
    return this.store.select(state => state.globalPlatforms).pipe(
      filter(store => !!store),
      map(store => store.globalPlatforms),
      filter(globalPlatforms => !!globalPlatforms)
    );
  }

  get myPlatforms(): Observable<GamePlatform[]> {
    return this.platforms.pipe(
      map((platforms: GamePlatform[]) => {
        const filtered: GamePlatform[] = _.filter(platforms, platform => !!platform.myGlobalPlatform);
        fast_sort(filtered)
          .asc(platform => platform.myGlobalPlatform.rank.originalValue);
        return filtered;
      })
    );
  }

  addPlatform(gamePlatform: GamePlatform): void {
    this.apiService.executePostAfterFullyConnected('/api/gamePlatforms', gamePlatform);
  }

  waitForPlatformAdded(igdb_platform_id: number): Observable<GamePlatform> {
    return this.platforms.pipe(
      map(globalPlatforms => _.findWhere(globalPlatforms, {igdb_platform_id})),
      filter(platform => !!platform)
    );
  }

  updatePlatform(gamePlatform: GamePlatform,
                 full_name: string,
                 short_name: string,
                 metacritic_uri: string): void {
    const data = {
      id: gamePlatform.id,
      full_name,
      short_name,
      metacritic_uri
    };
    this.apiService.executePutAfterFullyConnected('/api/gamePlatforms', data);
  }

  async addMyGlobalPlatform(myGlobalPlatform: MyGlobalPlatform): Promise<MyGlobalPlatform> {
    return new Promise(resolve => {
      this.personService.me$.subscribe(async person => {
        myGlobalPlatform.person_id.value = person.id;
        const gamePlatform = myGlobalPlatform.platform;
        gamePlatform.myGlobalPlatform = await myGlobalPlatform.commit(this.http);
        // this.pushPlatformListChange();
        resolve(gamePlatform.myGlobalPlatform);
      });
    });
  }

  async removeMyGlobalPlatform(myGlobalPlatform: MyGlobalPlatform): Promise<any> {
    const gamePlatform = myGlobalPlatform.platform;
    await myGlobalPlatform.delete(this.http);
    delete gamePlatform.myGlobalPlatform;
    // this.pushPlatformListChange();
  }

  addablePlatforms(game: Game): GamePlatform[] {
    return _.filter(game.availablePlatforms, availableGamePlatform => this.canAddToGame(availableGamePlatform));
  }

  canAddToGame(availableGamePlatform: AvailableGamePlatform): boolean {
    return this.canAddPlaytime(availableGamePlatform.gamePlatform) && !!availableGamePlatform.gamePlatform.myGlobalPlatform;
  }

  canAddPlaytime(gamePlatform: GamePlatform): boolean {
    return gamePlatform.full_name !== 'Steam';
  }

}
