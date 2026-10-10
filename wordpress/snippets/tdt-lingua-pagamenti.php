<?php
/**
 * THE DOUBLE TWENTY — Lingua dei campi della carta
 * ---------------------------------------------------------------------------
 * I campi della carta (numero, scadenza, CVC) non sono testo della pagina:
 * sono riquadri di Stripe e di PayPal caricati dentro la pagina, e li' il
 * plugin delle lingue (TDT Lingue) non puo' entrare. La loro lingua la
 * decide il plugin di pagamento, che prende quella del sito: l'italiano.
 * Questo frammento gli passa invece la lingua scelta dal visitatore.
 *
 * COME
 *   1. In ogni pagina tradotta un piccolo script scrive la lingua scelta nel
 *      cookie tecnico "tdt_lang" (solo la sigla: it, en, fr, de, es; dura
 *      un anno). E' una preferenza scelta dal visitatore, come la lingua.
 *   2. In cassa, carrello e account il server legge il cookie e lo passa ai
 *      tre plugin di pagamento, con i loro agganci ufficiali:
 *        WooPayments                  wcpay_payment_fields_js_config
 *        WooCommerce Stripe Gateway   wc_stripe_upe_params
 *        WooCommerce PayPal Payments  woocommerce_paypal_payments_smart_buttons_locale
 *      Solo in quelle tre pagine, perche' sono le uniche che non finiscono
 *      nella cache di SiteGround: altrove la lingua di un visitatore
 *      resterebbe salvata nella pagina e la vedrebbero anche gli altri.
 *      In italiano non si tocca niente: restano le impostazioni di sempre.
 *
 * NON tocca importi, ordini o pagamenti: cambia soltanto la lingua delle
 * scritte dentro i riquadri. Se la lingua si cambia stando gia' nella cassa,
 * i riquadri la prendono al prossimo caricamento della pagina.
 * Disattivando il frammento i riquadri tornano come prima, in italiano.
 *
 * Dove si incolla: Code Snippets, frammento PHP, esecuzione "ovunque".
 * Senza il plugin TDT Lingue attivo non fa niente.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * La lingua da dare ai campi della carta, o niente se non c'e' da cambiare:
 * italiano, pagina che va in cache, plugin delle lingue spento.
 */
if ( ! function_exists( 'tdt_lingua_pagamenti_sigla' ) ) {
function tdt_lingua_pagamenti_sigla() {
	if ( empty( $_COOKIE['tdt_lang'] ) || ! is_string( $_COOKIE['tdt_lang'] ) ) {
		return '';
	}
	if ( ! function_exists( 'tdt_lingue_attivo_qui' ) || ! tdt_lingue_attivo_qui() ) {
		return '';
	}
	if ( ! function_exists( 'is_checkout' ) || ! ( is_checkout() || is_cart() || is_account_page() ) ) {
		return '';
	}
	$sigla = sanitize_key( wp_unslash( $_COOKIE['tdt_lang'] ) );
	return in_array( $sigla, array( 'en', 'fr', 'de', 'es' ), true ) ? $sigla : '';
}
}

/**
 * WooPayments e WooCommerce Stripe Gateway usano tutti e due Stripe: la
 * lingua va nella chiave "locale", nel formato di Stripe.
 */
if ( ! function_exists( 'tdt_lingua_pagamenti_stripe' ) ) {
function tdt_lingua_pagamenti_stripe( $parametri ) {
	$sigla  = tdt_lingua_pagamenti_sigla();
	$codici = array( 'en' => 'en-GB', 'fr' => 'fr', 'de' => 'de', 'es' => 'es' );
	if ( $sigla && is_array( $parametri ) ) {
		$parametri['locale'] = $codici[ $sigla ];
	}
	return $parametri;
}
}
add_filter( 'wcpay_payment_fields_js_config', 'tdt_lingua_pagamenti_stripe', 20 );
add_filter( 'wc_stripe_upe_params', 'tdt_lingua_pagamenti_stripe', 20 );

/** PayPal vuole la lingua nel suo formato: lingua_PAESE. */
if ( ! function_exists( 'tdt_lingua_pagamenti_paypal' ) ) {
function tdt_lingua_pagamenti_paypal( $locale ) {
	$sigla  = tdt_lingua_pagamenti_sigla();
	$codici = array( 'en' => 'en_GB', 'fr' => 'fr_FR', 'de' => 'de_DE', 'es' => 'es_ES' );
	return $sigla ? $codici[ $sigla ] : $locale;
}
}
add_filter( 'woocommerce_paypal_payments_smart_buttons_locale', 'tdt_lingua_pagamenti_paypal', 20 );

/**
 * Lo script che ricorda la lingua nel cookie. Va in tutte le pagine tradotte:
 * cosi' quando si arriva alla cassa il cookie c'e' gia'.
 */
if ( ! function_exists( 'tdt_lingua_pagamenti_script' ) ) {
function tdt_lingua_pagamenti_script() {
	if ( is_admin() || ! function_exists( 'tdt_lingue_attivo_qui' ) || ! tdt_lingue_attivo_qui() ) {
		return;
	}
	echo '<script id="tdt-lingua-pagamenti">' . tdt_lingua_pagamenti_js() . "</script>\n";
}
}
add_action( 'wp_footer', 'tdt_lingua_pagamenti_script', 40 );

if ( ! function_exists( 'tdt_lingua_pagamenti_js' ) ) {
function tdt_lingua_pagamenti_js() {
	return <<<'JS'
(function () {
	'use strict';
	var L = window.TDTLingue;
	if (!L || typeof L.lang !== 'function') { return; }
	function ricorda(sigla) {
		if (!/^[a-z]{2}$/.test(sigla || '')) { return; }
		var c = 'tdt_lang=' + sigla + ';path=/;max-age=31536000;SameSite=Lax';
		if (window.location.protocol === 'https:') { c += ';Secure'; }
		try { document.cookie = c; } catch (e) {}
	}
	/* la lingua di adesso, e ogni volta che si cambia dal selettore */
	ricorda(L.lang());
	if (typeof L.onLang === 'function') { L.onLang(ricorda); }
})();
JS;
}
}
