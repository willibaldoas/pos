import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styleUrls: ['./producto-form.component.css'],
  templateUrl: './producto-form.component.html'
})
export class ProductoFormComponent {

  nombre = '';
  precio: number = 0;
  costo: number = 0;
  stock: number = 0;
  ilimitado = false;

  @Output() crear = new EventEmitter<any>();

  agregarProducto() {

    if (!this.nombre || !this.precio) {
      alert('Completa los datos');
      return;
    }

    this.crear.emit({
      id: Date.now(),
      nombre: this.nombre,
      precio: this.precio,
      costo: this.costo,
      stock: this.ilimitado ? 0 : this.stock,
      ilimitado: this.ilimitado
    });

    // limpiar
    this.nombre = '';
    this.precio = 0;
    this.costo = 0;
    this.stock = 0;
    this.ilimitado = false;
  }
  
}