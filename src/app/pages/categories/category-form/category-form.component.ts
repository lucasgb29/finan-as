import { CategoryService } from './../shared/category.service';
import { Component, OnInit, AfterContentChecked } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../shared/category.model';


import { switchMap } from 'rxjs/operators';

import toastr from 'toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm = false;
  category: Category = new Category( 0, '', '' );

  constructor(
    private CategoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  )

    {


  }

  ngOnInit() {

    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction === 'new') {
      this.createCategory();
    }
    else { // edit
      this.updateCategory();
    }
  }

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      description: [null]
    });
  }

  private loadCategory() {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.CategoryService.getById(+params.get('id')))
      ).subscribe(
        (category) => {
          this.category = category;
          this.categoryForm.patchValue(category); // binds loaded category data to categoryForm
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      );
    }
  }


  private setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastrar nova categoria';
    } else {
      const categoryName = this.category.name || '';
      this.pageTitle = `Editando categoria: ${this.category.name}`;
    }
  }


  private createCategory() {
    const category: Category = Object.assign(new Category(  0, '', ''), this.categoryForm.value);

    this.CategoryService.create(category)
      .subscribe(
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      )

  }

  private updateCategory() {
  }

  private actionsForSuccess(category: Category) {

    toastr.success('Sua categoria foi salva com sucesso!');
    this.router.navigateByUrl('/categories', {skipLocationChange: true}).then(

      () => this.router.navigate(['/categories', category.id, 'edit'])
    )
  }

  private actionsForError(error) {
    toastr.error('Ocorreu um erro ao salvar a sua categoria!');

    this.submittingForm = false;

    if (error.status === 422) {
    this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tente mais tarde.'];
    }
  }

}
