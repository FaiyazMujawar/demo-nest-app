import JSZip from 'jszip';
import 'reflect-metadata';

import * as XLSX from 'xlsx';

import { Blob } from 'buffer';
import { Schema } from 'write-excel-file';
import writeXlsxFile from 'write-excel-file/node';
(globalThis as any).Blob = Blob;
JSZip.support.blob = true;

import {
  isDate,
  isEmpty,
  isNaN,
  isNil,
  isNumber,
  isString,
  keys,
} from 'lodash';
import { Class } from '../../../types';
import { XlsxConfig } from '../../../uploads/types';
import {
  XLSX_COLUMN_KEY,
  XlsxColumnOptions,
  XlsxColumnType,
} from '../decorators/xlsxcolumn.decorator';

const { STRING, INT, REAL, DATE } = XlsxColumnType;

const FORMATS = {
  [INT]: Number,
  [REAL]: Number,
  [STRING]: String,
  [DATE]: Date,
};

export function extractConfig<T>(_class: Class<T>): XlsxConfig {
  const _object = new _class();
  const config: XlsxConfig = {};
  Object.entries(_object).forEach(({ '0': property }) => {
    const columnOptions: XlsxColumnOptions = Reflect.getMetadata(
      XLSX_COLUMN_KEY,
      _class.prototype,
      property,
    );
    if (!isEmpty(columnOptions)) {
      config[property] = columnOptions;
    }
  });
  return config;
}

export async function generateXlsx<T>(type: Class<T>, filepath: string) {
  await writeToXlsx([], type, filepath);
}

export async function parse<T>(data: Buffer, type: Class<T>): Promise<T[]> {
  const workbook = XLSX.read(data, { cellDates: true, type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, {}) as any[];
  return json.map((d) => transform(d, type));
}

// ########################## Helper functions ###################################

async function writeToXlsx<T>(data: T[], type: Class<T>, filepath: string) {
  const config = extractConfig(type);
  const schema: Schema<Object>[] = Object.keys(new type()).map((property) => {
    const columnConfig = config[property];
    return {
      column: columnConfig.name,
      type: FORMATS[columnConfig.type],
      format: columnConfig.type.toString(),
      value: (value: unknown) => value[property],
      width: columnConfig.name.length + 10,
    } as object as Schema<object>;
  });

  await writeXlsxFile(data, {
    schema,
    headerStyle: {
      fontWeight: 'bold',
      align: 'center',
      alignVertical: 'center',
      fontSize: 12,
      height: 16,
      backgroundColor: '#ffbe0b',
      borderStyle: 'thick',
      borderColor: '#000000',
    },
    filePath: filepath,
    sheet: type.name,
  });
}

function transform<T>(data: any, type: Class<T>): T {
  const config = extractConfig(type);
  const __object = new type();
  keys(config).forEach((property) => {
    let value = data[config[property].name];
    value = isNil(config[property].transform)
      ? EXTRACTORS[config[property].type](value)
      : config[property].transform(value);
    Reflect.set(__object as object, property, value);
  });
  return __object;
}

const EXTRACTORS = {
  [INT]: (value: any) => (isNaN(value) ? undefined : parseInt(value)),
  [REAL]: (value: any) => (isNaN(value) ? undefined : parseFloat(value)),
  [STRING]: (value: any) =>
    isNil(value) ? undefined : (value as string).trim(),
  [DATE]: (value: any) => {
    let date: Date | undefined = undefined;
    if (isNumber(value) || isString(value)) {
      date = new Date(value);
    }
    if (isDate(value)) date = value;
    if (!isNil(date)) {
      const localDate = date
        .toLocaleDateString()
        .split('/')
        .reverse()
        .join('-');
      date = new Date(localDate);
    }
    return date;
  },
};
