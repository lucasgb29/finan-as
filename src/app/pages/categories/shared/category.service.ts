import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Category } from './category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiPath = 'api/categories';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Category[]> {
    return this.http.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategories)  // Corrigido para plural
    );
  }

  getById(id: number): Observable<Category> {
    const url = `${this.apiPath}/${id}`;
    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategorySingle)  // Mapeia para uma categoria
    );
  }

  private jsonDataToCategorySingle(jsonData: any): Category {
    return new Category(jsonData.id, jsonData.name, jsonData.description);
  }

  create(category: Category): Observable<Category> {
    return this.http.post(this.apiPath, category).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategorySingle)  // Retorna uma única categoria
    );
  }

  update(category: Category): Observable<Category> {
    const url = `${this.apiPath}/${category.id}`;

    return this.http.patch(url, category).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategorySingle)  // Atualiza e mapeia a resposta da API
    );
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    );
  }

  private jsonDataToCategories(jsonData: any[]): Category[] {
    const categories: Category[] = [];
    if (Array.isArray(jsonData)) {
      jsonData.forEach(element => {
        const category = new Category(element.id, element.name, element.description);
        categories.push(category);
      });
    }
    return categories;
  }

  private handleError(error: any): Observable<any> {
    console.error('Erro na requisição:', error);
    if (error.error instanceof ErrorEvent) {
      console.error('Erro no lado do cliente:', error.error.message);
    } else {
      console.error(`Erro no servidor: ${error.status}\nMensagem: ${error.message}`);
    }
    return throwError(error);
  }
}
