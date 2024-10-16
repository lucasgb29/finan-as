import { EntryService } from './../shared/entry.service';
import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Entry } from '../shared/entry.model';

import { switchMap } from 'rxjs/operators';

import toastr from 'toastr';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm = false;
  entry: Entry = new Entry();

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.entryForm.valid) {  // Verifica se o formulário é válido
      if (this.currentAction === 'new') {
        this.createEntry();
      } else {
        this.updateEntry();
      }
    } else {
      this.submittingForm = false;  // Se o formulário estiver inválido, não permite submissão
    }
  }

  private setCurrentAction() {
    if (this.route.snapshot.url.length > 0 && this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],  
      date: [null, [Validators.required]],
      paid: [false, [Validators.required]],
      categoryId: [null, Validators.required]
    });
  }

  private loadEntry() {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get('id')))
      ).subscribe(
        (entry) => {
          this.entry = entry;
          this.entryForm.patchValue(entry); // Preenche o formulário com os dados carregados
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      );
    }
  }

  private setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastrar novo lançamento';
    } else {
      const entryName = this.entry.name || '';
      this.pageTitle = `Editando lançamento: ${entryName}`;
    }
  }

  private createEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry)
      .subscribe(
        entry => this.actionsForSuccess(entry),
        error => this.actionsForError(error)
      );
  }

  private updateEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.update(entry)
      .subscribe(
        entry => this.actionsForSuccess(entry),
        error => this.actionsForError(error)
      );
  }

  private actionsForSuccess(entry: Entry) {
    toastr.success('Seu lançamento foi salvo com sucesso!');
    this.router.navigateByUrl('/entries', { skipLocationChange: true }).then(
      () => this.router.navigate(['/entries', entry.id, 'edit'])
    );
  }

  private actionsForError(error) {
    toastr.error('Ocorreu um erro ao salvar o lançamento!');

    this.submittingForm = false;

    if (error.status === 422 && error.error.errors) {
      this.serverErrorMessages = error.error.errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tente mais tarde.'];
    }
  }
}
