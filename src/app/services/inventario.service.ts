import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InventarioService {

  private key = 'inventario';

  get() {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }

  save(data: any[]) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  add(producto: any) {
    const data = this.get();
    data.push(producto);
    this.save(data);
  }

  update(index: number, producto: any) {
    const data = this.get();
    data[index] = producto;
    this.save(data);
  }

  findByName(nombre: string) {
    return this.get().find((p: any) => p.nombre === nombre);
  }
}