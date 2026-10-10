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
 *   3. PayPal: nelle pagine in italiano gli si dice esplicitamente di
 *      parlare italiano (it_IT), dal server in cassa e carrello e dal browser
 *      ovunque. Senza, PayPal puo' restare nella lingua che si e' ricordato
 *      nel browser (per esempio lo spagnolo di una prova precedente). Nelle
 *      altre lingue decide PayPal: la lingua passata dal sito la segue solo
 *      in parte (lo spagnolo si', l'inglese no) e ne usciva un miscuglio.
 *   4. "Paga in 3 rate" di PayPal e' un'offerta solo per chi e' in Italia:
 *      in inglese, francese, tedesco e spagnolo non compare.
 *        - In cassa e carrello lo spegne il server con l'aggancio ufficiale
 *          di PayPal (woocommerce_paypal_payments_buttons_paylater_disabled),
 *          come quando lo si spegne nelle impostazioni.
 *        - Nelle altre pagine (prodotti, che vanno in cache) lo spegne il
 *          browser, nelle impostazioni di PayPal, un attimo prima che il suo
 *          script le legga.
 *        - Il messaggio "Paga in 3 rate da ..." si nasconde anche cambiando
 *          lingua dal selettore; il pulsante segue al caricamento successivo.
 *      In italiano resta tutto com'e'.
 *
 * NON tocca importi, ordini o pagamenti. Se la lingua si cambia stando gia'
 * nella cassa, campi della carta e pulsanti PayPal la prendono al prossimo
 * caricamento della pagina. Disattivando il frammento torna tutto come prima.
 *
 * Dove si incolla: Code Snippets, frammento PHP, esecuzione "ovunque".
 * Senza il plugin TDT Lingue attivo non fa niente.
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
 * per questo. Vale per il pulsante e per il messaggio.
 */
if ( ! function_exists( 'tdt_lingua_pagamenti_rate_paypal' ) ) {
function tdt_lingua_pagamenti_rate_paypal( $spento ) {
	return tdt_lingua_pagamenti_sigla() ? true : $spento;
}
}
add_filter( 'woocommerce_paypal_payments_buttons_paylater_disabled', 'tdt_lingua_pagamenti_rate_paypal', 20 );

/** PayPal in italiano nelle pagine in italiano (in cassa e carrello, dal server). */
if ( ! function_exists( 'tdt_lingua_pagamenti_paypal_italiano' ) ) {
function tdt_lingua_pagamenti_paypal_italiano( $locale ) {
	return 'it' === tdt_lingua_pagamenti_lingua() ? 'it_IT' : $locale;
}
}
add_filter( 'woocommerce_paypal_payments_smart_buttons_locale', 'tdt_lingua_pagamenti_paypal_italiano', 20 );

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
 * "Paga in 3 rate" di PayPal nelle altre pagine, nel browser. WordPress
 * stampa prima le impostazioni di PayPal (PayPalCommerceGateway), poi gli
 * script "before" come questo, poi lo script di PayPal: qui il pulsante si
 * spegne giusto in tempo. Si aggancia prima che gli script del piede vengano
 * stampati.
 */
if ( ! function_exists( 'tdt_lingua_pagamenti_paypal_browser' ) ) {
function tdt_lingua_pagamenti_paypal_browser() {
	if ( is_admin() || ! function_exists( 'tdt_lingue_attivo_qui' ) || ! tdt_lingue_attivo_qui() ) {
		return;
	}
	if ( wp_script_is( 'ppcp-smart-button', 'enqueued' ) ) {
		wp_add_inline_script( 'ppcp-smart-button', tdt_lingua_pagamenti_paypal_js(), 'before' );
	}
}
}
add_action( 'wp_footer', 'tdt_lingua_pagamenti_paypal_browser', 5 );

if ( ! function_exists( 'tdt_lingua_pagamenti_paypal_js' ) ) {
function tdt_lingua_pagamenti_paypal_js() {
	return <<<'JS'
(function () {
	'use strict';
	/* la lingua con cui si e' aperta la pagina, decisa da TDT Lingue */
	var sigla = window.TDT_LINGUE_INIZIALE;
	var G = window.PayPalCommerceGateway;
	if (!G || !G.url_params || !sigla) { return; }

	/* nell'indirizzo si tocca solo il valore che serve: il resto resta com'e' */
	function imposta(url, nome, valore) {
		var re = new RegExp('([?&])' + nome + '=[^&#]*(&?)');
		url = url.replace(re, function (tutto, prima, dopo) { return dopo ? prima : ''; });
		return valore ? url + (url.indexOf('?') > -1 ? '&' : '?') + nome + '=' + valore : url;
	}

	/* pagina in italiano: PayPal in italiano, anche se nel browser si e'
	   ricordato un'altra lingua. "Paga in 3 rate" resta come impostato. */
	if (sigla === 'it') {
		G.url_params.locale = 'it_IT';
		if (typeof G.url === 'string') { G.url = imposta(G.url, 'locale', 'it_IT'); }
		return;
	}

	/* "Paga in 3 rate" e' solo per chi e' in Italia: nelle altre lingue il
	   pulsante si spegne come fa PayPal stesso quando lo si toglie dalle
	   impostazioni, cioe' spostando "paylater" dai metodi accesi a quelli
	   spenti. La lingua dei pulsanti la decide PayPal. */
	var P = G.url_params;
	function lista(valore) {
		return typeof valore === 'string' && valore ? valore.split(',') : [];
	}
	var accesi = lista(P['enable-funding']).filter(function (f) { return f !== 'paylater'; });
	var spenti = lista(P['disable-funding']);
	if (spenti.indexOf('paylater') < 0) { spenti.push('paylater'); }
	if (accesi.length) { P['enable-funding'] = accesi.join(','); } else { delete P['enable-funding']; }
	P['disable-funding'] = spenti.join(',');

	/* lo stesso nell'indirizzo */
	if (typeof G.url === 'string') {
		var url = imposta(G.url, 'enable-funding', P['enable-funding'] || '');
		G.url = imposta(url, 'disable-funding', P['disable-funding']);
	}
})();
JS;
}
}

/**
 * Il messaggio "Paga in 3 rate" di PayPal: nelle lingue diverse
 * dall'italiano non si vede. La lingua la scrive TDT Lingue sulla pagina
 * (data-tdt-lang), percio' il messaggio sparisce e ricompare anche cambiando
 * lingua dal selettore, senza ricaricare.
 */
if ( ! function_exists( 'tdt_lingua_pagamenti_stile' ) ) {
function tdt_lingua_pagamenti_stile() {
	if ( is_admin() || ! function_exists( 'tdt_lingue_attivo_qui' ) || ! tdt_lingue_attivo_qui() ) {
		return;
	}
	echo '<style id="tdt-lingua-pagamenti-css">'
		. 'html[data-tdt-lang]:not([data-tdt-lang="it"]) .ppcp-messages,'
		. 'html[data-tdt-lang]:not([data-tdt-lang="it"]) [data-pp-message]{display:none !important}'
		. "</style>\n";
}
}
add_action( 'wp_head', 'tdt_lingua_pagamenti_stile', 20 );
