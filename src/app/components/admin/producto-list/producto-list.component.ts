import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-list.component.html',
  styleUrls: ['./producto-list.component.css']
})
export class ProductoListComponent {

  @Input() productos: any[] = [];
  @Input() modo: 'ver' | 'inventario' = 'ver';

  @Output() editar = new EventEmitter<any>();
  @Output() eliminar = new EventEmitter<any>();
  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() cambiarStock = new EventEmitter<{p:any, cantidad:number}>();
  @Output() aplicarCantidad = new EventEmitter<{p:any, cantidad:number}>();

  busqueda = '';
  productosFiltrados: any[] = [];

  editando: number | null = null;
  backup: any = null;

  ngOnInit() {
    this.productosFiltrados = [...this.productos];
  }

  filtrar() {
    const texto = this.busqueda.toLowerCase();

    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.precio.toString().includes(texto)
    );
  }

  iniciarEdicion(p: any) {
    this.editando = p.id;
    this.backup = JSON.parse(JSON.stringify(p));
    this.editar.emit(p);
  }

  cancelarEdicion(p: any) {
    Object.assign(p, this.backup);
    this.editando = null;
    this.cancelar.emit();
  }

  guardarEdicion() {
    this.editando = null;
    this.guardar.emit();
  }

}