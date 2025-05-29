import Swal, { SweetAlertResult } from 'sweetalert2';

export class AlertMessages {
  static success(
    message: string,
    toast = true,
    timer: number = 2000,
    showConfirmButton: boolean = true
  ) {
    Swal.fire({
      icon: 'success',
      title: 'Sucesso',
      text: message,
      timer: timer,
      timerProgressBar: true,
      toast,
      showConfirmButton: showConfirmButton,
      position: 'top-end',
    });
  }

  static error(
    messages: Array<string> | string,
    toast = true,
    timer = 0,
    callback?: (result: SweetAlertResult) => void
  ) {
    Swal.fire({
      icon: 'error',
      iconHtml: '',
      position: 'top-end',
      timerProgressBar: true,
      timer,
      toast,
      title: 'Ocorreu um erro',
      html: `<p>${
        messages || 'Ocorreu um erro, verifique sua conexão e tente novamente.'
      }</p>`,
      showConfirmButton: timer ? false : true,
    }).then((res) => {
      callback;
    });
  }
}
