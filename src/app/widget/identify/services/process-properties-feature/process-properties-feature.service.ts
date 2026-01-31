import { Injectable } from '@angular/core';
import { ResultPairs } from '@app/widget/identify/interfaces/ResultPairs';
import { ResultIdentifyWMSQuery } from '@app/widget/identify/interfaces/ResultIdentifyQuery';
import { JSONObject, PropertyValue } from '../../interfaces/PropertyType';

/**
 * Servicio encargado de procesar los datos de la geometria identificada
 * Itera cada elemento del feature y determina el tipo de contenido
 * Identifica los elementos de tipo imagenes para agregarlos a una lista para renderizarlas posteriormente
 * @date 2025-12-03
 * @author Andres Fabian Simbaqueba
 */
@Injectable()
export class ProcessPropertiesFeatureService {
  resultArray: ResultPairs[] = []; //array de key-value-type
  resultImages: string[] = []; //array que contiene urls para render4izar imagenes

  /**
   * Procesa un featureResult y obtiene el primer feature
   * obtiene las propiedades del feature y para cada una determina el tipo de contenido
   * @param featureResult feature de la geometria identificada
   */
  convertObjectToArray(featureResult: ResultIdentifyWMSQuery | null) {
    if (featureResult && featureResult.features.length <= 1) {
      //obtiene el feature de la primera posicion
      const feature = featureResult.features[0];
      //itera el objeto para determinar el tipo
      Object.entries(feature.properties).map(([key, value]) => {
        this.getTypeOfProperty(key, value, this.resultArray);
      });
      //una vez procesado el objeto filtra los registros que son de tipo imagen
      this.resultImages = this.resultArray
        .filter(pair => pair.type === 'image')
        .map(pair => pair.value);
      // elimina los registros tipo image del array principal
      this.resultArray = this.resultArray.filter(pair => pair.type !== 'image');
    }
  }

  /**
   * Obtener el tipo de valor de la feature
   * @param value valor de la feature
   * @returns tipo de valor
   */
  getTypeOfFeature(
    value: string | number
  ): 'image' | 'href' | 'number' | 'text' | 'innerHTML' | 'url' {
    let typeValue: 'image' | 'href' | 'number' | 'text' | 'innerHTML' | 'url' =
      'text';
    // Expresión regular para detectar URLs http(s)
    const urlRegex = /^https?:\/\/[^\s]+$/;
    // Expresión regular para detectar formatos de imágenes
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|svg|webp|tiff|ico|apng)$/;
    // Expresión regular para detectar números decimales
    const numberRegex = /^-?\d+(\.\d+)?$/;
    const hrefRegex = /<a\s+[^>]*href\s*=\s*(https?:\/\/[^\s'">]+)[^>]*>/i;
    const otherHrefRegex =
      /<a\s+[^>]*href\s*=\s*['"]\s*(https?:\/\/[^\s'"]+)\s*['"][^>]*>/i;
    // Verificar si el valor es una URL o un formato de image u otro tipo de valor
    if (imageRegex.test(value.toString())) {
      typeValue = 'image';
    } else if (urlRegex.test(value.toString())) {
      typeValue = 'url';
    } else if (numberRegex.test(value.toString())) {
      typeValue = 'number';
    } else if (
      hrefRegex.test(value.toString()) ||
      otherHrefRegex.test(value.toString())
    ) {
      typeValue = 'href';
    } else {
      typeValue = 'text';
    }
    return typeValue;
  }

  /**
   * Determina el tipo de contenido de un elemento
   * si es de tipo array, itera el elemento y determina el tipo para cada uno de los elementos
   * @param key clave del elemento
   * @param property valor del elemento
   * @param resultPairList array de objetos clave,valor,tipo donde se va a almacenar la informacion procesada
   * @returns lista de objetosw procesados
   */
  getTypeOfProperty(
    key: string,
    property: PropertyValue,
    resultPairList: ResultPairs[]
  ): ResultPairs[] {
    // ---- Caso number ----
    if (typeof property === 'number') {
      resultPairList.push({
        key,
        value: property.toString(),
        type: this.getTypeOfFeature(property),
      });
      return resultPairList;
    }

    // ---- Caso string → puede ser JSON ----
    if (typeof property === 'string') {
      const parsedJson = this.tryParseJSON(property);

      // si el string contenía un JSON válido → procesar recursivamente
      if (parsedJson !== null) {
        this.processJsonObject(parsedJson, key, resultPairList);
        return resultPairList;
      }

      // texto normal
      resultPairList.push({
        key,
        value: property,
        type: this.getTypeOfFeature(property),
      });

      return resultPairList;
    }

    // ---- Caso array ----
    if (Array.isArray(property)) {
      property.forEach((item, index) => {
        this.getTypeOfProperty(`${key}[${index}]`, item, resultPairList);
      });
      return resultPairList;
    }

    // ---- Caso objeto JSON ----
    if (this.isJsonObject(property)) {
      Object.entries(property).forEach(([childKey, childValue]) => {
        this.getTypeOfProperty(
          `${key}.${childKey}`,
          childValue,
          resultPairList
        );
      });
    }

    return resultPairList;
  }

  /**
   * Intenta parsear un texto a JSON si cumple con las catacteristicas y condiciones de un JSON
   * @param text textp a formatear
   * @returns JSON parseado o null si no se puede parsear
   */
  private tryParseJSON(text: string): PropertyValue | null {
    try {
      const parsed = JSON.parse(text);
      if (this.isValidJsonValue(parsed)) {
        return parsed;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Valida si un valor es un JSON valido
   * @param value propiedad a evaluar
   * @returns objeto con tipo identificado, clave y valor
   */
  private isValidJsonValue(value: unknown): value is PropertyValue {
    if (typeof value === 'string' || typeof value === 'number') {
      return true;
    }

    if (Array.isArray(value)) {
      return value.every(v => this.isValidJsonValue(v));
    }

    if (typeof value === 'object' && value !== null) {
      return Object.values(value).every(v => this.isValidJsonValue(v));
    }

    return false;
  }

  /**
   * procesa un objeto JSON
   * Valida si es un texto, numero objeto JSON o JSONArray
   * @param value valor a ser procesado
   * @param parentKey clave padre
   * @param resultPairList lista para agregar el resultado
   */
  private processJsonObject(
    value: PropertyValue,
    parentKey: string,
    resultPairList: ResultPairs[]
  ): void {
    // Caso: objeto JSON
    if (this.isJsonObject(value)) {
      Object.entries(value).forEach(([childKey, childValue]) => {
        const composedKey = `${parentKey}.${childKey}`;
        this.getTypeOfProperty(composedKey, childValue, resultPairList);
      });
      return;
    }

    // Caso: array JSON
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const composedKey = `${parentKey}[${index}]`;
        this.getTypeOfProperty(composedKey, item, resultPairList);
      });
      return;
    }

    // Caso: string o number
    if (typeof value === 'string' || typeof value === 'number') {
      resultPairList.push({
        key: parentKey,
        value: value.toString(),
        type: this.getTypeOfFeature(value),
      });
    }
  }

  /**
   * Valida si un valor es un objeto tipo JSON
   * @param value valor a validar
   * @returns objeto JSON si cumple con las carcacteriticas de un objeto
   */
  private isJsonObject(value: PropertyValue): value is JSONObject {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
  }
}
