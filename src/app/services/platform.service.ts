import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {GamePlatform} from '../interfaces/Model/GamePlatform';
import {HttpClient} from '@angular/common/http';
import {ArrayService} from './array.service';
import {takeUntil} from 'rxjs/operators';
import * as _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class PlatformService implements OnDestroy {
  private _platforms$ = new BehaviorSubject<GamePlatform[]>([]);
  private _platforms: GamePlatform[];
  private _fetching = false;

  private _destroy$ = new Subject();

  constructor(private http: HttpClient,
              private arrayService: ArrayService) { }

  // public observable for all changes to platform list
  get platforms() {
    return this._platforms$.asObservable();
  }

  maybeRefreshCache() {
    if (!this._platforms) {
      this._fetching = true;
      this.refreshCache();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private refreshCache() {
    this.http
      .get<any[]>('api/gamePlatforms')
      .pipe(takeUntil(this._destroy$))
      .subscribe(platformObjs => {
        this._platforms = this.convertObjectsToPlatforms(platformObjs);
        this.pushPlatformListChange();
        this._fetching = false;
      });
  }

  private pushPlatformListChange() {
    this._platforms$.next(this.arrayService.cloneArray(this._platforms));
  }

  private convertObjectsToPlatforms(platformObjs: any[]): GamePlatform[] {
    return _.map(platformObjs, platformObj => new GamePlatform().initializedFromJSON(platformObj));
  }

  async addPlatform(gamePlatform: GamePlatform): Promise<GamePlatform> {
    const returnObj = await gamePlatform.commit(this.http);
    this._platforms.push(returnObj);
    this.pushPlatformListChange();
    return returnObj;
  }

  addToPlatformsIfDoesntExist(gamePlatform: GamePlatform): void {
    if (gamePlatform.isTemporary()) {
      throw new Error('PlatformService cannot contain temporary platforms');
    }
    const existing = _.find(this._platforms, platform => platform.id.value === gamePlatform.id.value);
    if (!existing) {
      this._platforms.push(gamePlatform);
      this.pushPlatformListChange();
    }

  }
}
