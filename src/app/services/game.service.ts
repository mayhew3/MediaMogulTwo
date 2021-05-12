import {Injectable} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient} from '@angular/common/http';
import * as _ from 'underscore';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {combineLatest, Observable} from 'rxjs';
import {PlatformService} from './platform.service';
import {filter, first, map} from 'rxjs/operators';
import {MyGamePlatform} from '../interfaces/Model/MyGamePlatform';
import {AvailableGamePlatform} from '../interfaces/Model/AvailableGamePlatform';
import {MyGlobalPlatform} from '../interfaces/Model/MyGlobalPlatform';
import {ApiService} from './api.service';
import {Store} from '@ngxs/store';
import {GetGames} from '../actions/game.action';
import {GameData} from '../interfaces/ModelData/GameData';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private get gameData(): Observable<GameData[]> {
    return this.store.select(store => store.games).pipe(
      filter(state => !!state),
      map(state => state.games),
      filter((games: GameData[]) => !!games)
    )
  };

  games: Observable<Game[]> = combineLatest([this.gameData, this.platformService.platforms]).pipe(
    map(([games, globalPlatforms]) => _.map(games, g => new Game(g, globalPlatforms)))
  );

  constructor(private http: HttpClient,
              private personService: PersonService,
              private apiService: ApiService,
              private store: Store,
              private platformService: PlatformService) {
    this.personService.me$.subscribe(me => {
      this.store.dispatch(new GetGames(me.id));
    });
  }

  findGameWithID(game_id: number): Observable<Game> {
    return this.games.pipe(
      first(),
      map(games => {
        return _.findWhere(games, {id: game_id});
      })
    );
  }

  findGame(igdb_id: number): Observable<Game> {
    return this.games.pipe(
      first(),
      map(games => {
        const matching = _.filter(games, game => game.data.igdb_id === igdb_id);
        if (matching.length > 1) {
          throw new Error(`Found multiple games with IGDB_ID ${igdb_id}`);
        } else if (matching.length === 0) {
          return undefined;
        } else {
          return matching[0];
        }
      })
    );
  }

  async addGameToCollection(igdb_id: number,
                            platform_id?: number,
                            igdb_platform_id?: number,
                            rating?: number): Promise<void> {
    const body = {
      igdb_id,
      platform_id,
      igdb_platform_id,
      rating
    }
    this.apiService.executePostAfterFullyConnected('/api/games', body);
  }

  // PUBLIC CHANGE APIs. Make sure to call pushGameListChange() at the end of each operation.

  async addGame(game: Game): Promise<void> {
    /*const resultGame = await game.commit(this.http);
    this._dataStore.games.push(resultGame);
    this.pushGameListChange();
    return resultGame;*/
  }
/*

  async addAvailablePlatformForExistingGamePlatform(game: Game, availableGamePlatform: AvailableGamePlatform): Promise<AvailableGamePlatform> {
    const returnPlatform = await availableGamePlatform.commit(this.http);
    game.addToAvailablePlatforms(returnPlatform);
    this.pushGameListChange();
    return returnPlatform;
  }
*/

  async addMyGamePlatform(availableGamePlatform: AvailableGamePlatform, myGamePlatform: MyGamePlatform): Promise<void> {
    /*myGamePlatform.person_id.value = this.me.id;
    myGamePlatform.preferred.value = !availableGamePlatform.game.myPreferredPlatform;
    myGamePlatform.platform_name.value = availableGamePlatform.platform_name.value;
    myGamePlatform.game_platform_id.value = availableGamePlatform.game_platform_id.value;
    myGamePlatform.minutes_played.value = 0;
    myGamePlatform.collection_add.value = new Date();

    const returnMyGamePlatform = await myGamePlatform.commit(this.http);
    availableGamePlatform.myGamePlatform = returnMyGamePlatform;
    this.pushGameListChange();
    return returnMyGamePlatform;*/
  }

  async updateGame(game: Game): Promise<any> {
   /* await game.commit(this.http);
    this.pushGameListChange();*/
  }

  async getIGDBMatches(searchTitle: string): Promise<any[]> {
    const payload = {
      game_title: searchTitle
    };
    const options = {
      params: payload
    };
    return await this.http.get<any[]>('/api/igdbMatches', options).toPromise();
  }

  async updateMyPlatform(myGamePlatform: MyGamePlatform): Promise<any> {
    // await myGamePlatform.commit(this.http);
    // this.pushGameListChange();
  }

  async updateMultipleGlobalPlatforms(myGlobalPlatforms: MyGlobalPlatform[]): Promise<any> {
    const allChangedFields = [];
    _.forEach(myGlobalPlatforms, myGlobalPlatform => {
      const payload = {
        id: myGlobalPlatform.id,
        // changedFields: myGlobalPlatform.getChangedFields()
      };
      allChangedFields.push(payload);
    });
    const fullPayload = {
      // only need this for in-memory-api
      id: 213892,
      payloads: allChangedFields
    };
    await this.http.put('/api/multipleGlobals', fullPayload).toPromise();
    // _.forEach(myGlobalPlatforms, myGlobalPlatform => myGlobalPlatform.moveChanges());
  }

  async insertGameplaySession(gameplaySession: GameplaySession): Promise<void> {
    this.apiService.executePostAfterFullyConnected( '/api/gameplaySessions', gameplaySession);
  }
/*

  async platformAboutToBeRemovedFromGlobal(gamePlatform: GamePlatform): Promise<void> {
    for (const game of this._dataStore.games) {
      const matching = game.getOwnedPlatformWithID(gamePlatform.id);

      if (!!matching && matching.isManuallyPreferred()) {
      /!*  matching.preferred.value = false;
        await matching.commit(this.http);*!/
      }

    }
    this.pushGameListChange();
  }
*/


}
