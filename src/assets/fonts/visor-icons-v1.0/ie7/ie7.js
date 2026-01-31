/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'visor-icons\'">' + entity + '</span>' + html;
	}
	var icons = {
		'ICON-VISOR-OPIAC_borrador': '&#xe914;',
		'ICON-VISOR-OPIAC_mano-abierta': '&#xe918;',
		'ICON-VISOR-OPIAC_mano-cerrada': '&#xe919;',
		'ICON-VISOR-OPIAC_zoom-alejar': '&#xe91a;',
		'ICON-VISOR-OPIAC_zoom-aumentar': '&#xe91b;',
		'ICON-VISOR-OPIAC_ACERCAR': '&#xe900;',
		'ICON-VISOR-OPIAC_AJUSTES': '&#xe901;',
		'ICON-VISOR-OPIAC_ALEJAR': '&#xe902;',
		'ICON-VISOR-OPIAC_CAPA-ABIERTA': '&#xe903;',
		'ICON-VISOR-OPIAC_CAPA-CERRADA': '&#xe906;',
		'ICON-VISOR-OPIAC_CARPETA': '&#xe907;',
		'ICON-VISOR-OPIAC_CERRAR': '&#xe908;',
		'ICON-VISOR-OPIAC_COLOMBIA': '&#xe909;',
		'ICON-VISOR-OPIAC_EDICION': '&#xe90a;',
		'ICON-VISOR-OPIAC_INFO': '&#xe90f;',
		'ICON-VISOR-OPIAC_MINIMIZAR': '&#xe911;',
		'ICON-VISOR-OPIAC_BUFFER': '&#xe904;',
		'ICON-VISOR-OPIAC_BUSCAR': '&#xe905;',
		'ICON-VISOR-OPIAC_CONSULTA-AVANZADA': '&#xe90b;',
		'ICON-VISOR-OPIAC_CONSULTA-SIMPLE': '&#xe90c;',
		'ICON-VISOR-OPIAC_DESPLEGAR': '&#xe90d;',
		'ICON-VISOR-OPIAC_DIBUJAR': '&#xe90e;',
		'ICON-VISOR-OPIAC_IDENTIFICAR': '&#xe910;',
		'ICON-VISOR-OPIAC_INTERSECCION': '&#xe912;',
		'ICON-VISOR-OPIAC_MEDIR': '&#xe913;',
		'ICON-VISOR-OPIAC_SALIDA-GRAFICA': '&#xe915;',
		'ICON-VISOR-OPIAC_SELECCION-ESPACIAL': '&#xe916;',
		'ICON-VISOR-OPIAC_UBICAR-COORDENADA': '&#xe917;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/ICON-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
