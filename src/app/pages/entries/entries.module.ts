import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { EntriesRoutingModule } from './entries-routing.module';

import { EntryListComponent } from './entry-list/entry-list.component';
import { EntryFormComponent } from './entry-form/entry-form.component';

import {CalendarModule  } from 'primeng/calendar';

@NgModule({
  declarations: [EntryListComponent, EntryFormComponent],
  imports: [
    CommonModule,
    EntriesRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class EntriesModule { }
