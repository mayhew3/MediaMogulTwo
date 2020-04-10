import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {BrowseGamesComponent} from './components/browse-games/browse-games.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'browse', component: BrowseGamesComponent}
];

@NgModule({
  declarations: [],
  imports: [[RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })]],
  exports: [RouterModule]
})
export class AppRoutingModule { }
