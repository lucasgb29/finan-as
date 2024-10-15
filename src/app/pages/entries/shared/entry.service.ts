import { Injectable, Injector } from '@angular/core';
import { Observable, of } from "rxjs"; // Certifique-se de importar "of" aqui
import { flatMap, catchError } from "rxjs/operators";

import { BaseResourceService } from "../../../shared/services/base-resource.service";
import { CategoryService } from "../../categories/shared/category.service";
import { Entry } from "./entry.model";

import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  constructor(protected injector: Injector, private categoryService: CategoryService) {
    super("api/entries", injector, Entry.fromJson);
  }

  create(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer(entry, super.create.bind(this));
  }

  update(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer(entry, super.update.bind(this));
  }

  getByMonthAndYear(month: string, year: string): Observable<Entry[]> {
    return this.getAll().pipe(
      flatMap(entries => this.filterByMonthAndYear(entries, month, year))
    );
  }

  private setCategoryAndSendToServer(entry: Entry, sendFn: any): Observable<Entry> {
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;
        return sendFn(entry);
      }),
      catchError(this.handleError)
    );
  }

  // Corrigido: Retornar um Observable com o array filtrado usando "of"
  private filterByMonthAndYear(entries: Entry[], month: string, year: string): Observable<Entry[]> {
    const filteredEntries = entries.filter(entry => {
      const entryDate = moment(entry.date, "DD/MM/YYYY");
      const monthMatches = entryDate.month() + 1 === Number(month);
      const yearMatches = entryDate.year() === Number(year);
      return monthMatches && yearMatches;
    });

    return of(filteredEntries); // Retorna o array filtrado como um Observable
  }
}
