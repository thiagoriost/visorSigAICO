import { XmlFilterGeneratorService } from './xml-filter-generator.service';

describe('XmlFilterGeneratorService', () => {
  let service: XmlFilterGeneratorService;

  beforeEach(() => {
    service = new XmlFilterGeneratorService();
  });

  it('debe generar filtro XML para igualdad (=)', () => {
    // Arrange
    const expresion = "estado = 'Aprobado'";

    // Act
    const resultado = service.generarFiltroDesdeExpresion(expresion);

    // Assert
    expect(resultado).toContain('<PropertyIsEqualTo>');
    expect(resultado).toContain('<PropertyName>estado</PropertyName>');
    expect(resultado).toContain('<Literal>Aprobado</Literal>');
  });

  it('debe generar filtro XML para desigualdad (<>))', () => {
    const expresion = "estado <> 'Rechazado'";
    const resultado = service.generarFiltroDesdeExpresion(expresion);

    expect(resultado).toContain('<PropertyIsNotEqualTo>');
    expect(resultado).toContain('<PropertyName>estado</PropertyName>');
    expect(resultado).toContain('<Literal>Rechazado</Literal>');
  });

  it('debe generar filtro XML para menor (<)', () => {
    const expresion = "cantidad < '100'";
    const resultado = service.generarFiltroDesdeExpresion(expresion);

    expect(resultado).toContain('<PropertyIsLessThan>');
    expect(resultado).toContain('<PropertyName>cantidad</PropertyName>');
    expect(resultado).toContain('<Literal>100</Literal>');
  });

  it('debe generar filtro XML para operador Not', () => {
    const expresion = "estado Not 'Pendiente'";
    const resultado = service.generarFiltroDesdeExpresion(expresion);

    expect(resultado).toContain('<Not>');
    expect(resultado).toContain('<PropertyIsEqualTo>');
    expect(resultado).toContain('<PropertyName>estado</PropertyName>');
    expect(resultado).toContain('<Literal>Pendiente</Literal>');
  });

  it('debe soportar atributos con puntos', () => {
    const expresion = "datos.estado = 'Finalizado'";
    const resultado = service.generarFiltroDesdeExpresion(expresion);

    expect(resultado).toContain('<PropertyName>datos.estado</PropertyName>');
    expect(resultado).toContain('<Literal>Finalizado</Literal>');
  });
});
