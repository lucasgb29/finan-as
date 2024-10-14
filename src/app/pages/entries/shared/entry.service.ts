import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Entry } from './entry.model';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  private apiPath = 'api/entries';

  constructor(private http: HttpClient) { }

  // Método para obter todas as entradas
  getAll(): Observable<Entry[]> {
    return this.http.get<Entry[]>(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntries)  // Corrigido o nome da função para plural
    );
  }

  // Método para obter uma entrada específica pelo ID
  getById(id: number): Observable<Entry> {
    const url = `${this.apiPath}/${id}`;
    return this.http.get<Entry>(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntrySingle)  // Mapeia a resposta da API para uma entrada
    );
  }

  // Método para criar uma nova entrada
  create(entry: Entry): Observable<Entry> {
    return this.http.post<Entry>(this.apiPath, entry).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntrySingle)  // Retorna uma única entrada criada
    );
  }

  // Método para atualizar uma entrada existente
  update(entry: Entry): Observable<Entry> {
    const url = `${this.apiPath}/${entry.id}`;
    return this.http.patch<Entry>(url, entry).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntrySingle)  // Atualiza e mapeia a resposta da API
    );
  }

  // Método para deletar uma entrada
  delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)  // Retorna null ao concluir a exclusão
    );
  }

  // Converte JSON de múltiplas entradas para um array de objetos Entry
  private jsonDataToEntries(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];

    jsonData.forEach(element => {
      const entry = Object.assign(new Entry(), element);
        entries.push(entry);
      });

    return entries;
  }

  // Converte JSON de uma única entrada para um objeto Entry
  private jsonDataToEntrySingle(jsonData: any): Entry {
    return new Entry(
      jsonData.id,
      jsonData.name,
      jsonData.description,
      jsonData.type,  // Inclua mais propriedades conforme necessário
      jsonData.amount,
      jsonData.category,
      jsonData.paid,
      jsonData.date
    );
  }

  // Tratamento de erro para requisições HTTP
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
