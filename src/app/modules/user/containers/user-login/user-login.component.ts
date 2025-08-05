import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { GlobalClass } from '@app/core/classes/global.class';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { IProfile } from '@app/core/interfaces/IProfile';
import { trimWhiteSpace } from '@functions/validators.function';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
})
export class UserLoginComponent extends GlobalClass<IProfile> {
  redirectTo!: string;
  uri: string = 'UserAdministrator';
  accessLevelName: EMenuItem | null = null;

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.formData = null;
    this.formErrors = false;
    this.form = this.fb.group({
      email: ['', [trimWhiteSpace, Validators.required, Validators.email]],
      password: ['', [trimWhiteSpace, Validators.required]],
    });
  }

  handleSubmit(): void {
    this.formLoading = true;
    this.formErrors = false;
    
    console.log('Tentando fazer login...', this.form.value);
    
    this.httpService.post(`${this.uri}/Token`, this.form.value).subscribe(
      async ({ data }) => {
        console.log('Login bem-sucedido:', data);
        sessionStorage.clear();

        setTimeout(() => {
          this.authenticationService.setAuthentication(data, 'sessionUserApp');
          this.router.navigate(['user/home']);
          this.formLoading = false;
        }, 600);
      },
      (error) => {
        console.error('Erro no login:', error);
        this.formLoading = false;
        this.formErrors = true;
        
        // Melhor tratamento de erro
        if (error.status === 401) {
          console.error('Credenciais inválidas');
        } else if (error.status === 0) {
          console.error('Erro de conexão - possível problema de CORS ou SSL');
        } else {
          console.error('Erro desconhecido:', error.message);
        }
      }
    );
  }
}
