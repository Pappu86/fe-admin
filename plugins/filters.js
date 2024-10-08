import Vue from 'vue';
import { format } from 'date-fns';
import { capitalize } from '@/util';

export function ucwords(val) {
  const str = val.split('_').join(' ');
  return capitalize(str);
}

export function avatar(name) {
  let TextAvatar = '';
  const array = name.split(' ');
  array.forEach((item) => {
    TextAvatar += item.substring(0, 1);
  });
  return TextAvatar;
}

export function toDayDateTimeString(value) {
  if (value) {
    return format(new Date(value), 'E, MMM dd, yyyy - hh:mm:ss a');
  } else {
    return null;
  }
}

export function toTimeString(value) {
  if (value) {
    return format(new Date(value), 'hh:mm:ss a');
  } else {
    return null;
  }
}

export function toFormattedDateString(value) {
  return format(new Date(value), 'dd MMM, yyyy');
}

export function toDateTimeString(value) {
  if (value) {
    return new Date(value).toLocaleString();
  } else {
    return null;
  }
}

const filters = {
  ucwords,
  toDayDateTimeString,
  toFormattedDateString,
  toDateTimeString,
  toTimeString,
  avatar,
};
export default filters;

Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});
