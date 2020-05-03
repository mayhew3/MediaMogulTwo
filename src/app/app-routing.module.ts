import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {BrowseGamesComponent} from './components/browse-games/browse-games.component';
import {ProfileComponent} from './components/profile/profile.component';
import {AuthGuard} from './services/auth/auth.guard';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {InterceptorService} from './services/interceptor.service';
import {SearchComponent} from './components/search/search.component';
import {PlatformListComponent} from './components/platform-list/platform-list.component';
import {MyPlatformsComponent} from './components/my-platforms/my-platforms.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'browse',
    component: BrowseGamesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'platforms',
    component: PlatformListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'myPlatforms',
    component: MyPlatformsComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  declarations: [],
  imports: [[RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })]],
  exports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    }
  ],
})
export class AppRoutingModule { }
