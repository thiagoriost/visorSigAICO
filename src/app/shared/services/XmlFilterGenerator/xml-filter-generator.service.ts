import { Injectable } from '@angular/core';

/**
 * Servicio para generar filtros XML compatibles con OGC a partir de expresiones lógicas.
 * Permite transformar expresiones tipo "A = 'valor' And B > 3 Or C < 5" en estructuras XML usadas por WFS.
 * @author Heidy Paola Lopez Sanchez
 */
@Injectable()
export class XmlFilterGeneratorService {
  /**
   * Genera una cadena XML <Filter>...<Filter> desde una expresión lógica.
   * @param expresion - Cadena con expresión lógica (ej. "A = 'valor' And B > 3")
   * @returns Cadena XML con el filtro.
   */
  generarFiltroDesdeExpresion(expresion: string): string {
    // Elimina espacios innecesarios
    const expresionLimpia = expresion.replace(/\s+/g, ' ').trim();

    // Si la expresión está vacía, retorna un filtro vacío
    if (!expresionLimpia) return '<Filter></Filter>';

    // Convierte la expresión a un filtro XML
    const filtro = this.convertirExpresionCompuesta(expresionLimpia);
    return `<Filter>\n${filtro}\n</Filter>`;
  }

  /**
   * Genera un filtro XML y lo codifica para uso en URLs (por ejemplo, en peticiones WFS GET).
   * @param expresion - Cadena con expresión lógica.
   * @returns Filtro XML codificado.
   */
  generarFiltroParaUrl(expresion: string): string {
    const xml = this.generarFiltroDesdeExpresion(expresion);
    return encodeURIComponent(xml);
  }

  /**
   * Convierte una expresión compuesta a XML, manejando primero OR y luego AND por jerarquía lógica.
   * @param expr - Expresión a convertir.
   * @returns Fragmento XML con operadores OR/AND anidados correctamente.
   */
  private convertirExpresionCompuesta(expr: string): string {
    // Separa por OR si existe más de una subexpresión con este operador
    const partesOr = this.separarExpresion(expr, 'Or');
    if (partesOr.length > 1) {
      const filtros = partesOr
        .map(p => this.convertirExpresionCompuesta(p.trim()))
        .join('\n');
      return `<Or>\n${filtros}\n</Or>`;
    }

    // Separa por AND si existe más de una subexpresión con este operador
    const partesAnd = this.separarExpresion(expr, 'And');
    if (partesAnd.length > 1) {
      const filtros = partesAnd
        .map(p => this.convertirExpresionCompuesta(p.trim()))
        .join('\n');
      return `<And>\n${filtros}\n</And>`;
    }

    // Si no hay operadores compuestos, convierte la expresión básica
    return this.convertirExpresionAFilter(expr.trim());
  }

  /**
   * Separa la expresión lógica por el operador indicado (AND u OR), sin romper subexpresiones entre paréntesis.
   * @param expr - Expresión completa.
   * @param operador - Operador lógico a buscar ('And' | 'Or').
   * @returns Arreglo de subexpresiones separadas.
   */
  private separarExpresion(expr: string, operador: 'And' | 'Or'): string[] {
    const partes: string[] = [];
    let buffer = '';
    let profundidad = 0;
    const tokens = expr.split(' ');

    for (const token of tokens) {
      // Aumenta o disminuye la profundidad según los paréntesis
      if (token.includes('(')) profundidad += (token.match(/\(/g) || []).length;
      if (token.includes(')')) profundidad -= (token.match(/\)/g) || []).length;

      // Si encuentra el operador fuera de paréntesis, separa
      if (token === operador && profundidad === 0) {
        partes.push(buffer.trim());
        buffer = '';
      } else {
        buffer += (buffer ? ' ' : '') + token;
      }
    }

    // Agrega la última parte
    if (buffer.trim()) partes.push(buffer.trim());
    return partes;
  }

  /**
   * Convierte una expresión simple como "A = 'valor'" a su equivalente en XML.
   * @param expr - Expresión simple.
   * @returns Fragmento XML correspondiente.
   */
  private convertirExpresionAFilter(expr: string): string {
    const regex =
      /^([\w.]+)\s*(=|<>|>|<|>=|<=|Like|Not|Is|Null)\s*(?:'([^']*)'|(\d+(\.\d+)?))?$/i;
    const match = expr.match(regex);

    // Si la expresión no coincide con el patrón esperado, muestra advertencia
    if (!match) {
      console.warn('Expresión inválida:', expr);
      return '';
    }

    const [, atributo, operador] = match;
    const operadorXml = this.getXmlOperator(operador);
    const valor = match[3] !== undefined ? match[3] : match[4];

    // Casos especiales: Null o Is
    if (['Null', 'Is'].includes(operador)) {
      return `<${operadorXml}><PropertyName>${atributo}</PropertyName></${operadorXml}>`;
    }

    // Caso especial: operador Not que encapsula otra condición
    if (operador === 'Not') {
      return `<${operadorXml}>
  <PropertyIsEqualTo>
    <PropertyName>${atributo}</PropertyName>
    <Literal>${valor}</Literal>
  </PropertyIsEqualTo>
</${operadorXml}>`;
    }

    // Caso general: operador binario simple
    return `<${operadorXml}>
  <PropertyName>${atributo}</PropertyName>
  <Literal>${valor}</Literal>
</${operadorXml}>`;
  }

  /**
   * Mapea un operador lógico a su equivalente XML OGC.
   * @param op - Operador lógico como texto.
   * @returns Nombre del operador XML OGC.
   */
  private getXmlOperator(op: string): string {
    const map: Record<string, string> = {
      '=': 'PropertyIsEqualTo',
      '<>': 'PropertyIsNotEqualTo',
      '>': 'PropertyIsGreaterThan',
      '<': 'PropertyIsLessThan',
      '>=': 'PropertyIsGreaterThanOrEqualTo',
      '<=': 'PropertyIsLessThanOrEqualTo',
      Like: 'PropertyIsLike',
      Not: 'Not',
      Is: 'PropertyIsNull',
      Null: 'PropertyIsNull',
    };
    // Por defecto, usa PropertyIsEqualTo si el operador no es reconocido
    return map[op] || 'PropertyIsEqualTo';
  }
}
