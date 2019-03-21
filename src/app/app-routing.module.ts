import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' ,},
  { path: 'phone-modal', loadChildren: './phone-modal/phone-modal.module#PhoneModalPageModule' },
  { path: 'message-modal', loadChildren: './message-modal/message-modal.module#MessageModalPageModule' },
  { path: 'feedback-modal', loadChildren: './feedback-modal/feedback-modal.module#FeedbackModalPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
