import moment from 'moment';

// Converte uma data em segundos
export const dateToSeconds = (
  date: null | string,
  toEndDate: boolean = false
): number | null => {
  if (typeof date === 'string' && date) {
    const format = 'YYYY-MM-DD HH:mm:ss';
    const formattedDate = toEndDate ? `${date} 23:59:59` : `${date} 00:00:00`;
    return moment(formattedDate, format).unix();
  }
  return null;
};

// Converte segundos em uma string de data formatada
export const dateToString = (
  date: null | number,
  isHours = false
): null | string => {
  if (date !== null) {
    const format = isHours ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
    return moment.unix(date).format(format);
  }
  return null;
};

export const dateNowToMillisecond = (): number => Number(+new Date());
export const dateNowToSeconds = (): number =>
  Number((+new Date() / 1000).toFixed(0));
