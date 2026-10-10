<?php
/**
 * THE DOUBLE TWENTY — Diagnosi PayPal (TEMPORANEO)
 * ---------------------------------------------------------------------------
 * Serve solo a capire da dove arriva la lingua dei pulsanti PayPal nel
 * carrello. Lo vede SOLO l'amministratore collegato, solo in carrello e
 * cassa: in basso compare un riquadro con quello che PayPal riceve davvero.
 * Non cambia niente nel sito e non tocca i pagamenti.
 *
 * Uso: attivalo, apri il carrello (con un prodotto dentro) da collegato,
 * aspetta qualche secondo, premi "Copia" e incolla il testo nella chat.
 * Poi DISATTIVALO ed ELIMINALO.
 *
 * Dove si incolla: Code Snippets, frammento PHP, esecuzione "ovunque".
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'tdt_diagnosi_paypal' ) ) {
function tdt_diagnosi_paypal() {
	if ( is_admin() || ! current_user_can( 'manage_options' ) ) {
		return;
	}
	if ( ! function_exists( 'is_cart' ) || ! ( is_cart() || is_checkout() ) ) {
		return;
	}

	/* la versione di PayPal Payments e la lingua scelta nelle sue impostazioni */
	$versione = '(non trovata)';
	$file     = WP_PLUGIN_DIR . '/woocommerce-paypal-payments/woocommerce-paypal-payments.php';
	if ( is_readable( $file ) ) {
		$dati     = get_file_data( $file, array( 'v' => 'Version' ) );
		$versione = $dati['v'];
	}
	$imp            = get_option( 'woocommerce-ppcp-settings' );
	$lingua_paypal  = ( is_array( $imp ) && ! empty( $imp['smart_button_language'] ) ) ? $imp['smart_button_language'] : '(vuota)';

	$server = array(
		'pagina'               => is_cart() ? 'carrello' : 'cassa',
		'paypal_versione'      => $versione,
		'paypal_lingua_impost' => $lingua_paypal,
		'frammento_pagamenti'  => function_exists( 'tdt_lingua_pagamenti_lingua' ) ? 'attivo' : 'NON attivo',
		'lingua_server'        => function_exists( 'tdt_lingua_pagamenti_lingua' ) ? tdt_lingua_pagamenti_lingua() : '-',
		'filtro_lingua'        => apply_filters( 'woocommerce_paypal_payments_smart_buttons_locale', '(vuota)' ),
		'filtro_rate_spente'   => apply_filters( 'woocommerce_paypal_payments_buttons_paylater_disabled', false, 'cart' ) ? 'si' : 'no',
		'cookie_tdt_lang'      => isset( $_COOKIE['tdt_lang'] ) ? sanitize_key( wp_unslash( $_COOKIE['tdt_lang'] ) ) : '(nessuno)',
		'script_paypal'        => wp_script_is( 'ppcp-smart-button', 'enqueued' ) ? 'ppcp-smart-button presente' : 'ppcp-smart-button ASSENTE',
	);

	echo '<div id="tdt-diagnosi" style="position:fixed;left:12px;right:12px;bottom:12px;z-index:999999;'
		. 'max-width:760px;margin:0 auto;padding:12px;background:#fff;border:2px solid #111;border-radius:12px;'
		. 'font:12px/1.4 monospace;color:#111;box-shadow:0 10px 40px rgba(0,0,0,.25)" data-tdt-skip class="notranslate">'
		. '<strong>Diagnosi PayPal</strong> (solo per te) — aspetta che compaia il testo, poi premi Copia.'
		. '<textarea id="tdt-diagnosi-testo" readonly style="display:block;width:100%;height:220px;margin:8px 0;font:11px/1.35 monospace">attendere…</textarea>'
		. '<button type="button" id="tdt-diagnosi-copia" style="padding:8px 16px;border:1px solid #111;border-radius:8px;background:#111;color:#fff;cursor:pointer">Copia</button>'
		. '</div>';
	echo '<script>var TDT_DIAGNOSI=' . wp_json_encode( $server, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ';</script>';
	echo '<script>' . tdt_diagnosi_paypal_js() . '</script>';
}
}
add_action( 'wp_footer', 'tdt_diagnosi_paypal', 999 );

if ( ! function_exists( 'tdt_diagnosi_paypal_js' ) ) {
function tdt_diagnosi_paypal_js() {
	return <<<'JS'
(function () {
	'use strict';
	function raccogli() {
		var r = [], S = window.TDT_DIAGNOSI || {}, k;
		r.push('== server ==');
		for (k in S) { if (Object.prototype.hasOwnProperty.call(S, k)) { r.push(k + ': ' + S[k]); } }
		r.push('== browser ==');
		r.push('indirizzo: ' + location.pathname + location.search);
		r.push('lingua all apertura (TDT): ' + window.TDT_LINGUE_INIZIALE);
		r.push('lingua adesso (TDT): ' + (window.TDTLingue && window.TDTLingue.lang ? window.TDTLingue.lang() : '-'));
		r.push('cookie tdt_lang: ' + ((/(?:^|;\s*)tdt_lang=([^;]*)/.exec(document.cookie) || [])[1] || '(nessuno)'));
		r.push('lingua del browser: ' + (navigator.languages || [navigator.language]).join(', '));
		var prima = document.getElementById('ppcp-smart-button-js-before');
		r.push('script del frammento prima di PayPal: ' + (prima ? (prima.textContent.indexOf('TDT_LINGUE_INIZIALE') > -1 ? 'presente' : 'presente ma diverso') : 'ASSENTE'));
		var G = window.PayPalCommerceGateway;
		if (G && G.url_params) {
			r.push('impostazioni PayPal (url_params):');
			['locale', 'enable-funding', 'disable-funding', 'components', 'currency', 'buyer-country'].forEach(function (n) {
				r.push('   ' + n + ' = ' + (G.url_params[n] === undefined ? '(assente)' : G.url_params[n]));
			});
			r.push('   url = ' + G.url);
		} else {
			r.push('PayPalCommerceGateway: ASSENTE');
		}
		var sdk = document.querySelectorAll('script[src*="paypal.com/sdk/js"]');
		r.push('script PayPal caricati: ' + sdk.length);
		Array.prototype.forEach.call(sdk, function (s, i) {
			var extra = [];
			Array.prototype.forEach.call(s.attributes, function (a) { if (a.name !== 'src') { extra.push(a.name + '=' + a.value); } });
			r.push('   ' + (i + 1) + '. ' + s.src);
			if (extra.length) { r.push('      attributi: ' + extra.join(' | ').slice(0, 400)); }
		});
		var fr = document.querySelectorAll('iframe[src*="paypal.com"], iframe[name*="paypal"], iframe[title*="PayPal"]');
		r.push('riquadri PayPal: ' + fr.length);
		Array.prototype.forEach.call(fr, function (f, i) {
			r.push('   ' + (i + 1) + '. ' + (f.title || '') + ' | ' + (f.getAttribute('src') || '').slice(0, 200));
		});
		r.push('contenitori pulsanti: ' + Array.prototype.map.call(document.querySelectorAll('[id^="ppc-button"], .ppc-button-wrapper, #ppcp-messages, .ppcp-messages'), function (e) { return (e.id || e.className); }).join(', '));
		document.getElementById('tdt-diagnosi-testo').value = r.join('\n');
	}
	window.addEventListener('load', function () { setTimeout(raccogli, 4000); });
	var b = document.getElementById('tdt-diagnosi-copia');
	if (b) {
		b.addEventListener('click', function () {
			raccogli();
			var t = document.getElementById('tdt-diagnosi-testo');
			t.focus();
			t.select();
			try { document.execCommand('copy'); b.textContent = 'Copiato ✓'; } catch (e) { b.textContent = 'Seleziona e copia a mano'; }
		});
	}
})();
JS;
}
}
