'use strict';

const { parseType } = require('@strapi/utils');
const _ = require('lodash/fp');
const dateFns = require('date-fns');
const { InvalidTimeError, InvalidDateError, InvalidDateTimeError } = require('./errors');

class Field {
  constructor(config) {
    this.config = config;
  }

  toDB(value) {
    return value;
  }

  fromDB(value) {
    return value;
  }
}

class StringField extends Field {
  toDB(value) {
    return _.toString(value);
  }

  fromDB(value) {
    return _.toString(value);
  }
}

class JSONField extends Field {
  toDB(value) {
    return JSON.stringify(value);
  }

  fromDB(value) {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  }
}

class BooleanField extends Field {
  toDB(value) {
    if (typeof value === 'boolean') return value;

    if (['true', 't', '1', 1].includes(value)) {
      return true;
    }

    if (['false', 'f', '0', 0].includes(value)) {
      return false;
    }

    return Boolean(value);
  }

  fromDB(value) {
    if (typeof value === 'boolean') {
      return value;
    }

    const strVal = _.toString(value);

    if (strVal === '1') {
      return true;
    } else if (strVal === '0') {
      return false;
    } else {
      return null;
    }
  }
}

class NumberField extends Field {
  toDB(value) {
    const numberValue = _.toNumber(value);

    if (Number.isNaN(numberValue)) {
      throw new Error(`Expected a valid Number, got ${value}`);
    }

    return numberValue;
  }

  fromDB(value) {
    return _.toNumber(value);
  }
}

class BigIntegerField extends NumberField {
  toDB(value) {
    return _.toString(value);
  }

  fromDB(value) {
    return _.toString(value);
  }
}

class DateField extends Field {
  toDB(value) {
    try {
      return parseType({ type: 'date', value });
    } catch (err) {
      throw new InvalidDateError(err.message);
    }
  }

  fromDB(value) {
    const cast = new Date(value);
    return dateFns.isValid(cast) ? dateFns.formatISO(cast, { representation: 'date' }) : null;
  }
}
class DatetimeField extends Field {
  toDB(value) {
    try {
      return parseType({ type: 'datetime', value });
    } catch (err) {
      throw new InvalidDateTimeError(err.message);
    }
  }

  fromDB(value) {
    const cast = new Date(value);
    return dateFns.isValid(cast) ? cast.toISOString() : null;
  }
}

class TimeField extends Field {
  toDB(value) {
    try {
      return parseType({ type: 'time', value });
    } catch (err) {
      throw new InvalidTimeError(err.message);
    }
  }

  fromDB(value) {
    // make sure that's a string with valid format ?
    return value;
  }
}
class TimestampField extends Field {
  toDB(value) {
    try {
      return parseType({ type: 'datetime', value });
    } catch (err) {
      throw new InvalidDateTimeError(err.message);
    }
  }

  fromDB(value) {
    const cast = new Date(value);
    return dateFns.isValid(cast) ? dateFns.format(cast, 'T') : null;
  }
}

const typeToFieldMap = {
  increments: Field,
  password: StringField,
  email: StringField,
  string: StringField,
  uid: StringField,
  richtext: StringField,
  text: StringField,
  enumeration: StringField,
  json: JSONField,
  biginteger: BigIntegerField,
  integer: NumberField,
  float: NumberField,
  decimal: NumberField,
  date: DateField,
  time: TimeField,
  datetime: DatetimeField,
  timestamp: TimestampField,
  boolean: BooleanField,
};

const createField = attribute => {
  const { type } = attribute;

  if (_.has(type, typeToFieldMap)) {
    return new typeToFieldMap[type]({});
  }

  throw new Error(`Undefined field for type ${type}`);
};

module.exports = {
  createField,
};
