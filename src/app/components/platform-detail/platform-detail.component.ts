import {Component, Input, OnInit} from '@angular/core';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {GameService} from '../../services/game.service';

@Component({
  selector: 'mm-platform-detail',
  templateUrl: './platform-detail.component.html',
  styleUrls: ['./platform-detail.component.scss']
})
export class PlatformDetailComponent implements OnInit {
  @Input() platform: GamePlatform;

  constructor(private activeModal: NgbActiveModal,
              private gameService: GameService) { }

  ngOnInit(): void {
  }

  async close() {
    this.activeModal.close();
  }

  dismiss() {
    this.platform.discardChanges();
    this.activeModal.dismiss();
  }
}
