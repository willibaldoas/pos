import { Routes } from '@angular/router';
import { Admin } from '../app/components/admin/admin.component';
import { CajeroComponent } from '../app/components/cajero/cajero.component';
import { Informes } from './components/informes/informes';

export const routes: Routes = [
  { path: 'admin', component: Admin },
  { path: 'cajero', component: CajeroComponent },
  { path: 'informes',component: Informes},
  { path: '', redirectTo: 'cajero', pathMatch: 'full' }
];