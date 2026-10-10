<?php
/**
 * THE DOUBLE TWENTY — Lingua dei campi della carta
 * ---------------------------------------------------------------------------
 * I campi della carta (numero, scadenza, CVC) non sono testo della pagina:
 * sono riquadri di Stripe caricati dentro la pagina, e li' il plugin delle
 * lingue (TDT Lingue) non puo' entrare. La loro lingua la decide il plugin
 * di pagamento, che prende quella del sito: l'italiano. Questo frammento gli
 * passa invece la lingua scelta dal visitatore.
 *
 * COME
 *   1. In ogni pagina tradotta un piccolo script scrive la lingua scelta nel
 *      cookie tecnico "tdt_lang" (solo la sigla: it, en, fr, de, es; dura
 *      un anno). E' una preferenza scelta dal visitatore, come la lingua.
 *   2. In cassa, carrello e account il server legge il cookie e lo passa ai
 *      due plugin che usano Stripe, con i loro agganci ufficiali:
 *        WooPayments                  wcpay_payment_fields_js_config
 *        WooCommerce Stripe Gateway   wc_stripe_upe_params
 *      Solo in quelle tre pagine, perche' sono le uniche che non finiscono
 *      nella cache di SiteGround: altrove la lingua di un visitatore
 *      resterebbe salvata nella pagina e la vedrebbero anche gli altri.
 *      In italiano non si tocca niente: restano le impostazioni di sempre.
 *   3. PayPal: i pulsanti restano nella lingua del sito, l'italiano.
 *   4. "Paga in 3 rate" di PayPal:
 *        - Il PULSANTE "rate" non si vede in nessuna lingua. La versione
 *          nuova di PayPal Payments (4.x, quella che carica "SDK v6") lo
 *          disegna da se', dentro un suo riquadro, con la scritta sbagliata
 *          in spagnolo ("Paga a plazos") anche sulle pagine in italiano.
 *          Dal sito quella scritta non si puo' correggere, quindi il
 *          pulsante si nasconde. Il pulsante PayPal normale resta.
 *        - Il MESSAGGIO "Paga in 3 rate da ... senza interessi" resta in
 *          italiano. E' un'offerta solo per chi e' in Italia: in inglese,
 *          francese, tedesco e spagnolo sparisce, anche cambiando lingua
 *          dal selettore senza ricaricare.
 *        - In cassa e carrello, nelle altre lingue, il server spegne le rate
 *          anche con l'aggancio ufficiale di PayPal
 *          (woocommerce_paypal_payments_buttons_paylater_disabled).
 *
 * NON tocca importi, ordini o pagamenti. Se la lingua si cambia stando gia'
 * nella cassa, i campi della carta la prendono al prossimo caricamento della
 * pagina. Disattivando il frammento torna tutto come prima.
 *
 * Dove si incolla: Code Snippets, frammento PHP, esecuzione "ovunque".
 * Senza il plugin TDT Lingue attivo nasconde solo il pulsante "rate".
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * La lingua della pagina come la sa il server: dal cookie, e italiano se il
 * cookie non c'e' (e' la lingua del sito). Niente nelle pagine che vanno in
 * cache e dove il plugin delle lingue e' spento: li' il server non decide.
 */
if ( ! function_exists( 'tdt_lingua_pagamenti_lingua' ) ) {
function tdt_lingua_pagamenti_lingua() {
	if ( ! function_exists( 'tdt_lingue_attivo_qui' ) || ! tdt_lingue_attivo_qui() ) {
		return '';
	}
	if ( ! function_exists( 'is_checkout' ) || ! ( is_checkout() || is_cart() || is_account_page() ) ) {
		return '';
	}
	$sigla = ( isset( $_COOKIE['tdt_lang'] ) && is_string( $_COOKIE['tdt_lang'] ) )
		? sanitize_key( wp_unslash( $_COOKIE['tdt_lang'] ) )
		: 'it';
	return in_array( $sigla, array( 'it', 'en', 'fr', 'de', 'es' ), true ) ? $sigla : 'it';
}
}

/** La lingua scelta se non e' l'italiano, o niente: e' quando c'e' da cambiare. */
if ( ! function_exists( 'tdt_lingua_pagamenti_sigla' ) ) {
function tdt_lingua_pagamenti_sigla() {
	$lingua = tdt_lingua_pagamenti_lingua();
	return ( '' !== $lingua && 'it' !== $lingua ) ? $lingua : '';
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

/**
 * "Paga in 3 rate" di PayPal in cassa e carrello: nelle altre lingue lo
 * spegne il server, con l'aggancio che PayPal mette a disposizione proprio
 * per questo.
 */
if ( ! function_exists( 'tdt_lingua_pagamenti_rate_paypal' ) ) {
function tdt_lingua_pagamenti_rate_paypal( $spento ) {
	return tdt_lingua_pagamenti_sigla() ? true : $spento;
}
}
add_filter( 'woocommerce_paypal_payments_buttons_paylater_disabled', 'tdt_lingua_pagamenti_rate_paypal', 20 );

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

/**
 * "Paga in 3 rate" di PayPal, nella pagina:
 *   - il pulsante (paypal-pay-later-button) e' nascosto sempre, in tutte le
 *     lingue: PayPal 4.x lo scrive in spagnolo e la scritta sta dentro il
 *     pulsante, dove il sito non arriva;
 *   - il messaggio "Paga in 3 rate da ..." si vede solo in italiano. La
 *     lingua la scrive TDT Lingue sulla pagina (data-tdt-lang), percio' il
 *     messaggio sparisce e ricompare anche cambiando lingua dal selettore.
 * E' solo stile: niente cambia per chi e' nella cache.
 */
if ( ! function_exists( 'tdt_lingua_pagamenti_stile' ) ) {
function tdt_lingua_pagamenti_stile() {
	if ( is_admin() ) {
		return;
	}
	$css = 'paypal-pay-later-button{display:none !important}';
	if ( function_exists( 'tdt_lingue_attivo_qui' ) && tdt_lingue_attivo_qui() ) {
		$css .= 'html[data-tdt-lang]:not([data-tdt-lang="it"]) .ppcp-messages,'
			. 'html[data-tdt-lang]:not([data-tdt-lang="it"]) paypal-message,'
			. 'html[data-tdt-lang]:not([data-tdt-lang="it"]) [data-pp-message]{display:none !important}';
	}
	echo '<style id="tdt-lingua-pagamenti-css">' . $css . "</style>\n";
}
}
add_action( 'wp_head', 'tdt_lingua_pagamenti_stile', 20 );
