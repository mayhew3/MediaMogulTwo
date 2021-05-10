/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {AvailableGamePlatform} from './AvailableGamePlatform';
import {GamePlatform} from './GamePlatform';
import {Game} from './Game';
import {MyGamePlatformData} from '../ModelData/MyGamePlatformData';

export class MyGamePlatform {

  constructor(public myGamePlatformData: MyGamePlatformData,
              public availableGamePlatform: AvailableGamePlatform) {
  }

  get platform(): GamePlatform {
    return this.availableGamePlatform.gamePlatform;
  }

  get game(): Game {
    return this.availableGamePlatform.game;
  }

  get id(): number {
    return this.myGamePlatformData.id;
  }

/*
  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.platform_name.value) {
      this.platform_name.initializeValue(this.availableGamePlatform.platform_name.value);
    }
    return this;
  }
*/

  getProgressPercent(): number {
    const minutesPlayed = this.myGamePlatformData.minutes_played;
    const minutesToFinish = this.game.minutesToFinish;

    if (!minutesToFinish) {
      return undefined;
    }

    const baseRatio = minutesPlayed / minutesToFinish;
    if (baseRatio > .99) {
      return 99;
    } else {
      return Math.floor(baseRatio * 100);
    }
  }

  isManuallyPreferred(): boolean {
    return this.myGamePlatformData.preferred === true;
  }

  isTemporary(): boolean {
    return !this.myGamePlatformData.id || !this.platform.id;
  }

  getApiMethod(): string {
    return 'myPlatforms';
  }

}
