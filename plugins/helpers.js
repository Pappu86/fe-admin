import Vue from 'vue'
import { format } from 'date-fns';

if (!Vue.__my_mixin__) {
  Vue.__my_mixin__ = true
  Vue.mixin({
    methods: {
      /**
       *
       * @param {*} str
       * @returns "Hello World" // truncate str
       */
      shorten(str, length, delim, appendix) {
        if (str.length <= length) return str;

        let trimmedStr = str.substr(0, length + delim.length);

        const lastDelimIndex = trimmedStr.lastIndexOf(delim);
        if (lastDelimIndex >= 0) trimmedStr = trimmedStr.substr(0, lastDelimIndex);

        if (trimmedStr) trimmedStr += appendix;
        return trimmedStr;
      },

      /**
       *
       * @param {*} dateTime
       * @returns 08:00 AM
       */
      getDayTimeFormat(dadateTimete) {
        if (!dadateTimete) dadateTimete = new Date()
        return format(new Date(dadateTimete), 'E, MMMM do, yyyy hh:mm a');
      },
    },
  })
}
