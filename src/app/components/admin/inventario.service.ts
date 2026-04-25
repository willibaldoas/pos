import { Injectable } from '@angular/core';
import { Producto } from './producto.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {

  private key = 'inventario';

  get(): Producto[] {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }

  save(data: Producto[]) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  agregar(producto: Producto) {
    const data = this.get();
    data.push(producto);
    this.save(data);
  }

  eliminar(id: number) {
    const data = this.get().filter(p => p.id !== id);
    this.save(data);
  }

  actualizar(producto: Producto) {
    const data = this.get().map(p =>
      p.id === producto.id ? producto : p
    );
    this.save(data);
  }

  cambiarStock(id: number, cantidad: number) {
    const data = this.get();

    const producto = data.find(p => p.id === id);
    if (!producto || producto.ilimitado) return;

    const nuevoStock = producto.stock + cantidad;

    if (nuevoStock < 0) {
      throw new Error('Stock negativo');
    }

    producto.stock = nuevoStock;

    this.save(data);
  }
}