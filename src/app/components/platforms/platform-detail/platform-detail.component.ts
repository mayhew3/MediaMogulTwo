import {Component, Input, OnInit} from '@angular/core';
import {GamePlatform} from '../../../interfaces/Model/GamePlatform';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {PlatformService} from '../../../services/platform.service';

@Component({
  selector: 'mm-platform-detail',
  templateUrl: './platform-detail.component.html',
  styleUrls: ['./platform-detail.component.scss']
})
export class PlatformDetailComponent implements OnInit {
  @Input() platform: GamePlatform;

  full_name: string;
  short_name: string;
  metacritic_uri: string;

  constructor(private activeModal: NgbActiveModal,
              private platformService: PlatformService) { }

  close(): void {
    this.platformService.updatePlatform(this.platform, this.full_name, this.short_name, this.metacritic_uri);
    this.activeModal.close();
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  ngOnInit(): void {
    this.full_name = this.platform.platform_name;
    this.short_name = this.platform.data.short_name;
    this.metacritic_uri = this.platform.data.metacritic_uri;
  }
}
