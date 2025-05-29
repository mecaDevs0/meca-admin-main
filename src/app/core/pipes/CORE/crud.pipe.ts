import { Pipe, PipeTransform } from '@angular/core';
import { EFunctionalities } from '@app/core/interfaces/CORE/IAsideMenuConfig';

@Pipe({
  name: 'crudPipe',
})
export class CrudPipe implements PipeTransform {
  transform(value: EFunctionalities): string {
    if (value === EFunctionalities.delete) {
      return 'Excluir';
    }

    if (value === EFunctionalities.write) {
      return 'Cadastrar';
    }

    if (value === EFunctionalities.edit) {
      return 'Editar';
    }

    if (value === EFunctionalities.enableDisable) {
      return 'Ativar/inativar';
    }

    if (value === EFunctionalities.export) {
      return 'Exportar';
    }

    return 'Ação desconhecida'; // Valor padrão
  }
}
