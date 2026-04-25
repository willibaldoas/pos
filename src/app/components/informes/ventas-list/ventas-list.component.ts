import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventas-list.component.html',
  styleUrls: ['./ventas-list.component.css']
})
export class VentasListComponent {

  @Input() ventas: any[] = [];

  ventaAbierta: number | null = null;

  toggle(i: number) {
    this.ventaAbierta = this.ventaAbierta === i ? null : i;
  }
}