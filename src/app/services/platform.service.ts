import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {GamePlatform, GamePlatformData} from '../interfaces/Model/GamePlatform';
import {HttpClient} from '@angular/common/http';
import {filter, first, map} from 'rxjs/operators';
import _ from 'underscore';
import { inPlaceSort } from 'fast-sort';
import {PersonService} from './person.service';
import {MyGlobalPlatform} from '../interfaces/Model/MyGlobalPlatform';
import {Game} from '../interfaces/Model/Game';
import {AvailableGamePlatform} from '../interfaces/Model/AvailableGamePlatform';
import {ApiService} from './api.service';
import {Store} from '@ngxs/store';
import {GetGlobalPlatforms} from '../actions/global.platform.action';
import {MyGamePlatform} from '../interfaces/Model/MyGamePlatform';

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

  get platforms(): Observable<GamePlatform[]> {
    return this.platformData.pipe(
      map(platformData => _.map(platformData, datum => new GamePlatform(datum)))
    );
  }

  get myPlatforms(): Observable<GamePlatform[]> {
    return this.platforms.pipe(
      map((platforms: GamePlatform[]) => {
        const filtered: GamePlatform[] = _.filter(platforms, platform => !!platform.myGlobalPlatform);
        inPlaceSort(filtered)
          .asc(platform => platform.myGlobalPlatform.rank);
        return filtered;
      })
    );
  }

  getMyPlatformsInGlobal(game: Game): Observable<MyGamePlatform[]> {
    return this.myPlatforms.pipe(
      map(platforms => {
        const myGamePlatforms = game.myPlatforms;
        return _.filter(myGamePlatforms, mgp => !!_.findWhere(platforms, {id: mgp.platform.id}));
      })
    );
  }

  getMyPreferredPlatform(game: Game): Observable<MyGamePlatform> {
    return this.getMyPlatformsInGlobal(game).pipe(
      map(myPlatforms => {
        if (myPlatforms.length > 0) {
          const manualPreferred = _.find(myPlatforms, myPlatform => !!myPlatform.data.preferred);
          if (!!manualPreferred) {
            return manualPreferred;
          } else {
            inPlaceSort(myPlatforms)
              .asc(myPlatform => myPlatform.platform.myGlobalPlatform.rank);
            return myPlatforms[0];
          }
        } else {
          return undefined;
        }
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
      changedFields: {
        full_name,
        short_name,
        metacritic_uri
      }
    };
    this.apiService.executePutAfterFullyConnected('/api/gamePlatforms', data);
  }

  addMyGlobalPlatform(myGlobalPlatformObj: any): void {
    this.personService.me$.subscribe(person => {
      myGlobalPlatformObj.person_id = person.id;
      this.apiService.executePostAfterFullyConnected('/api/myGlobalPlatforms', myGlobalPlatformObj);
    });
  }

  removeMyGlobalPlatform(myGlobalPlatform: MyGlobalPlatform): void {
    this.apiService.executeDeleteAfterFullyConnected('/api/myGlobalPlatforms', myGlobalPlatform.id);
  }

  addablePlatforms(game: Game): AvailableGamePlatform[] {
    return _.filter(game.availablePlatforms, availableGamePlatform => this.canAddToGame(availableGamePlatform));
  }

  myMutablePlatforms(game: Game): MyGamePlatform[] {
    return _.filter(game.myPlatformsInGlobal, myGamePlatform => this.canAddPlaytime(myGamePlatform.platform));
  }

  canAddToGame(availableGamePlatform: AvailableGamePlatform): boolean {
    return this.canAddPlaytime(availableGamePlatform.gamePlatform) && !!availableGamePlatform.gamePlatform.myGlobalPlatform;
  }

  canAddPlaytime(gamePlatform: GamePlatform): boolean {
    return gamePlatform.platform_name !== 'Steam';
  }

  // public observable for all changes to platform list
  private get platformData(): Observable<GamePlatformData[]> {
    return this.store.select(state => state.globalPlatforms).pipe(
      filter(store => !!store),
      map(store => store.globalPlatforms),
      filter((globalPlatforms: GamePlatformData[]) => !!globalPlatforms)
    );
  }


}
