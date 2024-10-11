import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'

import { Observable, throwError} from 'rxjs';
import { map, catchError, flatMap } from 'rxjs/operators';

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
      map(this.jsonDataToCategory)
    );
  }

  getById(id: number): Observable<Category> {
    const url = `${this.apiPath}/${id}`;
    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategorySingle) // Alteração para um método específico
    );
  }

  private jsonDataToCategorySingle(jsonData: any): Category {
    return new Category(jsonData.id, jsonData.name, jsonData.description);
  }


  create(category: Category): Observable<Category> {
    return this.http.post(this.apiPath, category).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategorySingle) // Aqui também, retorna uma única categoria
    );
  }


  update(category: Category): Observable<Category> {
    const url = `${this.apiPath}/${category.id}`;

    return this.http.patch(url, category).pipe(
      catchError(this.handleError),
      map(() => category)
    );
  }


  delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    );
  }



  private jsonDataToCategory(jsonData: any[]): Category[] {
    const categories: Category[] = [];
    jsonData.forEach(element => {
      const category = new Category(element.id, element.name, element.description);
      categories.push(category);
    });
    return categories;
  }

  private handleError(error: any): Observable<any> {
    console.log('ERRO NA REQUISIÇÃO =>', error);
    return throwError(error);
  }


}


