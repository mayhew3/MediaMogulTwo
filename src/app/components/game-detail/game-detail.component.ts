import {Component, Input, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ArrayService} from '../../services/array.service';
import {Platform} from '../../interfaces/Platform';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'mm-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss']
})
export class GameDetailComponent implements OnInit {
  @Input() game;

  originalFields;
  interfaceFields;
  originalPersonFields;
  interfacePersonFields;
  changedGameFields = {};
  changedPersonFields = {};
  finished = false;

  editedTitle;

  titleEditMode = false;

  constructor(private gameService: GameService,
              public activeModal: NgbActiveModal,
              private arrayService: ArrayService,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.finished = !!this.game.personGame && !!this.game.personGame.finished_date;
    this.editedTitle = this.game.title;

    this.originalFields = {
      platform: this.game.platform,
      metacritic: this.game.metacritic,
      metacritic_hint: this.game.metacritic_hint,
      timetotal: this.game.timetotal,
      natural_end: this.game.natural_end,
      howlong_id: this.game.howlong_id,
      giantbomb_id: this.game.giantbomb_id
    };

    this.interfaceFields = {
      platform: this.game.platform,
      metacritic: this.game.metacritic,
      metacritic_hint: this.game.metacritic_hint,
      timetotal: this.game.timetotal,
      natural_end: this.game.natural_end,
      howlong_id: this.game.howlong_id,
      giantbomb_id: this.game.giantbomb_id
    };

    if (!!this.game.personGame) {
      this.originalPersonFields = {
        rating: this.game.personGame.rating,
        final_score: this.game.personGame.final_score,
        replay_score: this.game.personGame.replay_score,
        finished_date: this.game.personGame.finished_date,
      };

      this.interfacePersonFields = {
        rating: this.game.personGame.rating,
        final_score: this.game.personGame.final_score,
        replay_score: this.game.personGame.replay_score,
        finished_date: this.game.personGame.finished_date,
      };
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  toggleTitleEdit() {
    this.titleEditMode = !this.titleEditMode;
  }

  anyFieldsChanged(): boolean {
    return Object.keys(this.changedGameFields).length > 0 || Object.keys(this.changedPersonFields).length > 0;
  }

  onFinishedFieldEdit() {
    this.interfacePersonFields.finished_date = !!this.finished ? new Date() : undefined;
    this.onFieldEdit();
  }

  onFieldEdit() {
    this.changedGameFields = this.getChangedFields();
    this.changedPersonFields = this.getChangedPersonFields();
  }

  getChangedFields() {
    return this.arrayService.getChangedFields(this.interfaceFields, this.originalFields);
  }

  getChangedPersonFields() {
    return this.arrayService.getChangedFields(this.interfacePersonFields, this.originalPersonFields);
  }

  getPlatformOptions(): string[] {
    return Object.keys(Platform);
  }

  getDisplayValueOf(platformOption: string): string {
    return Platform[platformOption];
  }

  updatePlatform(platform) {
    this.interfaceFields.platform = this.getDisplayValueOf(platform);
    this.onFieldEdit();
  }

  hasPerson(): boolean {
    return !!this.game.personGame;
  }

  async changeValues() {
    const allUpdates = [];

    if (Object.getOwnPropertyNames(this.changedPersonFields).length > 0) {
      allUpdates.push(this.doPersonUpdate(this.changedPersonFields));
    }

    if (Object.getOwnPropertyNames(this.changedGameFields).length > 0) {
      allUpdates.push(this.doGameUpdate(this.changedGameFields));
    }

    await Promise.all(allUpdates);
    this.activeModal.close('Update Click');
  }

  async doPersonUpdate(changedFields) {
    await this.gameService.updatePersonGame(this.game, changedFields);
    this.refreshPersonFields(changedFields);
  }

  async doGameUpdate(changedFields) {
    await this.gameService.updateGame(this.game, changedFields);
    this.refreshGameFields(changedFields);
  }

  refreshPersonFields(changedFields) {
    for (const key in changedFields) {
      if (changedFields.hasOwnProperty(key)) {
        const changedField = changedFields[key];
        this.game.personGame[key] = changedField;
        this.originalPersonFields[key] = changedField;
      }
    }
  }

  refreshGameFields(changedFields) {
    for (const key in changedFields) {
      if (changedFields.hasOwnProperty(key)) {
        const changedField = changedFields[key];
        this.game[key] = changedField;
        this.originalFields[key] = changedField;
      }
    }
  }

  async updateTitle() {
    const changedFields = {
      title: this.editedTitle
    }
    await this.gameService.updateGame(this.game, changedFields);
    this.titleEditMode = false;
  }
}
