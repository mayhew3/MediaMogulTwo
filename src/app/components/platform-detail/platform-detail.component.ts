import {Component, Input, OnInit} from '@angular/core';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {PlatformService} from '../../services/platform.service';

@Component({
  selector: 'mm-platform-detail',
  templateUrl: './platform-detail.component.html',
  styleUrls: ['./platform-detail.component.scss']
})
export class PlatformDetailComponent {
  @Input() platform: GamePlatform;

  constructor(private activeModal: NgbActiveModal,
              private platformService: PlatformService) { }

  async close() {
    await this.platformService.updatePlatform(this.platform);
    this.activeModal.close();
  }

  dismiss() {
    this.platform.discardChanges();
    this.activeModal.dismiss();
  }
}
