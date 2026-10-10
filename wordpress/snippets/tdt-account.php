<?php
/**
 * ============================================================
 * THE DOUBLE TWENTY — Area clienti: account, sconto membri, invita un amico
 * ------------------------------------------------------------
 * >>> INCOLLANDO IN WPCODE: NON COPIARE LA PRIMA RIGA DEL FILE, quella
 * >>> con il tag di apertura PHP. WPCode fa girare il codice gia' in
 * >>> modalita' PHP, e con il tag dentro da' "syntax error". Nella stessa
 * >>> cartella c'e' il file gia' pronto senza tag:
 * >>> tdt-account-DA-INCOLLARE.txt
 * >>> Tipo di codice: PHP Snippet. Inserimento: ovunque.
 *
 * ATTENZIONE, ANCHE NEI COMMENTI: WPCode unisce tutti i frammenti "ovunque"
 * in un solo programma e, se ci trova piu' di 5 volte il nome di certe
 * funzioni seguito da una parentesi (quella che valuta il codice, e poi
 * base64_decode, ini_set, error_reporting), lo scarta INTERO senza dire
 * niente: spariscono menu, intro e tutto il resto. Qui non ce n'e' nessuna.
 *
 * COSA FA
 *   La pagina "Il mio account" (/mio-account/) diventa l'area clienti:
 *   - registrazione: nome, cognome, email, password, conferma, privacy;
 *   - SCONTO DEL 5% SUL PRIMO ORDINE per chi si registra, applicato da solo
 *     quando ha fatto l'accesso. Non e' permanente: dal secondo ordine no;
 *   - INVITA UN AMICO: ogni account ha un codice (DT-XXXXX) e un link
 *     personale, che porta dritto alla registrazione con il codice gia'
 *     scritto (chi ha il codice a voce lo scrive nel campo "Codice amico").
 *     Per OGNI amico che SI REGISTRA cosi', chi l'ha invitato riceve subito
 *     un bonus del 5% da usare su un ordine (uno per ordine: gli altri
 *     restano). L'amico invitato non ha altri sconti: solo il 5% sul primo
 *     ordine, come tutti quelli che si registrano;
 *   - la dashboard con i vantaggi, il link da condividere e i risultati;
 *   - in cima al carrello, per chi non ha fatto l'accesso, il promemoria
 *     "Registrati e risparmi un ulteriore 5% sul primo ordine": dopo la
 *     registrazione si torna al carrello con lo sconto gia' applicato;
 *   - in bacheca: WooCommerce > Invita un amico.
 *
 * LINGUE
 *   I testi qui restano in italiano: li traduce nel browser il plugin TDT
 *   Lingue, che cerca ogni frase italiana nel suo dizionario. Se cambi un
 *   testo qui, aggiungi la sua traduzione in Impostazioni > TDT Lingue >
 *   Traduzioni aggiunte (i numeri si scrivono {n}). L'unico testo che non
 *   sta nella pagina e' il messaggio che parte con WhatsApp e con
 *   "Condividi": quello lo fa tradurre il codice qui sotto al momento
 *   dell'invio, chiedendolo al plugin.
 *
 * LE SCELTE CHE CONTANO
 *   - Gli sconti sono codici promozionali di WooCommerce, non grafica:
 *     compaiono in carrello e in cassa come righe di sconto, restano scritti
 *     nell'ordine e si sommano agli sconti quantita' (si calcolano sui prezzi
 *     gia' scontati).
 *       "membri-tdt": codice virtuale (non sta nella lista dei codici),
 *                     valido per chi ha fatto l'accesso e non ha ancora un
 *                     ordine fatto dopo la registrazione (pagato, in attesa
 *                     di bonifico, completato o rimborsato: un pagamento non
 *                     riuscito o abbandonato non lo consuma);
 *       bonus:        un codice vero per ogni invito valido, usabile una
 *                     volta e solo dal suo proprietario. L'uso lo conta
 *                     WooCommerce, e lo restituisce se l'ordine si annulla.
 *                     Fino al 28 settembre 2026 anche chi si registrava con
 *                     un codice riceveva un bonus "benvenuto": quelli gia'
 *                     creati restano validi, di nuovi non ne nascono.
 *   - L'invito lo legge il browser: SiteGround tiene in cache anche le pagine
 *     con ?ref=, e li' il PHP non gira. Lo ricorda un cookie tecnico
 *     "tdt_ref" (30 giorni, contiene solo il codice). Vince il primo invito.
 *   - Il bonus arriva alla REGISTRAZIONE dell'amico (scelta del titolare,
 *     29 settembre 2026; prima arrivava al suo primo ordine pagato). Non vale
 *     se l'email dell'amico e' quella di chi invita (anche con +etichetta o
 *     con i punti di Gmail) o se l'amico era gia' cliente. Gli inviti
 *     registrati prima del cambio e ancora in attesa diventano validi al
 *     primo ordine pagato, come era stato detto allora.
 *   - Spegnendo il frammento: niente sconti, niente area vestita, la
 *     registrazione torna spenta. Codici, inviti e bonus restano salvati.
 * ============================================================
 */

defined( 'ABSPATH' ) || exit;

if ( class_exists( 'WooCommerce' ) && ! function_exists( 'tdta_config' ) ) {

	/* =====================================================================
	 * 1 · CONFIGURAZIONE
	 * ===================================================================== */
	function tdta_config() {
		static $c = null;
		if ( null !== $c ) {
			return $c;
		}
		$c = apply_filters(
			'tdta_config',
			array(
				'sconto_membri' => 5,             /* % sul primo ordine di chi si registra */
				'bonus_amico'   => 5,             /* % di ogni bonus, uno per ordine */
				'coupon_membri' => 'membri-tdt',  /* il codice virtuale dello sconto sul primo ordine */
				'prefisso'      => 'DT-',
				'giorni_invito' => 30,            /* quanto resta ricordato un invito */
				'privacy'       => home_url( '/privacy-policy/' ),
				'termini'       => home_url( '/termini-e-condizioni/' ),
			)
		);
		return $c;
	}

	function tdta_pct( $numero ) {
		$numero = (float) $numero;
		return ( floor( $numero ) == $numero ) ? number_format_i18n( $numero, 0 ) : number_format_i18n( $numero, 1 );
	}

	/* =====================================================================
	 * 2 · CODICI E LINK PERSONALI
	 * ===================================================================== */
	/** Il codice come lo scrive la gente: " dt 7k92x ", "DT7K92X" o "7K92X" diventano DT-7K92X. */
	function tdta_pulisci_codice( $codice ) {
		$cfg    = tdta_config();
		$pref   = strtoupper( (string) preg_replace( '/[^A-Za-z0-9]/', '', $cfg['prefisso'] ) );
		$pulito = strtoupper( (string) preg_replace( '/[^A-Za-z0-9]/', '', (string) $codice ) );
		if ( 5 === strlen( $pulito ) ) {
			$pulito = $pref . $pulito;
		}
		if ( '' !== $pref && 0 === strpos( $pulito, $pref ) && strlen( $pulito ) === strlen( $pref ) + 5 ) {
			return $cfg['prefisso'] . substr( $pulito, strlen( $pref ) );
		}
		return substr( $pulito, 0, 16 );
	}

	function tdta_utente_da_codice( $codice ) {
		$codice = tdta_pulisci_codice( $codice );
		if ( strlen( $codice ) < 4 ) {
			return 0;
		}
		$ids = get_users(
			array(
				'meta_key'    => 'tdta_codice',
				'meta_value'  => $codice,
				'number'      => 1,
				'fields'      => 'ID',
				'count_total' => false,
			)
		);
		return $ids ? (int) $ids[0] : 0;
	}

	/** Il codice dell'account; se non c'e' ancora lo crea (DT- + 5 caratteri). */
	function tdta_codice( $user_id, $crea = true ) {
		$user_id = (int) $user_id;
		if ( $user_id <= 0 ) {
			return '';
		}
		$codice = (string) get_user_meta( $user_id, 'tdta_codice', true );
		if ( '' !== $codice || ! $crea ) {
			return $codice;
		}
		$cfg      = tdta_config();
		$alfabeto = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';   /* niente 0/O, 1/I/L: si leggono male */
		for ( $tentativo = 0; $tentativo < 25; $tentativo++ ) {
			$prova = $cfg['prefisso'];
			for ( $i = 0; $i < 5; $i++ ) {
				$prova .= $alfabeto[ random_int( 0, strlen( $alfabeto ) - 1 ) ];
			}
			if ( ! tdta_utente_da_codice( $prova ) ) {
				update_user_meta( $user_id, 'tdta_codice', $prova );
				return $prova;
			}
		}
		return '';
	}

	/* il link porta dritto alla registrazione, con il codice gia' scritto */
	function tdta_link( $user_id ) {
		$codice = tdta_codice( $user_id );
		return $codice ? add_query_arg( 'ref', rawurlencode( $codice ), wc_get_page_permalink( 'myaccount' ) ) : '';
	}

	/** L'email "vera": maiuscole, +etichette e i punti di Gmail non fanno un'email diversa. */
	function tdta_email_base( $email ) {
		$email = strtolower( trim( (string) $email ) );
		if ( false === strpos( $email, '@' ) ) {
			return $email;
		}
		list( $nome, $dominio ) = explode( '@', $email, 2 );
		$nome = preg_replace( '/\+.*$/', '', $nome );
		if ( 'gmail.com' === $dominio || 'googlemail.com' === $dominio ) {
			$nome    = str_replace( '.', '', $nome );
			$dominio = 'gmail.com';
		}
		return $nome . '@' . $dominio;
	}

	/** Le ultime 9 cifre: +39 e 0039 davanti non fanno un numero diverso. */
	function tdta_telefono_base( $telefono ) {
		$cifre = preg_replace( '/\D+/', '', (string) $telefono );
		return strlen( $cifre ) >= 9 ? substr( $cifre, -9 ) : '';
	}

	/* =====================================================================
	 * 3 · L'INVITO: DAL LINK AL COOKIE
	 * ===================================================================== */

	/* Il link porta ?ref=CODICE. Lo legge questo script, in ogni pagina: la
	   pagina puo' arrivare dalla cache di SiteGround, dove il PHP non gira.
	   Toglie ?ref= dall'indirizzo e chiede al negozio di ricordare l'invito. */
	add_action( 'wp_footer', 'tdta_stampa_script_invito', 30 );
	function tdta_stampa_script_invito() {
		if ( is_admin() ) {
			return;
		}
		echo '<script id="tdta-invito">var TDTA_INVITO=' . wp_json_encode( array( 'ajax' => admin_url( 'admin-ajax.php' ) ) ) . ";\n"
			. tdta_js_invito() . '</script>' . "\n";
	}

	function tdta_imposta_cookie( $codice, $giorni ) {
		if ( headers_sent() ) {
			return;
		}
		setcookie(
			'tdt_ref',
			$codice,
			array(
				'expires'  => $giorni > 0 ? time() + $giorni * DAY_IN_SECONDS : time() - YEAR_IN_SECONDS,
				'path'     => COOKIEPATH ? COOKIEPATH : '/',
				'domain'   => COOKIE_DOMAIN,
				'secure'   => is_ssl(),
				'httponly' => false,
				'samesite' => 'Lax',
			)
		);
	}

	function tdta_e_robot() {
		$ua = isset( $_SERVER['HTTP_USER_AGENT'] ) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
		return '' === $ua || (bool) preg_match( '/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse/i', $ua );
	}

	add_action( 'wp_ajax_tdta_invito', 'tdta_ajax_invito' );
	add_action( 'wp_ajax_nopriv_tdta_invito', 'tdta_ajax_invito' );
	function tdta_ajax_invito() {
		$codice = isset( $_POST['codice'] ) ? tdta_pulisci_codice( wp_unslash( $_POST['codice'] ) ) : '';
		$da     = tdta_utente_da_codice( $codice );
		/* chi ha gia' un account non e' un amico da invitare; e il primo invito vince */
		if ( ! $da || is_user_logged_in() || ! empty( $_COOKIE['tdt_ref'] ) ) {
			wp_send_json( array( 'ok' => false ) );
		}
		$cfg = tdta_config();
		tdta_imposta_cookie( tdta_codice( $da, false ), (int) $cfg['giorni_invito'] );
		if ( ! tdta_e_robot() ) {
			update_user_meta( $da, 'tdta_visite', (int) get_user_meta( $da, 'tdta_visite', true ) + 1 );
		}
		wp_send_json( array( 'ok' => true ) );
	}

	/** Il codice d'invito di chi sta guardando: dal modulo, dall'indirizzo o dal cookie. */
	function tdta_codice_invito_corrente() {
		foreach ( array( $_POST, $_GET, $_COOKIE ) as $fonte ) {
			foreach ( array( 'tdta_ref', 'ref', 'tdt_ref' ) as $chiave ) {
				if ( ! empty( $fonte[ $chiave ] ) && is_string( $fonte[ $chiave ] ) ) {
					$codice = tdta_pulisci_codice( wp_unslash( $fonte[ $chiave ] ) );
					if ( tdta_utente_da_codice( $codice ) ) {
						return $codice;
					}
				}
			}
		}
		return '';
	}

	/* =====================================================================
	 * 4 · REGISTRAZIONE
	 * ===================================================================== */

	/* Registrazione accesa nella pagina Il mio account, con la password scelta
	   dal cliente e il nome utente fatto dall'email. Sono le impostazioni di
	   WooCommerce, lette da qui: spento il frammento tornano quelle di prima. */
	add_filter( 'pre_option_woocommerce_enable_myaccount_registration', 'tdta_opzione_si' );
	add_filter( 'pre_option_woocommerce_registration_generate_username', 'tdta_opzione_si' );
	add_filter( 'pre_option_woocommerce_registration_generate_password', 'tdta_opzione_no' );
	function tdta_opzione_si() {
		return 'yes';
	}
	function tdta_opzione_no() {
		return 'no';
	}

	function tdta_valore_postato( $chiave ) {
		return isset( $_POST[ $chiave ] ) ? sanitize_text_field( wp_unslash( $_POST[ $chiave ] ) ) : '';
	}

	/* in cima al modulo: il vantaggio, poi nome e cognome */
	add_action( 'woocommerce_register_form_start', 'tdta_modulo_inizio' );
	function tdta_modulo_inizio() {
		$cfg = tdta_config();
		echo '<div class="tdta-vantaggio">'
			. '<span class="tdta-vantaggio__label">Il tuo vantaggio</span>'
			. '<strong class="tdta-vantaggio__num">&minus;' . esc_html( tdta_pct( $cfg['sconto_membri'] ) ) . '%</strong>'
			. '<span class="tdta-vantaggio__testo">Sul tuo primo ordine: si applica da solo in cassa.</span>'
			. '</div>';
		if ( tdta_codice_invito_corrente() ) {
			echo '<p class="tdta-invitato"><span aria-hidden="true">&#10003;</span> Hai ricevuto un invito: registrandoti, chi ti ha invitato riceve un bonus del '
				. esc_html( tdta_pct( $cfg['bonus_amico'] ) ) . '%.</p>';
		}
		$campi = array(
			'tdta_nome'    => array( 'Nome', 'given-name', 'form-row-first' ),
			'tdta_cognome' => array( 'Cognome', 'family-name', 'form-row-last' ),
		);
		foreach ( $campi as $nome => $c ) {
			echo '<p class="woocommerce-form-row form-row ' . esc_attr( $c[2] ) . '">'
				. '<label for="reg_' . esc_attr( $nome ) . '">' . esc_html( $c[0] ) . '&nbsp;<span class="required" aria-hidden="true">*</span></label>'
				. '<input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="' . esc_attr( $nome ) . '" id="reg_' . esc_attr( $nome ) . '"'
				. ' autocomplete="' . esc_attr( $c[1] ) . '" value="' . esc_attr( tdta_valore_postato( $nome ) ) . '" required aria-required="true" />'
				. '</p>';
		}
	}

	/* dopo la password: la conferma, il codice amico, la spunta privacy/termini */
	add_action( 'woocommerce_register_form', 'tdta_modulo_fine', 5 );
	function tdta_modulo_fine() {
		$cfg = tdta_config();
		echo '<p class="woocommerce-form-row form-row form-row-wide">'
			. '<label for="reg_tdta_password2">Conferma password&nbsp;<span class="required" aria-hidden="true">*</span></label>'
			. '<input type="password" class="woocommerce-Input woocommerce-Input--text input-text" name="tdta_password2" id="reg_tdta_password2" autocomplete="new-password" required aria-required="true" />'
			. '</p>';
		/* il codice dell'amico: gia' scritto se si arriva dal suo link; chi ce
		   l'ha a voce lo scrive qui */
		$codice = isset( $_POST['tdta_ref'] ) ? sanitize_text_field( wp_unslash( $_POST['tdta_ref'] ) ) : tdta_codice_invito_corrente();
		echo '<p class="woocommerce-form-row form-row form-row-wide tdta-codice-amico">'
			. '<label for="reg_tdta_ref">Codice amico&nbsp;<span class="optional">(facoltativo)</span></label>'
			. '<input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="tdta_ref" id="reg_tdta_ref"'
			. ' value="' . esc_attr( $codice ) . '" placeholder="' . esc_attr( $cfg['prefisso'] ) . 'XXXXX" maxlength="16"'
			. ' autocomplete="off" autocapitalize="characters" spellcheck="false" />'
			. '<span class="tdta-codice-amico__nota">Chi ti ha dato il codice riceve un bonus del ' . esc_html( tdta_pct( $cfg['bonus_amico'] ) ) . '% appena ti registri.</span>'
			. '</p>';
		echo '<p class="form-row tdta-privacy">'
			. '<label class="woocommerce-form__label woocommerce-form__label-for-checkbox">'
			. '<input type="checkbox" class="woocommerce-form__input woocommerce-form__input-checkbox" name="tdta_privacy" value="1"' . checked( ! empty( $_POST['tdta_privacy'] ), true, false ) . ' required aria-required="true" /> '
			. '<span>Ho letto e accetto la <a href="' . esc_url( $cfg['privacy'] ) . '" target="_blank" rel="noopener">Privacy Policy</a>'
			. ' e i <a href="' . esc_url( $cfg['termini'] ) . '" target="_blank" rel="noopener">Termini e condizioni</a>.'
			. '&nbsp;<span class="required" aria-hidden="true">*</span></span>'
			. '</label></p>';
		echo '<input type="hidden" name="tdta_modulo" value="1" />';
	}

	add_filter( 'woocommerce_registration_errors', 'tdta_controlla_registrazione', 10, 3 );
	function tdta_controlla_registrazione( $errori, $username, $email ) {
		if ( empty( $_POST['tdta_modulo'] ) || ! $errori instanceof WP_Error ) {
			return $errori;   /* le altre registrazioni restano come sono */
		}
		/* WooCommerce mostra solo il primo errore: si raccolgono in un messaggio solo */
		$messaggi = array();
		if ( '' === tdta_valore_postato( 'tdta_nome' ) ) {
			$messaggi[] = '<strong>Nome</strong>: scrivi il tuo nome.';
		}
		if ( '' === tdta_valore_postato( 'tdta_cognome' ) ) {
			$messaggi[] = '<strong>Cognome</strong>: scrivi il tuo cognome.';
		}
		$p1 = isset( $_POST['password'] ) ? (string) wp_unslash( $_POST['password'] ) : '';
		$p2 = isset( $_POST['tdta_password2'] ) ? (string) wp_unslash( $_POST['tdta_password2'] ) : '';
		if ( $p1 !== $p2 ) {
			$messaggi[] = '<strong>Password</strong>: le due password non coincidono.';
		}
		$scritto = isset( $_POST['tdta_ref'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['tdta_ref'] ) ) ) : '';
		if ( '' !== $scritto && ! tdta_utente_da_codice( $scritto ) ) {
			$messaggi[] = '<strong>Codice amico</strong>: &laquo;' . esc_html( tdta_pulisci_codice( $scritto ) ) . '&raquo; non esiste. Controllalo, oppure lascia vuoto il campo.';
		}
		if ( empty( $_POST['tdta_privacy'] ) ) {
			$messaggi[] = 'Per creare l&rsquo;account accetta la <strong>Privacy Policy</strong> e i <strong>Termini e condizioni</strong>.';
		}
		if ( $messaggi ) {
			/* ogni frase nel suo <span>: il plugin delle lingue (TDT Lingue)
			   la ritrova intera nel dizionario e la traduce tutta insieme,
			   invece che a pezzi */
			$errori->add( 'tdta_registrazione', '<span class="tdta-errore">' . implode( '</span><br><span class="tdta-errore">', $messaggi ) . '</span>' );
		}
		return $errori;
	}

	add_action( 'woocommerce_created_customer', 'tdta_nuovo_cliente', 10, 3 );
	function tdta_nuovo_cliente( $user_id, $dati = array(), $password_generata = false ) {
		$user_id = (int) $user_id;
		if ( ! empty( $_POST['tdta_modulo'] ) ) {
			$nome    = tdta_valore_postato( 'tdta_nome' );
			$cognome = tdta_valore_postato( 'tdta_cognome' );
			wp_update_user(
				array(
					'ID'           => $user_id,
					'first_name'   => $nome,
					'last_name'    => $cognome,
					'display_name' => trim( $nome . ' ' . $cognome ),
				)
			);
			update_user_meta( $user_id, 'billing_first_name', $nome );
			update_user_meta( $user_id, 'billing_last_name', $cognome );
			update_user_meta( $user_id, 'tdta_privacy', current_time( 'mysql' ) );
			update_user_meta( $user_id, 'tdta_benvenuto', 1 );
		}
		tdta_codice( $user_id );
		/* nel nostro modulo decide il campo "Codice amico" (vuoto = nessun
		   invito); nelle altre registrazioni vale il link aperto */
		if ( ! empty( $_POST['tdta_modulo'] ) ) {
			$invito = isset( $_POST['tdta_ref'] ) ? tdta_pulisci_codice( wp_unslash( $_POST['tdta_ref'] ) ) : '';
			$invito = ( '' !== $invito && tdta_utente_da_codice( $invito ) ) ? $invito : '';
		} else {
			$invito = tdta_codice_invito_corrente();
		}
		if ( $invito ) {
			/* il bonus va solo a chi ha invitato, e subito: alla registrazione
			   dell'amico (l'amico ha il 5% sul primo ordine, come tutti) */
			if ( tdta_associa_invito( $user_id, $invito ) ) {
				tdta_invito_valido( $user_id );
			}
			tdta_imposta_cookie( '', 0 );   /* l'invito e' stato usato */
		}
	}

	/** L'invito diventa valido e chi ha invitato riceve il suo bonus. Una
	    volta sola per amico: lo stato passa a "valido" prima del bonus. */
	function tdta_invito_valido( $cliente, $ordine_id = 0 ) {
		$cliente = (int) $cliente;
		if ( 'registrato' !== get_user_meta( $cliente, 'tdta_invito_stato', true ) ) {
			return false;
		}
		$da = (int) get_user_meta( $cliente, 'tdta_invitato_da', true );
		if ( ! $da || ! get_userdata( $da ) ) {
			update_user_meta( $cliente, 'tdta_invito_stato', 'non valido' );
			update_user_meta( $cliente, 'tdta_invito_motivo', 'l\'account di chi ha invitato non c\'e\' piu\'' );
			return false;
		}
		update_user_meta( $cliente, 'tdta_invito_stato', 'valido' );
		if ( $ordine_id ) {
			update_user_meta( $cliente, 'tdta_invito_ordine', (int) $ordine_id );
		}
		update_user_meta( $cliente, 'tdta_invito_valido_il', current_time( 'mysql' ) );
		tdta_crea_bonus( $da, $cliente, (int) $ordine_id );
		return true;
	}

	/** Un account viene associato una volta sola, e mai a se stesso. */
	function tdta_associa_invito( $user_id, $codice ) {
		$user_id = (int) $user_id;
		if ( get_user_meta( $user_id, 'tdta_invitato_da', true ) ) {
			return false;
		}
		$da = tdta_utente_da_codice( $codice );
		if ( ! $da || $da === $user_id ) {
			return false;
		}
		$nuovo  = get_userdata( $user_id );
		$amico  = get_userdata( $da );
		if ( ! $nuovo || ! $amico ) {
			return false;
		}
		$stato  = 'registrato';
		$motivo = '';
		/* la sua email di accesso o quella degli ordini: e' la stessa persona */
		$email_amico = array_filter( array( tdta_email_base( $amico->user_email ), tdta_email_base( get_user_meta( $da, 'billing_email', true ) ) ) );
		if ( in_array( tdta_email_base( $nuovo->user_email ), $email_amico, true ) ) {
			$stato  = 'non valido';
			$motivo = 'stessa email di chi ha invitato';
		} elseif ( tdta_era_gia_cliente( $nuovo->user_email ) ) {
			$stato  = 'non valido';
			$motivo = 'era gia\' cliente prima dell\'invito';
		}
		update_user_meta( $user_id, 'tdta_invitato_da', $da );
		update_user_meta( $user_id, 'tdta_invito_codice', tdta_pulisci_codice( $codice ) );
		update_user_meta( $user_id, 'tdta_invito_data', current_time( 'mysql' ) );
		update_user_meta( $user_id, 'tdta_invito_stato', $stato );
		if ( $motivo ) {
			update_user_meta( $user_id, 'tdta_invito_motivo', $motivo );
		}
		return true;
	}

	function tdta_era_gia_cliente( $email ) {
		if ( ! function_exists( 'wc_get_orders' ) || ! is_email( $email ) ) {
			return false;
		}
		$ordini = wc_get_orders(
			array(
				'billing_email' => $email,
				'status'        => array( 'wc-processing', 'wc-completed' ),
				'limit'         => 1,
				'return'        => 'ids',
			)
		);
		return ! empty( $ordini );
	}

	/* =====================================================================
	 * 5 · INVITI DI PRIMA DEL 29 SETTEMBRE 2026: IL BONUS AL PRIMO ORDINE
	 *     Allora il bonus arrivava al primo ordine pagato dell'amico. Gli
	 *     inviti nuovi sono validi gia' alla registrazione; quelli rimasti
	 *     "registrato" diventano validi qui, come era stato promesso.
	 * ===================================================================== */
	add_action( 'woocommerce_order_status_processing', 'tdta_ordine_pagato', 20, 2 );
	add_action( 'woocommerce_order_status_completed', 'tdta_ordine_pagato', 20, 2 );
	function tdta_ordine_pagato( $order_id, $order = null ) {
		$order = ( $order instanceof WC_Order ) ? $order : wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		$cliente = (int) $order->get_customer_id();
		if ( ! $cliente ) {
			$utente  = get_user_by( 'email', $order->get_billing_email() );
			$cliente = $utente ? (int) $utente->ID : 0;
		}
		if ( ! $cliente || 'registrato' !== get_user_meta( $cliente, 'tdta_invito_stato', true ) ) {
			return;
		}
		$da    = (int) get_user_meta( $cliente, 'tdta_invitato_da', true );
		$amico = $da ? get_userdata( $da ) : false;
		if ( ! $amico ) {
			update_user_meta( $cliente, 'tdta_invito_stato', 'non valido' );
			update_user_meta( $cliente, 'tdta_invito_motivo', 'l\'account di chi ha invitato non c\'e\' piu\'' );
			return;
		}
		/* lo stesso cliente con un secondo account? */
		$email_ordine = tdta_email_base( $order->get_billing_email() );
		$tel_ordine   = tdta_telefono_base( $order->get_billing_phone() );
		$email_amico  = array_filter( array( tdta_email_base( $amico->user_email ), tdta_email_base( get_user_meta( $da, 'billing_email', true ) ) ) );
		$tel_amico    = tdta_telefono_base( get_user_meta( $da, 'billing_phone', true ) );
		if ( in_array( $email_ordine, $email_amico, true ) || ( '' !== $tel_ordine && $tel_ordine === $tel_amico ) ) {
			update_user_meta( $cliente, 'tdta_invito_stato', 'non valido' );
			update_user_meta( $cliente, 'tdta_invito_motivo', 'ordine con l\'email o il telefono di chi ha invitato' );
			update_user_meta( $cliente, 'tdta_invito_ordine', $order->get_id() );
			return;
		}
		tdta_invito_valido( $cliente, $order->get_id() );
	}

	/* =====================================================================
	 * 6 · GLI SCONTI, CON I CODICI PROMOZIONALI DI WOOCOMMERCE
	 * ===================================================================== */

	/** Il primo ordine e' ancora da fare? Lo sconto di chi si registra vale
	    finche' l'account non ha un ordine fatto dopo la registrazione:
	    pagato, in attesa di bonifico, completato o rimborsato. Un pagamento
	    non riuscito, annullato o lasciato a meta' non lo consuma. */
	function tdta_primo_ordine_libero( $user_id ) {
		$user_id = (int) $user_id;
		$utente  = $user_id > 0 ? get_userdata( $user_id ) : false;
		if ( ! $utente || ! function_exists( 'wc_get_orders' ) ) {
			return false;
		}
		$args = array(
			'customer_id' => $user_id,
			'status'      => array( 'wc-processing', 'wc-completed', 'wc-on-hold', 'wc-refunded' ),
			'limit'       => 1,
			'return'      => 'ids',
		);
		/* contano gli ordini da registrato, non quelli fatti prima come ospite */
		$da = strtotime( $utente->user_registered . ' UTC' );
		if ( $da ) {
			$args['date_created'] = '>=' . $da;
		}
		return ! wc_get_orders( $args );
	}

	/* lo sconto del primo ordine: un codice virtuale, lo definisce questo frammento */
	add_filter( 'woocommerce_get_shop_coupon_data', 'tdta_coupon_membri', 10, 3 );
	function tdta_coupon_membri( $dati, $codice, $coupon = null ) {
		$cfg = tdta_config();
		if ( false !== $dati || strtolower( (string) $codice ) !== $cfg['coupon_membri'] ) {
			return $dati;
		}
		return array(
			'discount_type'        => 'percent',
			'amount'               => $cfg['sconto_membri'],
			'individual_use'       => false,
			'usage_limit'          => 0,
			'usage_limit_per_user' => 0,
			'free_shipping'        => false,
			'exclude_sale_items'   => false,
			'description'          => 'Sconto primo ordine The Double Twenty',
		);
	}

	function tdta_e_membri( $codice ) {
		$cfg = tdta_config();
		return strtolower( (string) $codice ) === $cfg['coupon_membri'];
	}

	/** Il proprietario del bonus (0 se non e' un bonus amico). */
	function tdta_proprietario_bonus( $coupon ) {
		if ( ! $coupon instanceof WC_Coupon ) {
			$coupon = new WC_Coupon( $coupon );
		}
		return $coupon->get_id() ? (int) $coupon->get_meta( 'tdta_bonus_utente' ) : 0;
	}

	function tdta_e_nostro( $coupon ) {
		$codice = $coupon instanceof WC_Coupon ? $coupon->get_code() : (string) $coupon;
		return tdta_e_membri( $codice ) || tdta_proprietario_bonus( $coupon ) > 0;
	}

	/** Il tipo di bonus: "invito" (per chi ha invitato) o "benvenuto" (per chi si e' registrato con il codice). */
	function tdta_tipo_bonus( $coupon ) {
		if ( ! $coupon instanceof WC_Coupon ) {
			$coupon = new WC_Coupon( $coupon );
		}
		return 'benvenuto' === $coupon->get_meta( 'tdta_bonus_tipo' ) ? 'benvenuto' : 'invito';
	}

	/** Un codice vero, monouso, legato a un account: il premio di chi ha
	    invitato ($tipo "invito"). Il tipo "benvenuto" (per chi si registrava
	    con il codice di un amico) dal 29 settembre 2026 non si crea piu':
	    resta qui per leggere quelli gia' dati. */
	function tdta_crea_bonus( $proprietario, $amico, $ordine_id, $tipo = 'invito' ) {
		$cfg      = tdta_config();
		$alfabeto = '23456789abcdefghjkmnpqrstuvwxyz';
		do {
			$codice = 'bonus-';
			for ( $i = 0; $i < 8; $i++ ) {
				$codice .= $alfabeto[ random_int( 0, strlen( $alfabeto ) - 1 ) ];
			}
		} while ( wc_get_coupon_id_by_code( $codice ) );

		$chi   = get_userdata( $proprietario );
		$nuovo = get_userdata( $amico );
		$c     = new WC_Coupon();
		$c->set_code( $codice );
		$c->set_discount_type( 'percent' );
		$c->set_amount( $cfg['bonus_amico'] );
		$c->set_individual_use( false );
		$c->set_usage_limit( 1 );
		$c->set_usage_limit_per_user( 1 );
		$di = $chi ? $chi->display_name . ' (' . $chi->user_email . ')' : '#' . $proprietario;
		$c->set_description(
			'benvenuto' === $tipo
				? 'Invita un amico: benvenuto di ' . $di . ', registrato con il codice di ' . ( $nuovo ? $nuovo->display_name : '#' . $amico )
				: 'Invita un amico: bonus di ' . $di . ' per ' . ( $nuovo ? $nuovo->display_name : '#' . $amico )
					. ( $ordine_id ? ', ordine #' . (int) $ordine_id : ', alla registrazione' )
		);
		$c->update_meta_data( 'tdta_bonus_utente', (int) $proprietario );
		$c->update_meta_data( 'tdta_bonus_amico', (int) $amico );
		$c->update_meta_data( 'tdta_bonus_ordine', (int) $ordine_id );
		$c->update_meta_data( 'tdta_bonus_tipo', 'benvenuto' === $tipo ? 'benvenuto' : 'invito' );
		return $c->save();
	}

	/** I bonus di un account: tutti, quelli ancora da usare, quanti usati,
	    e quanti vengono dagli inviti (i risultati) e dal benvenuto. */
	function tdta_bonus( $user_id ) {
		$r   = array( 'tutti' => 0, 'liberi' => array(), 'usati' => 0, 'da_inviti' => 0, 'benvenuto_liberi' => 0 );
		$ids = get_posts(
			array(
				'post_type'   => 'shop_coupon',
				'post_status' => 'publish',
				'numberposts' => -1,
				'fields'      => 'ids',
				'meta_key'    => 'tdta_bonus_utente',
				'meta_value'  => (int) $user_id,
				'orderby'     => 'ID',
				'order'       => 'ASC',
			)
		);
		foreach ( $ids as $id ) {
			$c    = new WC_Coupon( $id );
			$tipo = tdta_tipo_bonus( $c );
			$r['tutti']++;
			if ( 'invito' === $tipo ) {
				$r['da_inviti']++;
			}
			if ( $c->get_usage_count() < max( 1, (int) $c->get_usage_limit() ) ) {
				$r['liberi'][] = $c;
				if ( 'benvenuto' === $tipo ) {
					$r['benvenuto_liberi']++;
				}
			} else {
				$r['usati']++;
			}
		}
		return $r;
	}

	/* chi puo' usare cosa: il primo ordine solo con l'accesso e una volta,
	   il bonus solo il suo proprietario e uno per ordine */
	add_filter( 'woocommerce_coupon_is_valid', 'tdta_coupon_valido', 10, 3 );
	function tdta_coupon_valido( $valido, $coupon, $sconti = null ) {
		if ( ! $valido || ! $coupon instanceof WC_Coupon ) {
			return $valido;
		}
		if ( tdta_e_membri( $coupon->get_code() ) ) {
			if ( ! is_user_logged_in() ) {
				throw new Exception( 'Lo sconto del primo ordine è riservato a chi ha un account: accedi o registrati.', 100 );
			}
			if ( ! tdta_primo_ordine_libero( get_current_user_id() ) ) {
				throw new Exception( 'Lo sconto per chi si registra vale sul primo ordine, e l&rsquo;hai già usato.', 100 );
			}
			return $valido;
		}
		$proprietario = tdta_proprietario_bonus( $coupon );
		if ( ! $proprietario ) {
			return $valido;
		}
		if ( get_current_user_id() !== $proprietario ) {
			throw new Exception( 'Questo bonus appartiene a un altro account.', 100 );
		}
		if ( function_exists( 'WC' ) && WC()->cart ) {
			foreach ( WC()->cart->get_applied_coupons() as $altro ) {
				if ( strtolower( $altro ) !== strtolower( $coupon->get_code() ) && tdta_proprietario_bonus( $altro ) ) {
					throw new Exception( 'Puoi usare un solo bonus amico per ordine: gli altri restano per i prossimi.', 100 );
				}
			}
		}
		return $valido;
	}

	/** Applica un codice senza avvisi, solo se e' valido. */
	function tdta_applica_zitto( $codice ) {
		$cart = WC()->cart;
		if ( $cart->has_discount( $codice ) ) {
			return true;
		}
		$coupon = new WC_Coupon( $codice );
		$esito  = ( new WC_Discounts( $cart ) )->is_coupon_valid( $coupon );
		if ( is_wp_error( $esito ) || ! $esito ) {
			return false;
		}
		return (bool) $cart->apply_coupon( $codice );
	}

	/* i vantaggi entrano da soli nel carrello di chi ha fatto l'accesso */
	add_action( 'woocommerce_cart_loaded_from_session', 'tdta_applica_vantaggi', 20 );
	add_action( 'woocommerce_add_to_cart', 'tdta_applica_vantaggi', 20 );
	function tdta_applica_vantaggi() {
		static $in_corso = false;
		if ( $in_corso || ( is_admin() && ! wp_doing_ajax() ) || ! is_user_logged_in() ) {
			return;
		}
		if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
			return;
		}
		$in_corso = true;
		$cfg      = tdta_config();
		if ( tdta_primo_ordine_libero( get_current_user_id() ) ) {
			tdta_applica_zitto( $cfg['coupon_membri'] );
		} elseif ( WC()->cart->has_discount( $cfg['coupon_membri'] ) ) {
			/* primo ordine gia' fatto: via in silenzio, prima che WooCommerce lo
			   tolga con un avviso che mostra il codice interno */
			WC()->cart->remove_coupon( $cfg['coupon_membri'] );
		}
		$gia = false;
		foreach ( WC()->cart->get_applied_coupons() as $applicato ) {
			if ( tdta_proprietario_bonus( $applicato ) ) {
				$gia = true;
				break;
			}
		}
		if ( ! $gia ) {
			$bonus = tdta_bonus( get_current_user_id() );
			foreach ( $bonus['liberi'] as $c ) {
				if ( tdta_applica_zitto( $c->get_code() ) ) {
					break;
				}
			}
		}
		$in_corso = false;
	}

	/* niente "codice applicato" per i nostri: entrano da soli */
	add_filter( 'woocommerce_coupon_message', 'tdta_zitto_messaggio', 10, 3 );
	function tdta_zitto_messaggio( $messaggio, $codice_msg, $coupon = null ) {
		return ( $coupon instanceof WC_Coupon && tdta_e_nostro( $coupon ) ) ? '' : $messaggio;
	}

	/* come si leggono in carrello e in cassa */
	add_filter( 'woocommerce_cart_totals_coupon_label', 'tdta_etichetta_sconto', 10, 2 );
	function tdta_etichetta_sconto( $etichetta, $coupon ) {
		if ( ! $coupon instanceof WC_Coupon ) {
			return $etichetta;
		}
		if ( tdta_e_membri( $coupon->get_code() ) ) {
			return 'Sconto primo ordine &minus;' . tdta_pct( $coupon->get_amount() ) . '%';
		}
		if ( tdta_proprietario_bonus( $coupon ) ) {
			return ( 'benvenuto' === tdta_tipo_bonus( $coupon ) ? 'Bonus benvenuto' : 'Bonus amico' )
				. ' &minus;' . tdta_pct( $coupon->get_amount() ) . '%';
		}
		return $etichetta;
	}

	/* e senza "[Rimuovi]": li rimetterebbe comunque il carrello */
	add_filter( 'woocommerce_cart_totals_coupon_html', 'tdta_riga_sconto', 10, 3 );
	function tdta_riga_sconto( $html, $coupon, $importo_html = '' ) {
		return ( $coupon instanceof WC_Coupon && tdta_e_nostro( $coupon ) && '' !== $importo_html ) ? $importo_html : $html;
	}

	/* =====================================================================
	 * 7 · L'AREA CLIENTI: PAGINA, MODULI, DASHBOARD
	 * ===================================================================== */
	function tdta_e_area() {
		return function_exists( 'is_account_page' ) && is_account_page();
	}

	/* la classe va sul <body> dal server: il vestito c'e' gia' nel primo disegno */
	add_filter( 'body_class', 'tdta_classe_body' );
	function tdta_classe_body( $classi ) {
		if ( tdta_e_area() ) {
			$classi[] = 'tdta';
			/* da telefono la registrazione va per prima: per chi arriva da un
			   invito e per chi ha toccato "Crea il tuo account" nel carrello */
			$registrati = isset( $_GET['tdta_vista'] ) && 'registrati' === $_GET['tdta_vista'];
			if ( ! is_user_logged_in() && ( $registrati || tdta_codice_invito_corrente() ) ) {
				$classi[] = 'tdta-prima-registrazione';
			}
		}
		return $classi;
	}

	add_action( 'wp_enqueue_scripts', 'tdta_risorse', 20 );
	function tdta_risorse() {
		if ( ! tdta_e_area() ) {
			return;
		}
		wp_register_style( 'tdta', false, array(), null );
		wp_enqueue_style( 'tdta' );
		wp_add_inline_style( 'tdta', tdta_css() );

		wp_register_script( 'tdta', false, array(), null, true );
		wp_enqueue_script( 'tdta' );
		wp_add_inline_script(
			'tdta',
			'var TDTA=' . wp_json_encode(
				array(
					'copiato'       => 'Link copiato ✓',
					'codiceCopiato' => 'Codice copiato ✓',
					'nonCopiato'    => 'Copia non riuscita: tieni premuto sul link',
				)
			) . ';',
			'before'
		);
		wp_add_inline_script( 'tdta', tdta_js() );
	}

	/* i pezzi di WooCommerce da sostituire: dopo il suo caricamento */
	add_action( 'wp', 'tdta_aggancia_area' );
	function tdta_aggancia_area() {
		if ( ! tdta_e_area() ) {
			return;
		}
		/* la dashboard e' la nostra; gli altri pezzi dell'area restano di WooCommerce */
		remove_action( 'woocommerce_account_content', 'woocommerce_account_content' );
		add_action( 'woocommerce_account_content', 'tdta_contenuto' );
		/* la spunta privacy/termini fa gia' il suo lavoro */
		remove_action( 'woocommerce_register_form', 'wc_registration_privacy_policy_text', 20 );
	}

	function tdta_intestazione( $titolo, $sotto = '' ) {
		echo '<div class="tdta__head">'
			. '<span class="tdta__occhiello">Il tuo account</span>'
			. '<h1 class="tdta__titolo">' . esc_html( $titolo ) . '</h1>'
			. ( $sotto ? '<p class="tdta__sotto">' . esc_html( $sotto ) . '</p>' : '' )
			. '</div>';
	}

	add_action( 'woocommerce_before_customer_login_form', 'tdta_testa_accesso', 5 );
	function tdta_testa_accesso() {
		$cfg = tdta_config();
		tdta_intestazione(
			'Accedi o crea il tuo account',
			'Con un account hai il ' . tdta_pct( $cfg['sconto_membri'] ) . '% sul primo ordine e un link personale per invitare i tuoi amici: per ognuno che si registra, un bonus del ' . tdta_pct( $cfg['bonus_amico'] ) . '% per te.'
		);
	}

	add_action( 'woocommerce_before_lost_password_form', 'tdta_testa_password', 5 );
	add_action( 'woocommerce_before_lost_password_confirmation_message', 'tdta_testa_password', 5 );
	function tdta_testa_password() {
		tdta_intestazione( 'Password dimenticata?' );
	}

	add_action( 'woocommerce_before_reset_password_form', 'tdta_testa_nuova_password', 5 );
	function tdta_testa_nuova_password() {
		tdta_intestazione( 'Scegli una nuova password' );
	}

	/* prima della navigazione: il saluto nella dashboard, il titolo altrove */
	add_action( 'woocommerce_account_navigation', 'tdta_testa_area', 5 );
	function tdta_testa_area() {
		$endpoint = WC()->query->get_current_endpoint();
		if ( '' === $endpoint ) {
			$utente = wp_get_current_user();
			$nome   = $utente->first_name ? $utente->first_name : $utente->display_name;
			tdta_intestazione( $nome ? 'Ciao, ' . $nome : 'Ciao!' );
			return;
		}
		$titolo = WC()->query->get_endpoint_title( $endpoint );
		tdta_intestazione( $titolo ? wp_strip_all_tags( $titolo ) : 'Il tuo account' );
	}

	add_filter( 'woocommerce_account_menu_items', 'tdta_voci_menu', 20, 1 );
	function tdta_voci_menu( $voci ) {
		if ( isset( $voci['dashboard'] ) ) {
			$voci['dashboard'] = 'Il tuo account';
		}
		unset( $voci['downloads'] );   /* nessun prodotto da scaricare */
		return $voci;
	}

	function tdta_contenuto() {
		if ( '' === WC()->query->get_current_endpoint() ) {
			tdta_dashboard();
			return;
		}
		woocommerce_account_content();
	}

	function tdta_amici( $user_id ) {
		$r   = array( 'registrati' => 0, 'attesa' => 0, 'validi' => 0 );
		$ids = get_users(
			array(
				'meta_key'    => 'tdta_invitato_da',
				'meta_value'  => (int) $user_id,
				'fields'      => 'ID',
				'number'      => 1000,
				'count_total' => false,
			)
		);
		foreach ( $ids as $id ) {
			$stato = get_user_meta( $id, 'tdta_invito_stato', true );
			if ( 'non valido' === $stato ) {
				continue;   /* un secondo account della stessa persona non e' un amico */
			}
			$r['registrati']++;
			if ( 'valido' === $stato ) {
				$r['validi']++;
			} else {
				$r['attesa']++;
			}
		}
		return $r;
	}

	function tdta_dashboard() {
		$uid    = get_current_user_id();
		$cfg    = tdta_config();
		$amici  = tdta_amici( $uid );
		$bonus  = tdta_bonus( $uid );
		$liberi = count( $bonus['liberi'] );
		$link   = tdta_link( $uid );
		$codice = tdta_codice( $uid );
		$visite = max( (int) get_user_meta( $uid, 'tdta_visite', true ), $amici['registrati'] );
		$primo  = tdta_primo_ordine_libero( $uid );
		$totale = ( $primo ? $cfg['sconto_membri'] : 0 ) + ( $liberi ? $cfg['bonus_amico'] : 0 );
		$m      = tdta_pct( $cfg['sconto_membri'] );
		$b      = tdta_pct( $cfg['bonus_amico'] );
		$reg    = 1 === $amici['registrati'] ? '1 amico registrato' : $amici['registrati'] . ' amici registrati';

		echo '<div class="tdta-dash">';

		$benvenuto = (int) get_user_meta( $uid, 'tdta_benvenuto', true );
		if ( $benvenuto ) {
			delete_user_meta( $uid, 'tdta_benvenuto' );
			echo '<div class="tdta-benvenuto" role="status">'
				. '<span class="tdta-benvenuto__segno" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.4l3.2 3.2L13 5"/></svg></span>'
				. '<div><strong>Benvenuto in The Double Twenty.</strong>'
				. '<span>' . ( $primo
					? 'Il tuo sconto del ' . esc_html( $m ) . '% sul primo ordine è attivo: si applica da solo in cassa.'
					: 'Il tuo account è pronto.' )
				. '</span></div>'
				. '</div>';
		}

		/* le tre schede */
		if ( $liberi && $bonus['benvenuto_liberi'] === $liberi ) {
			/* solo il bonus di benvenuto (registrato con il codice di un amico) */
			$bonus_stato  = '<span class="tdta-stato is-on">Disponibile</span>';
			$bonus_nota   = 'Bonus di benvenuto, sul tuo primo ordine';
			$bonus_spento = '';
		} elseif ( $liberi ) {
			$bonus_stato = '<span class="tdta-stato is-on">Disponibile</span>';
			$bonus_nota  = $reg . ( $liberi > 1 ? ' · ' . $liberi . ' bonus, uno per ordine' : '' );
			$bonus_spento = '';
		} elseif ( $amici['attesa'] ) {
			$bonus_stato  = '<span class="tdta-stato">In arrivo</span>';
			$bonus_nota   = $reg . ' · arriva con il suo primo ordine';
			$bonus_spento = ' tdta-card--spento';
		} else {
			$bonus_stato  = '<span class="tdta-stato">Da sbloccare</span>';
			$bonus_nota   = $amici['registrati'] ? $reg : 'Invita un amico qui sotto';
			$bonus_spento = ' tdta-card--spento';
		}

		echo '<section class="tdta-vantaggi" aria-label="I tuoi vantaggi">';
		echo '<article class="tdta-card' . ( $primo ? '' : ' tdta-card--spento' ) . '">'
			. '<span class="tdta-card__label">Sconto primo ordine</span>'
			. '<strong class="tdta-card__num">&minus;' . esc_html( $m ) . '%</strong>'
			. '<span class="tdta-card__piede">'
			. ( $primo ? '<span class="tdta-stato is-on">Attivo</span>' : '<span class="tdta-stato">Usato</span>' )
			. 'sul tuo primo ordine</span>'
			. '</article>';
		echo '<article class="tdta-card' . esc_attr( $bonus_spento ) . '">'
			. '<span class="tdta-card__label">Bonus referral</span>'
			. '<strong class="tdta-card__num">+' . esc_html( $b ) . '%</strong>'
			. '<span class="tdta-card__piede">' . $bonus_stato . esc_html( $bonus_nota ) . '</span>'
			. '</article>';
		echo '<article class="tdta-card tdta-card--totale' . ( $totale ? '' : ' tdta-card--spento' ) . '">'
			. '<span class="tdta-card__label">I tuoi vantaggi</span>'
			. '<strong class="tdta-card__num">' . esc_html( tdta_pct( $totale ) ) . '%</strong>'
			. '<span class="tdta-card__piede">'
			. ( $totale
				? '<span class="tdta-stato is-on">Disponibile</span>sul prossimo ordine'
				: '<span class="tdta-stato">Per ora nessuno</span>invita un amico: ' . esc_html( $b ) . '% per ognuno' )
			. '</span>'
			. '</article>';
		echo '</section>';

		/* invita un amico */
		if ( $link ) {
			$testo_invito = 'Ti consiglio The Double Twenty: registrati con il mio link, oppure con il mio codice ' . $codice
				. ', e avrai il ' . $m . '% di sconto sul primo ordine.';
			$messaggio    = $testo_invito . ' ' . $link;
			echo '<section class="tdta-invita" aria-labelledby="tdta-invita-t" data-tdta-messaggio="' . esc_attr( $testo_invito ) . '">'
				. '<div class="tdta-invita__testo">'
				. '<span class="tdta__occhiello">Invita un amico</span>'
				. '<h2 id="tdta-invita-t">Condividi il tuo link personale</h2>'
				. '<p>Per ogni amico che si registra con il tuo link ricevi subito un bonus del ' . esc_html( $b ) . '% da usare su un ordine. Il tuo amico, come tutti i nuovi iscritti, ha il ' . esc_html( $m ) . '% sul primo ordine.</p>'
				. '</div>'
				. '<div class="tdta-invita__azione">'
				. '<label class="tdta-link__label" for="tdta-link">Il tuo link personale</label>'
				. '<input class="tdta-link" id="tdta-link" type="text" readonly value="' . esc_attr( $link ) . '" data-tdta-link />'
				. '<div class="tdta-azioni">'
				. '<button type="button" class="tdta-btn tdta-btn--nero" data-tdta-copia><span data-tdta-testo>Copia link</span></button>'
				. '<a class="tdta-btn" href="' . esc_url( 'https://wa.me/?text=' . rawurlencode( $messaggio ) ) . '" target="_blank" rel="noopener" data-tdta-whatsapp>'
				. '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.16-1.5A9.92 9.92 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.07.9.92-3-.2-.31a8.19 8.19 0 1 1 6.83 3.74Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.77.96-.14.17-.28.19-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.04c0 1.2.88 2.37 1 2.53.12.17 1.73 2.64 4.2 3.7 1.56.67 2.17.73 2.95.61.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>'
				. 'WhatsApp</a>'
				. '<button type="button" class="tdta-btn" data-tdta-condividi>'
				. '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M8 11H6.5A1.5 1.5 0 0 0 5 12.5v7A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H16"/></svg>'
				. '<span data-tdta-testo>Condividi</span></button>'
				. '</div>'
				. '<p class="tdta-codice">Oppure dagli il tuo codice '
				. '<button type="button" class="tdta-codice__b" data-tdta-copia-codice="' . esc_attr( $codice ) . '" title="Copia il codice">'
				. '<span data-tdta-testo>' . esc_html( $codice ) . '</span></button></p>'
				. '</div>'
				. '</section>';
		}

		/* i risultati */
		echo '<section class="tdta-risultati" aria-labelledby="tdta-risultati-t">'
			. '<span class="tdta__occhiello" id="tdta-risultati-t">I tuoi risultati</span>'
			. '<dl>'
			. '<div><dt>Amici invitati</dt><dd>' . esc_html( number_format_i18n( $visite ) ) . '</dd></div>'
			. '<div><dt>Registrazioni</dt><dd>' . esc_html( number_format_i18n( $amici['registrati'] ) ) . '</dd></div>'
			. '<div><dt>Bonus ottenuti</dt><dd>' . esc_html( tdta_pct( $bonus['da_inviti'] * $cfg['bonus_amico'] ) ) . '%</dd></div>'
			. '</dl>'
			. '</section>';

		echo '</div>';
	}

	/* =====================================================================
	 * 7b · IL PROMEMORIA IN CIMA AL CARRELLO
	 *      Solo per chi non ha fatto l'accesso: con un account avrebbe il
	 *      5% in piu' sul primo ordine. Dopo la registrazione o l'accesso si
	 *      torna dritti al carrello, dove lo sconto e' gia' nel riepilogo.
	 * ===================================================================== */
	function tdta_link_area( $vista = '' ) {
		$args = array( 'tdta_torna' => 'carrello' );
		if ( $vista ) {
			$args['tdta_vista'] = $vista;
		}
		return add_query_arg( $args, wc_get_page_permalink( 'myaccount' ) );
	}

	/* Il vestito del carrello (tdt-carrello) dal 28 settembre ha un promemoria
	   suo, con gli stessi testi: se c'e' quello, questo si fa da parte (mai due
	   promemoria), e i suoi pulsanti portano alla registrazione con il ritorno
	   al carrello. Se c'e' il carrello di prima, esce questo. */
	function tdta_promemoria_del_carrello() {
		return function_exists( 'tdt_carrello_promemoria' );
	}

	add_filter( 'tdt_carrello_config', 'tdta_link_promemoria_carrello', 20 );
	function tdta_link_promemoria_carrello( $cfg ) {
		if ( is_array( $cfg ) && function_exists( 'wc_get_page_permalink' ) ) {
			$cfg['account'] = tdta_link_area( 'registrati' );
			/* le regole dello sconto le decide questo frammento: il suo
			   promemoria deve dire che il 5% vale sul primo ordine */
			if ( ! empty( $cfg['testi']['socio'] ) && is_array( $cfg['testi']['socio'] ) ) {
				$p = tdta_pct( tdta_config()['sconto_membri'] );
				$cfg['testi']['socio']['titolo'] = 'Registrati e ottieni un ulteriore <b>' . $p . '% di sconto</b> sul primo ordine';
				$cfg['testi']['socio']['sotto']  = 'Crea il tuo account gratuito: il ' . $p . '% si somma agli altri sconti.';
			}
		}
		return $cfg;
	}

	/* dopo il titolo del carrello (priorita' 5) e prima degli avvisi (10) */
	add_action( 'woocommerce_before_cart', 'tdta_promemoria_carrello', 8 );
	function tdta_promemoria_carrello() {
		if ( is_user_logged_in() || tdta_promemoria_del_carrello() ) {
			return;
		}
		$cfg = tdta_config();
		$p   = tdta_pct( $cfg['sconto_membri'] );
		echo '<aside class="tdta-promemoria" aria-label="Sconto per chi si registra">'
			. '<strong class="tdta-promemoria__num">&minus;' . esc_html( $p ) . '%</strong>'
			. '<div class="tdta-promemoria__testo">'
			. '<span class="tdta-promemoria__label">Sconto per chi si registra</span>'
			. '<p class="tdta-promemoria__titolo">Registrati e risparmi un ulteriore ' . esc_html( $p ) . '% sul primo ordine</p>'
			. '<p class="tdta-promemoria__sotto">Si aggiunge agli sconti del carrello, già su questo ordine.</p>'
			. '</div>'
			. '<div class="tdta-promemoria__azioni">'
			. '<a class="tdta-promemoria__btn" href="' . esc_url( tdta_link_area( 'registrati' ) ) . '">Crea il tuo account</a>'
			. '<span class="tdta-promemoria__accedi">Hai già un account? <a href="' . esc_url( tdta_link_area() ) . '">Accedi</a></span>'
			. '</div>'
			. '</aside>';
	}

	add_action( 'wp_enqueue_scripts', 'tdta_risorse_carrello', 21 );
	function tdta_risorse_carrello() {
		if ( is_user_logged_in() || tdta_promemoria_del_carrello() || ! function_exists( 'is_cart' ) || ! is_cart() ) {
			return;
		}
		wp_register_style( 'tdta-promemoria', false, array(), null );
		wp_enqueue_style( 'tdta-promemoria' );
		wp_add_inline_style( 'tdta-promemoria', tdta_css_promemoria() );
	}

	/* arrivati dal promemoria: accesso e registrazione riportano al carrello
	   (WooCommerce segue il campo "redirect", se e' un indirizzo del sito) */
	add_action( 'woocommerce_login_form', 'tdta_ritorno_carrello' );
	add_action( 'woocommerce_register_form', 'tdta_ritorno_carrello', 30 );
	function tdta_ritorno_carrello() {
		if ( isset( $_GET['tdta_torna'] ) && 'carrello' === $_GET['tdta_torna'] ) {
			echo '<input type="hidden" name="redirect" value="' . esc_url( wc_get_cart_url() ) . '" />';
		}
	}

	/* =====================================================================
	 * 8 · IN BACHECCA: WOOCOMMERCE > INVITA UN AMICO
	 * ===================================================================== */
	add_action( 'admin_menu', 'tdta_menu_admin', 60 );
	function tdta_menu_admin() {
		add_submenu_page( 'woocommerce', 'Invita un amico', 'Invita un amico', 'manage_woocommerce', 'tdt-invita-amico', 'tdta_pagina_admin' );
	}

	function tdta_admin_nome( $user_id ) {
		$u = get_userdata( $user_id );
		if ( ! $u ) {
			return '<span style="color:#8a8a8a">account cancellato</span>';
		}
		return '<a href="' . esc_url( get_edit_user_link( $u->ID ) ) . '"><strong>' . esc_html( $u->display_name ) . '</strong></a><br><span style="color:#646970">' . esc_html( $u->user_email ) . '</span>';
	}

	function tdta_pagina_admin() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		$membri = get_users(
			array(
				'meta_query' => array(
					'relation' => 'OR',
					array( 'key' => 'tdta_codice', 'compare' => 'EXISTS' ),
					array( 'key' => 'tdta_invitato_da', 'compare' => 'EXISTS' ),
				),
				'orderby'    => 'registered',
				'order'      => 'DESC',
				'number'     => 1000,
			)
		);

		/* inviti per chi ha invitato */
		$inviti = array();
		$storia = array();
		foreach ( $membri as $u ) {
			$da = (int) get_user_meta( $u->ID, 'tdta_invitato_da', true );
			if ( ! $da ) {
				continue;
			}
			$stato = (string) get_user_meta( $u->ID, 'tdta_invito_stato', true );
			if ( ! isset( $inviti[ $da ] ) ) {
				$inviti[ $da ] = array( 'registrati' => 0, 'validi' => 0 );
			}
			if ( 'non valido' !== $stato ) {
				$inviti[ $da ]['registrati']++;
			}
			if ( 'valido' === $stato ) {
				$inviti[ $da ]['validi']++;
			}
			$storia[] = array(
				'data'   => (string) get_user_meta( $u->ID, 'tdta_invito_data', true ),
				'nuovo'  => $u->ID,
				'da'     => $da,
				'stato'  => $stato,
				'motivo' => (string) get_user_meta( $u->ID, 'tdta_invito_motivo', true ),
				'ordine' => (int) get_user_meta( $u->ID, 'tdta_invito_ordine', true ),
				'benv'   => (int) get_user_meta( $u->ID, 'tdta_benvenuto_bonus', true ),
			);
		}
		usort(
			$storia,
			function ( $a, $b ) {
				return strcmp( $b['data'], $a['data'] );
			}
		);

		/* bonus per proprietario */
		$bonus = array();
		$ids   = get_posts(
			array(
				'post_type'   => 'shop_coupon',
				'post_status' => 'publish',
				'numberposts' => -1,
				'fields'      => 'ids',
				'meta_key'    => 'tdta_bonus_utente',
			)
		);
		foreach ( $ids as $id ) {
			$c = new WC_Coupon( $id );
			$p = (int) $c->get_meta( 'tdta_bonus_utente' );
			if ( ! isset( $bonus[ $p ] ) ) {
				$bonus[ $p ] = array( 'maturati' => 0, 'usati' => 0 );
			}
			$bonus[ $p ]['maturati']++;
			if ( $c->get_usage_count() >= max( 1, (int) $c->get_usage_limit() ) ) {
				$bonus[ $p ]['usati']++;
			}
		}

		$tot = array( 'membri' => count( $membri ), 'registrati' => 0, 'validi' => 0, 'maturati' => 0, 'usati' => 0 );
		foreach ( $inviti as $i ) {
			$tot['registrati'] += $i['registrati'];
			$tot['validi']     += $i['validi'];
		}
		foreach ( $bonus as $bb ) {
			$tot['maturati'] += $bb['maturati'];
			$tot['usati']    += $bb['usati'];
		}
		$cfg = tdta_config();

		echo '<div class="wrap"><h1>Invita un amico</h1>';
		echo '<p style="max-width:760px;color:#50575e">Chi si registra ha il ' . esc_html( tdta_pct( $cfg['sconto_membri'] ) ) . '% sul primo ordine (si applica da solo quando ha fatto l&rsquo;accesso; dal secondo ordine no). '
			. 'L&rsquo;invito diventa <strong>valido</strong> quando l&rsquo;amico si registra e dà subito a chi ha invitato un bonus del ' . esc_html( tdta_pct( $cfg['bonus_amico'] ) ) . '% (un codice monouso, uno per ordine), per ogni amico; non vale se l&rsquo;email è quella di chi invita o se l&rsquo;amico era già cliente. '
			. 'Gli inviti registrati prima del 29 settembre 2026 diventano validi al primo ordine pagato dell&rsquo;amico, come allora. '
			. 'Chi si registra con un invito non ha altri sconti oltre al ' . esc_html( tdta_pct( $cfg['sconto_membri'] ) ) . '% del primo ordine. '
			. 'I bonus sono anche in Marketing &gt; Codici promozionali, con la descrizione &ldquo;Invita un amico&rdquo;.</p>';

		echo '<div style="display:flex;flex-wrap:wrap;gap:12px;margin:18px 0 26px">';
		foreach ( array( 'Membri' => $tot['membri'], 'Amici registrati' => $tot['registrati'], 'Inviti validi' => $tot['validi'], 'Bonus maturati' => $tot['maturati'], 'Bonus usati' => $tot['usati'] ) as $etichetta => $numero ) {
			echo '<div style="min-width:150px;padding:14px 18px;background:#fff;border:1px solid #dcdcde;border-radius:10px">'
				. '<div style="font-size:12px;color:#646970;text-transform:uppercase;letter-spacing:.06em">' . esc_html( $etichetta ) . '</div>'
				. '<div style="font-size:26px;font-weight:600;margin-top:4px">' . esc_html( number_format_i18n( $numero ) ) . '</div></div>';
		}
		echo '</div>';

		echo '<h2>Clienti</h2><table class="widefat striped"><thead><tr>'
			. '<th>Cliente</th><th>Codice</th><th>Invitato da</th><th>Visite al link</th><th>Amici registrati</th><th>Inviti validi</th><th>Bonus maturati</th><th>Bonus usati</th>'
			. '</tr></thead><tbody>';
		if ( ! $membri ) {
			echo '<tr><td colspan="8">Ancora nessun cliente con l&rsquo;area account.</td></tr>';
		}
		foreach ( $membri as $u ) {
			$da = (int) get_user_meta( $u->ID, 'tdta_invitato_da', true );
			$i  = isset( $inviti[ $u->ID ] ) ? $inviti[ $u->ID ] : array( 'registrati' => 0, 'validi' => 0 );
			$bb = isset( $bonus[ $u->ID ] ) ? $bonus[ $u->ID ] : array( 'maturati' => 0, 'usati' => 0 );
			echo '<tr>'
				. '<td>' . tdta_admin_nome( $u->ID ) . '</td>'
				. '<td><code>' . esc_html( tdta_codice( $u->ID, false ) ) . '</code></td>'
				. '<td>' . ( $da ? tdta_admin_nome( $da ) : '&mdash;' ) . '</td>'
				. '<td>' . esc_html( number_format_i18n( (int) get_user_meta( $u->ID, 'tdta_visite', true ) ) ) . '</td>'
				. '<td>' . esc_html( $i['registrati'] ) . '</td>'
				. '<td>' . esc_html( $i['validi'] ) . '</td>'
				. '<td>' . esc_html( $bb['maturati'] ) . '</td>'
				. '<td>' . esc_html( $bb['usati'] ) . '</td>'
				. '</tr>';
		}
		echo '</tbody></table>';

		echo '<h2 style="margin-top:32px">Storico degli inviti</h2><table class="widefat striped"><thead><tr>'
			. '<th>Data</th><th>Nuovo cliente</th><th>Invitato da</th><th>Stato</th><th>Ordine</th>'
			. '</tr></thead><tbody>';
		if ( ! $storia ) {
			echo '<tr><td colspan="5">Ancora nessun invito.</td></tr>';
		}
		$etichette = array( 'registrato' => 'Registrato: aspetta il primo ordine', 'valido' => 'Valido: bonus dato', 'non valido' => 'Non valido' );
		foreach ( $storia as $s ) {
			$ordine = $s['ordine'] ? wc_get_order( $s['ordine'] ) : false;
			echo '<tr>'
				. '<td>' . esc_html( $s['data'] ? mysql2date( 'd/m/Y H:i', $s['data'] ) : '' ) . '</td>'
				. '<td>' . tdta_admin_nome( $s['nuovo'] ) . '</td>'
				. '<td>' . tdta_admin_nome( $s['da'] ) . '</td>'
				. '<td>' . esc_html( isset( $etichette[ $s['stato'] ] ) ? $etichette[ $s['stato'] ] : $s['stato'] )
				. ( $s['benv'] ? '<br><span style="color:#1d7a4c">bonus di benvenuto ' . esc_html( tdta_pct( $cfg['bonus_amico'] ) ) . '% al nuovo cliente</span>' : '' )
				. ( $s['motivo'] ? '<br><span style="color:#646970">' . esc_html( $s['motivo'] ) . '</span>' : '' ) . '</td>'
				. '<td>' . ( $ordine ? '<a href="' . esc_url( $ordine->get_edit_order_url() ) . '">#' . esc_html( $ordine->get_order_number() ) . '</a>' : '&mdash;' ) . '</td>'
				. '</tr>';
		}
		echo '</tbody></table></div>';
	}

	/* =====================================================================
	 * 9 · CSS E JAVASCRIPT
	 * ===================================================================== */
	function tdta_js_invito() {
		return <<<'JS'
(function () {
	'use strict';
	try {
		var m = /[?&]ref=([A-Za-z0-9-]{3,16})(?:&|#|$)/.exec(window.location.search);
		if (!m) { return; }
		/* l'indirizzo torna pulito: chi lo copia non si porta dietro l'invito */
		try {
			var u = new URL(window.location.href);
			u.searchParams.delete('ref');
			window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash);
		} catch (e) {}
		/* il primo invito vince */
		if (/(?:^|;\s*)tdt_ref=/.test(document.cookie)) { return; }
		if (!window.fetch || !window.FormData || !window.TDTA_INVITO) { return; }
		var d = new FormData();
		d.append('action', 'tdta_invito');
		d.append('codice', m[1].toUpperCase());
		window.fetch(window.TDTA_INVITO.ajax, { method: 'POST', body: d, credentials: 'same-origin' })['catch'](function () {});
	} catch (e) {}
})();
JS;
	}

	function tdta_js() {
		return <<<'JS'
(function () {
	'use strict';
	var T = window.TDTA || {};
	var scatola = document.querySelector('body.tdta .woocommerce');
	if (!scatola || scatola.getAttribute('data-tdta')) { return; }
	scatola.setAttribute('data-tdta', '1');

	/* lo spazio per il menu fisso: il CSS ha i valori di ripiego, qui si
	   legge quello vero (come nella cassa) */
	function misuraMenu() {
		var n = document.querySelector('header.dtnav, .dtnav');
		if (!n) { return; }
		var st = window.getComputedStyle(n);
		if (st.position !== 'fixed' && st.position !== 'sticky') { return; }
		if ((window.pageYOffset || document.documentElement.scrollTop || 0) > 4) { return; }
		var h = Math.round(n.getBoundingClientRect().height);
		if (h > 0) { scatola.style.setProperty('--nav', h + 'px'); }
	}

	function segna(btn, testo) {
		if (!btn) { return; }
		var t = btn.querySelector('[data-tdta-testo]') || btn;
		if (!btn.hasAttribute('data-tdta-orig')) { btn.setAttribute('data-tdta-orig', t.textContent); }
		t.textContent = testo;
		btn.classList.add('is-fatto');
		window.clearTimeout(btn._tdtaTempo);
		btn._tdtaTempo = window.setTimeout(function () {
			t.textContent = btn.getAttribute('data-tdta-orig');
			btn.classList.remove('is-fatto');
		}, 2400);
	}

	function copia(testo, btn, fatto) {
		fatto = fatto || T.copiato;
		function riserva() {
			var campo = document.createElement('textarea');
			campo.value = testo;
			campo.setAttribute('readonly', '');
			campo.style.position = 'fixed';
			campo.style.top = '0';
			campo.style.opacity = '0';
			document.body.appendChild(campo);
			campo.select();
			var ok = false;
			try { ok = document.execCommand('copy'); } catch (e) {}
			document.body.removeChild(campo);
			segna(btn, ok ? fatto : T.nonCopiato);
		}
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(testo).then(function () { segna(btn, fatto); }, riserva);
		} else {
			riserva();
		}
	}

	/* Il messaggio da mandare all'amico non sta nella pagina: viaggia nel
	   link di WhatsApp e nella condivisione del telefono, e il plugin delle
	   lingue (TDT Lingue) non lo vede. Si traduce qui, al momento
	   dell'invio, nella lingua scelta sul sito. Senza il plugin, o in
	   italiano, resta com'e'. */
	function tradotto(testo) {
		var L = window.TDTLingue;
		return L && typeof L.t === 'function' ? L.t(testo) : testo;
	}

	var link = scatola.querySelector('[data-tdta-link]');
	var valore = link ? link.value : '';
	if (link) {
		link.addEventListener('focus', function () { link.select(); });
		link.addEventListener('click', function () { link.select(); });
	}
	Array.prototype.forEach.call(scatola.querySelectorAll('[data-tdta-copia]'), function (b) {
		b.addEventListener('click', function () { copia(valore, b); });
	});
	/* il codice, per chi lo passa a voce o in un messaggio */
	Array.prototype.forEach.call(scatola.querySelectorAll('[data-tdta-copia-codice]'), function (b) {
		b.addEventListener('click', function () { copia(b.getAttribute('data-tdta-copia-codice'), b, T.codiceCopiato); });
	});
	var invita = scatola.querySelector('[data-tdta-messaggio]');
	var messaggio = invita ? invita.getAttribute('data-tdta-messaggio') : '';
	/* WhatsApp: il link si riscrive al tocco, prima che si apra */
	Array.prototype.forEach.call(scatola.querySelectorAll('[data-tdta-whatsapp]'), function (a) {
		a.addEventListener('click', function () {
			if (messaggio && valore) {
				a.href = 'https://wa.me/?text=' + encodeURIComponent(tradotto(messaggio) + ' ' + valore);
			}
		});
	});
	Array.prototype.forEach.call(scatola.querySelectorAll('[data-tdta-condividi]'), function (b) {
		b.addEventListener('click', function () {
			if (navigator.share) {
				navigator.share({ title: 'The Double Twenty', text: tradotto(messaggio), url: valore })['catch'](function () {});
			} else {
				copia(valore, b);
			}
		});
	});

	misuraMenu();
	window.addEventListener('load', misuraMenu);
	window.addEventListener('resize', misuraMenu);
})();
JS;
	}

	/* il promemoria in cima al carrello: gli stessi valori del vestito del
	   carrello (tdt-carrello), ma scritti qui, cosi' regge anche da solo */
	function tdta_css_promemoria() {
		return <<<'CSS'
.tdta-promemoria{
 --p-ink:#111111;--p-muted:#6B6B6B;--p-line:rgba(17,17,17,.10);--p-soft:#F7F7F5;
 --p-ease:cubic-bezier(.22,1,.36,1);
 grid-column:1/-1;box-sizing:border-box;
 display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;
 gap:14px clamp(18px,2.6vw,34px);
 margin:0 0 clamp(18px,2.4vh,26px);padding:clamp(18px,2.2vw,26px) clamp(20px,2.6vw,32px);
 border:1px solid var(--p-line);border-radius:22px;background:var(--p-soft);color:var(--p-ink);
 font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif;
 animation:tdta-promemoria-su .8s var(--p-ease) .24s both}
@keyframes tdta-promemoria-su{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
/* dopo un aggiornamento del carrello (piu', meno, togli) non rientra */
.tdtc .woocommerce.tdtc-rifatto .tdta-promemoria{animation:none}
.tdta-promemoria__num{font-size:clamp(2.2rem,3.6vw,2.9rem);font-weight:600;letter-spacing:-.045em;
 line-height:1;color:var(--p-ink);font-variant-numeric:tabular-nums}
.tdta-promemoria__label{display:block;font-size:.72rem;font-weight:500;letter-spacing:.18em;
 text-transform:uppercase;color:var(--p-muted);line-height:1.4}
.tdta-promemoria p.tdta-promemoria__titolo{margin:6px 0 0 !important;padding:0;
 font-size:clamp(1.02rem,1.4vw,1.16rem);font-weight:600;letter-spacing:-.02em;line-height:1.3;color:var(--p-ink)}
.tdta-promemoria p.tdta-promemoria__sotto{margin:4px 0 0 !important;padding:0;
 font-size:.9rem;line-height:1.45;color:var(--p-muted)}
.tdta-promemoria__azioni{display:flex;flex-direction:column;align-items:center;gap:9px}
.tdta-promemoria a.tdta-promemoria__btn{position:relative;overflow:hidden;
 display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;
 border-radius:999px;background:var(--p-ink);color:#FFFFFF;
 font-size:.94rem;font-weight:500;letter-spacing:-.01em;line-height:1;text-decoration:none;white-space:nowrap;
 transition:background-color .3s var(--p-ease),box-shadow .4s var(--p-ease),transform .3s var(--p-ease)}
.tdta-promemoria a.tdta-promemoria__btn:hover{background:#2a2a2a;color:#FFFFFF;
 box-shadow:0 18px 38px -18px rgba(17,17,17,.62);transform:translateY(-1px)}
.tdta-promemoria a.tdta-promemoria__btn:focus-visible{outline:2px solid var(--p-ink);outline-offset:3px}
.tdta-promemoria a.tdta-promemoria__btn::after{content:"";position:absolute;inset:0 auto 0 -60%;width:45%;
 transform:skewX(-18deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);
 transition:left .75s var(--p-ease)}
.tdta-promemoria a.tdta-promemoria__btn:hover::after{left:115%}
.tdta-promemoria__accedi{font-size:.84rem;color:var(--p-muted);white-space:nowrap}
.tdta-promemoria__accedi a{color:var(--p-ink);text-decoration:underline;text-underline-offset:2px}
.tdta-promemoria__accedi a:hover{color:var(--p-muted)}
@media (max-width:640px){
 .tdta-promemoria{grid-template-columns:auto minmax(0,1fr);align-items:start}
 .tdta-promemoria__num{font-size:2.1rem;margin-top:2px}
 .tdta-promemoria__azioni{grid-column:1/-1;align-items:stretch}
 .tdta-promemoria a.tdta-promemoria__btn{width:100%}
 .tdta-promemoria__accedi{text-align:center}
}
@media (prefers-reduced-motion:reduce){
 .tdta-promemoria,.tdta-promemoria *{animation:none !important;transition:none !important}
}
CSS;
	}

	function tdta_css() {
		return <<<'CSS'
/* ==========================================================================
   THE DOUBLE TWENTY — area clienti
   Tutto sotto .tdta, che PHP mette sul <body> solo nella pagina Il mio
   account. Stessi colori, misure e movimenti di carrello e cassa.
   ========================================================================== */
.tdta .woocommerce{
 --ink:#111111;
 --muted:#6B6B6B;
 --tenue:#8A8A8A;
 --line:rgba(17,17,17,.10);
 --linea-forte:rgba(17,17,17,.22);
 --soft:#F7F7F5;
 --white:#FFFFFF;
 --ok:#1D7A4C;
 --err:#B4553F;
 --ease:cubic-bezier(.22,1,.36,1);
 --raggio:22px;
 --gut:clamp(18px,5vw,72px);
 --nav:104px;
 display:block;
 width:100%;max-width:calc(1180px + 2 * var(--gut));margin-inline:auto;
 padding:calc(var(--nav) + clamp(26px,5vh,54px)) var(--gut) clamp(60px,10vh,120px);
 background:var(--white);color:var(--ink);
 font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif;
 font-size:16px;line-height:1.5;text-align:left;
 -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
/* il menu fisso: 104, 88, 63 (gli stessi scaglioni della cassa) */
@media (max-width:1200px){.tdta .woocommerce{--nav:88px}}
@media (max-width:899px){.tdta .woocommerce{--nav:63px}}
.tdta .woocommerce,.tdta .woocommerce *,
.tdta .woocommerce *::before,.tdta .woocommerce *::after{box-sizing:border-box}
.tdta .woocommerce h1,.tdta .woocommerce h2,.tdta .woocommerce h3,.tdta .woocommerce legend{
 font-family:inherit;color:var(--ink)}
.tdta .woocommerce a{color:var(--ink)}

@keyframes tdta-su{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
/* le entrate sono in CSS: partono col primo fotogramma */
.tdta .tdta__head > *,
.tdta .woocommerce-notices-wrapper > *,
.tdta #customer_login > *,
.tdta .woocommerce-MyAccount-navigation,
.tdta .tdta-benvenuto,.tdta .tdta-card,.tdta .tdta-invita,.tdta .tdta-risultati,
.tdta .woocommerce-MyAccount-content > :not(.tdta-dash),
.tdta form.lost_reset_password{animation:tdta-su .8s var(--ease) both}
.tdta .tdta__head > *:nth-child(1){animation-delay:.02s}
.tdta .tdta__head > *:nth-child(2){animation-delay:.09s}
.tdta .tdta__head > *:nth-child(3){animation-delay:.16s}
.tdta #customer_login > *:nth-child(1){animation-delay:.22s}
.tdta #customer_login > *:nth-child(2){animation-delay:.3s}
.tdta .woocommerce-MyAccount-navigation{animation-delay:.16s}
.tdta .tdta-benvenuto{animation-delay:.2s}
.tdta .tdta-card:nth-child(1){animation-delay:.24s}
.tdta .tdta-card:nth-child(2){animation-delay:.31s}
.tdta .tdta-card:nth-child(3){animation-delay:.38s}
.tdta .tdta-invita{animation-delay:.46s}
.tdta .tdta-risultati{animation-delay:.54s}
.tdta .woocommerce-MyAccount-content > :not(.tdta-dash){animation-delay:.24s}

/* ==========================================================================
   INTESTAZIONE
   ========================================================================== */
.tdta .tdta__head{margin:0 0 clamp(26px,4.2vh,46px)}
.tdta .tdta__occhiello{display:block;font-size:.76rem;font-weight:500;letter-spacing:.16em;
 text-transform:uppercase;color:var(--muted);line-height:1.4}
.tdta .tdta__titolo{margin:14px 0 0 !important;padding:0 !important;
 font-size:clamp(2.05rem,5vw,3.3rem) !important;font-weight:600 !important;
 letter-spacing:-.035em !important;line-height:1.04 !important;color:var(--ink) !important}
.tdta .tdta__sotto{max-width:560px;margin:16px 0 0;font-size:1rem;line-height:1.55;color:var(--muted)}

/* ==========================================================================
   AVVISI
   ========================================================================== */
.tdta .woocommerce-message,.tdta .woocommerce-info,.tdta .woocommerce-error,
.tdta .woocommerce-NoticeGroup li{
 display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;
 margin:0 0 14px;padding:15px 18px;
 border:1px solid var(--line);border-left:2px solid var(--ink);border-radius:14px;
 background:var(--soft);color:var(--ink);
 font-size:.93rem;line-height:1.5;list-style:none}
.tdta .woocommerce-message::before,.tdta .woocommerce-info::before,
.tdta .woocommerce-error::before{content:none}
.tdta .woocommerce-error,.tdta ul.woocommerce-error li{
 border-left-color:var(--err);background:rgba(180,85,63,.06);color:var(--err)}
.tdta ul.woocommerce-error{display:block;margin:0 0 14px;padding:0;border:0;background:none}
.tdta ul.woocommerce-error li{margin:0 0 8px}
.tdta .woocommerce-notices-wrapper:empty{display:none}

/* ==========================================================================
   I CAMPI (come nella cassa)
   ========================================================================== */
.tdta .woocommerce form .form-row{display:flex !important;flex-direction:column;
 float:none !important;width:auto !important;margin:0 0 16px !important;padding:0 !important}
.tdta .woocommerce form .form-row > label,
.tdta .woocommerce form .woocommerce-form-row > label{order:-1;margin:0 0 8px;padding:0;
 font-size:.76rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;
 color:var(--muted);line-height:1.3}
.tdta .woocommerce form label .required{margin-left:2px;color:var(--err);
 text-decoration:none;border:0}
.tdta .woocommerce form label .optional{margin-left:4px;font-size:.72rem;font-weight:400;
 letter-spacing:0;text-transform:none;color:var(--tenue)}
.tdta .woocommerce .screen-reader-text{position:absolute !important;width:1px;height:1px;
 overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.tdta .woocommerce-input-wrapper{display:block;width:100%}

.tdta .woocommerce .input-text,.tdta .woocommerce input[type="text"],
.tdta .woocommerce input[type="email"],.tdta .woocommerce input[type="tel"],
.tdta .woocommerce input[type="password"],.tdta .woocommerce select,.tdta .woocommerce textarea{
 display:block;width:100%;height:52px;
 margin:0 !important;padding:0 15px !important;
 border:1px solid var(--line) !important;border-radius:12px !important;
 background:var(--soft) !important;background-image:none;box-shadow:none !important;
 font:inherit !important;font-size:.98rem !important;color:var(--ink) !important;
 line-height:normal;
 transition:border-color .3s var(--ease),background-color .3s var(--ease),box-shadow .3s var(--ease)}
.tdta .woocommerce textarea{height:auto;min-height:118px;padding:14px 15px !important;line-height:1.55}
.tdta .woocommerce .input-text:hover,.tdta .woocommerce select:hover{border-color:rgba(17,17,17,.18) !important}
.tdta .woocommerce .input-text:focus,.tdta .woocommerce select:focus,.tdta .woocommerce textarea:focus{
 outline:none;background:var(--white) !important;border-color:var(--linea-forte) !important;
 box-shadow:0 0 0 3px rgba(17,17,17,.06) !important}
.tdta .woocommerce .form-row.woocommerce-invalid .input-text{border-color:var(--err) !important}

/* la password: l'occhio dentro il campo */
.tdta .woocommerce .password-input{display:block;position:relative;width:100%}
.tdta .woocommerce .password-input .input-text{padding-right:50px !important}
.tdta .woocommerce .show-password-input{position:absolute !important;top:50% !important;right:10px !important;
 display:grid;place-items:center;width:34px;height:34px;margin:0 !important;padding:0 !important;
 translate:none !important;transform:translateY(-50%);border:0 !important;border-radius:999px !important;
 background-color:transparent !important;box-shadow:none !important;color:var(--muted);cursor:pointer;opacity:.75}
.tdta .woocommerce .show-password-input:hover{opacity:1}
/* la forza della password (WooCommerce) */
.tdta .woocommerce .woocommerce-password-strength{margin:10px 0 0;padding:7px 12px;border-radius:10px;
 font-size:.8rem;font-weight:500;text-align:left;background:var(--soft);color:var(--muted);border:0}
.tdta .woocommerce .woocommerce-password-strength.short,
.tdta .woocommerce .woocommerce-password-strength.bad{background:rgba(180,85,63,.08);color:var(--err)}
.tdta .woocommerce .woocommerce-password-strength.good{background:rgba(196,146,48,.12);color:#8a6414}
.tdta .woocommerce .woocommerce-password-strength.strong{background:rgba(29,122,76,.1);color:var(--ok)}
.tdta .woocommerce .woocommerce-password-hint{display:block;margin:8px 0 0;font-size:.8rem;
 line-height:1.45;color:var(--tenue)}

/* le spunte */
.tdta .woocommerce form .form-row > label.woocommerce-form__label-for-checkbox,
.tdta .woocommerce form .tdta-privacy > label{order:0;display:flex !important;align-items:flex-start;gap:10px;
 margin:2px 0 18px;font-size:.9rem;font-weight:400;letter-spacing:0;text-transform:none;
 color:var(--muted);line-height:1.45;cursor:pointer}
.tdta .woocommerce input[type="checkbox"]{width:18px;height:18px;flex:none;
 margin:1px 0 0 !important;accent-color:#111;cursor:pointer}
.tdta .woocommerce .tdta-privacy a{color:var(--ink);text-decoration:underline;text-underline-offset:2px}
.tdta .woocommerce .tdta-privacy{margin-bottom:6px !important}

/* ==========================================================================
   I PULSANTI (come "Conferma l'ordine" nella cassa)
   ========================================================================== */
.tdta .woocommerce button.button,.tdta .woocommerce a.button,.tdta .woocommerce input.button,
.tdta .woocommerce .woocommerce-Button,.tdta .tdta-btn{
 position:relative;overflow:hidden;
 display:inline-flex !important;align-items:center;justify-content:center;gap:10px;
 min-height:54px;float:none !important;
 margin:0 !important;padding:0 26px !important;
 border:0 !important;border-radius:999px !important;
 background:var(--ink) !important;background-image:none !important;
 color:var(--white) !important;
 font:inherit !important;font-size:.98rem !important;font-weight:500 !important;
 line-height:1 !important;letter-spacing:-.01em !important;text-transform:none !important;
 text-decoration:none !important;white-space:nowrap;cursor:pointer;box-shadow:none !important;
 transition:background-color .3s var(--ease),box-shadow .4s var(--ease),
            transform .3s var(--ease),opacity .3s var(--ease),color .3s var(--ease),border-color .3s var(--ease)}
.tdta .woocommerce button.button:hover,.tdta .woocommerce a.button:hover,
.tdta .woocommerce .woocommerce-Button:hover,.tdta .tdta-btn--nero:hover{
 background:#2a2a2a !important;box-shadow:0 18px 40px -18px rgba(17,17,17,.62) !important;
 transform:translateY(-1px)}
.tdta .woocommerce button.button:active,.tdta .tdta-btn:active{transform:translateY(0)}
.tdta .woocommerce button.button:focus-visible,.tdta .woocommerce a.button:focus-visible,
.tdta .tdta-btn:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
.tdta .woocommerce button.button::after,.tdta .woocommerce a.button::after,.tdta .tdta-btn--nero::after{
 content:"";position:absolute;inset:0 auto 0 -60%;width:45%;transform:skewX(-18deg);
 background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);
 transition:left .75s var(--ease)}
.tdta .woocommerce button.button:hover::after,.tdta .woocommerce a.button:hover::after,
.tdta .tdta-btn--nero:hover::after{left:115%}
.tdta .woocommerce button.button[disabled],.tdta .woocommerce button.button.disabled{
 opacity:.45 !important;cursor:not-allowed;transform:none;box-shadow:none !important}
.tdta .woocommerce button.button[disabled]::after{content:none}
/* i pulsanti secondari: bianchi con il filo, neri al passaggio */
.tdta .tdta-btn:not(.tdta-btn--nero){background:var(--white) !important;color:var(--ink) !important;
 border:1px solid rgba(17,17,17,.18) !important}
.tdta .tdta-btn:not(.tdta-btn--nero):hover{background:var(--ink) !important;color:var(--white) !important;
 border-color:var(--ink) !important;transform:translateY(-1px)}
.tdta .tdta-btn svg{width:18px;height:18px;flex:none}
.tdta .tdta-btn.is-fatto{background:var(--ok) !important;color:var(--white) !important;border-color:var(--ok) !important}
/* il pulsante dentro un avviso: bianco con il filo, come nella cassa */
.tdta .woocommerce-message .button,.tdta .woocommerce-info .button{order:2;min-height:42px;
 margin:0 0 0 auto !important;padding:0 20px !important;border:1px solid var(--ink) !important;
 background:var(--white) !important;color:var(--ink) !important;font-size:.88rem !important}
.tdta .woocommerce-message .button:hover,.tdta .woocommerce-info .button:hover{
 background:var(--ink) !important;color:var(--white) !important;box-shadow:none !important;transform:none}
.tdta .woocommerce-message .button::after,.tdta .woocommerce-info .button::after{content:none}

/* ==========================================================================
   ACCEDI / REGISTRATI
   ========================================================================== */
.tdta #customer_login{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
 gap:clamp(16px,2.4vw,32px);align-items:start;margin:0;width:auto}
.tdta #customer_login::before,.tdta #customer_login::after{content:none;display:none}
.tdta #customer_login > .u-column1,.tdta #customer_login > .u-column2{
 float:none !important;width:auto !important;max-width:none !important;margin:0 !important;
 padding:clamp(22px,2.6vw,34px) !important;
 border:1px solid var(--line);border-radius:var(--raggio);background:var(--white)}
.tdta #customer_login > .u-column2{background:var(--soft)}
.tdta #customer_login h2,.tdta .woocommerce form.lost_reset_password > p:first-child{
 margin:0 0 20px !important;padding:0 !important;border:0 !important;
 font-size:.72rem !important;font-weight:500 !important;letter-spacing:.18em !important;
 text-transform:uppercase !important;color:var(--muted) !important;line-height:1.4 !important}
.tdta .woocommerce form.login,.tdta .woocommerce form.register,.tdta .woocommerce form.lost_reset_password{
 margin:0 !important;padding:0 !important;border:0 !important;border-radius:0 !important;background:none !important}
.tdta #customer_login .u-column2 .input-text{background:var(--white) !important}
.tdta .woocommerce form.login button[type="submit"],.tdta .woocommerce form.register button[type="submit"],
.tdta .woocommerce form.lost_reset_password button[type="submit"]{width:100% !important}
.tdta .woocommerce .lost_password{margin:18px 0 0 !important;font-size:.9rem;text-align:center}
.tdta .woocommerce .lost_password a{color:var(--muted);text-decoration:underline;text-underline-offset:3px;
 transition:color .3s var(--ease)}
.tdta .woocommerce .lost_password a:hover{color:var(--ink)}
/* nome e cognome sulla stessa riga */
.tdta .woocommerce form.register{display:grid;grid-template-columns:1fr 1fr;column-gap:clamp(10px,1.2vw,14px)}
.tdta .woocommerce form.register > *{grid-column:1/-1}
.tdta .woocommerce form.register > .form-row-first{grid-column:1}
.tdta .woocommerce form.register > .form-row-last{grid-column:2}
.tdta .woocommerce form.register > p:last-of-type{margin-bottom:0 !important}

/* il vantaggio, in cima alla registrazione */
.tdta .tdta-vantaggio{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;
 gap:6px 18px;margin:0 0 22px;padding:18px 20px;border-radius:16px;
 background:var(--ink);color:var(--white)}
.tdta .tdta-vantaggio__label{grid-column:1/-1;font-size:.7rem;font-weight:500;letter-spacing:.18em;
 text-transform:uppercase;color:rgba(255,255,255,.6)}
.tdta .tdta-vantaggio__num{font-size:clamp(2.2rem,4vw,2.8rem);font-weight:600;letter-spacing:-.045em;
 line-height:1;font-variant-numeric:tabular-nums}
.tdta .tdta-vantaggio__testo{font-size:.9rem;line-height:1.4;color:rgba(255,255,255,.78)}
.tdta .tdta-invitato{display:flex;align-items:center;gap:8px;margin:-8px 0 20px !important;
 padding:10px 14px;border-radius:12px;background:rgba(29,122,76,.1);color:var(--ok);
 font-size:.88rem;font-weight:500}

/* password dimenticata: una scheda sola, stretta */
.tdta .woocommerce form.lost_reset_password{max-width:560px;padding:clamp(22px,2.6vw,34px) !important;
 border:1px solid var(--line) !important;border-radius:var(--raggio) !important;background:var(--white) !important}
.tdta .woocommerce form.lost_reset_password > p:first-child{text-transform:none !important;letter-spacing:0 !important;
 font-size:.95rem !important;line-height:1.55 !important;color:var(--muted) !important}
.tdta .woocommerce form.lost_reset_password .form-row-first,
.tdta .woocommerce form.lost_reset_password .form-row-last{width:auto !important}

/* ==========================================================================
   AREA DI CHI HA FATTO L'ACCESSO: navigazione a pillole
   ========================================================================== */
.tdta .woocommerce-MyAccount-navigation{float:none !important;width:auto !important;
 margin:0 0 clamp(22px,3.4vh,36px) !important;padding:0 !important;border:0 !important;background:none !important}
.tdta .woocommerce-MyAccount-navigation ul{display:flex;flex-wrap:wrap;gap:8px;
 margin:0 !important;padding:0 !important;list-style:none !important;border:0 !important}
.tdta .woocommerce-MyAccount-navigation li{margin:0 !important;padding:0 !important;
 border:0 !important;list-style:none !important;background:none !important}
.tdta .woocommerce-MyAccount-navigation li::before,.tdta .woocommerce-MyAccount-navigation li::after,
.tdta .woocommerce-MyAccount-navigation a::before,.tdta .woocommerce-MyAccount-navigation a::after{content:none !important}
.tdta .woocommerce-MyAccount-navigation li a{display:inline-flex !important;align-items:center;min-height:40px;
 margin:0 !important;padding:0 17px !important;
 border:1px solid rgba(17,17,17,.14) !important;border-radius:999px !important;background:var(--white) !important;
 color:var(--ink) !important;font-size:.88rem !important;font-weight:500 !important;letter-spacing:-.005em;
 text-decoration:none !important;white-space:nowrap;
 transition:border-color .3s var(--ease),background-color .3s var(--ease),color .3s var(--ease)}
.tdta .woocommerce-MyAccount-navigation li a:hover{border-color:rgba(17,17,17,.34) !important}
.tdta .woocommerce-MyAccount-navigation li.is-active a{background:var(--ink) !important;
 border-color:var(--ink) !important;color:var(--white) !important}
.tdta .woocommerce-MyAccount-navigation-link--customer-logout a{border-color:transparent !important;
 background:transparent !important;color:var(--muted) !important;text-decoration:underline !important;
 text-underline-offset:3px}
.tdta .woocommerce-MyAccount-navigation-link--customer-logout a:hover{color:var(--ink) !important}
.tdta .woocommerce-MyAccount-content{float:none !important;width:auto !important;
 margin:0 !important;padding:0 !important}

/* ==========================================================================
   DASHBOARD
   ========================================================================== */
.tdta .tdta-benvenuto{display:flex;align-items:flex-start;gap:14px;
 margin:0 0 clamp(14px,1.8vw,20px);padding:18px 20px;border-radius:16px;
 background:rgba(29,122,76,.08);color:var(--ink)}
.tdta .tdta-benvenuto__segno{display:grid;place-items:center;width:28px;height:28px;flex:none;
 border-radius:50%;background:var(--ok);color:var(--white)}
.tdta .tdta-benvenuto__segno svg{width:14px;height:14px}
.tdta .tdta-benvenuto strong{display:block;font-size:1rem;font-weight:600;letter-spacing:-.01em}
.tdta .tdta-benvenuto span:not(.tdta-benvenuto__segno){display:block;margin-top:2px;font-size:.93rem;color:var(--muted)}

.tdta .tdta-vantaggi{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
 gap:clamp(12px,1.6vw,18px);margin:0 0 clamp(14px,1.8vw,20px)}
.tdta .tdta-card{display:flex;flex-direction:column;gap:12px;min-height:196px;
 padding:clamp(20px,2.2vw,28px);border:1px solid var(--line);border-radius:var(--raggio);
 background:var(--white);color:var(--ink)}
.tdta .tdta-card__label{font-size:.72rem;font-weight:500;letter-spacing:.18em;
 text-transform:uppercase;color:var(--muted);line-height:1.4}
.tdta .tdta-card__num{margin-top:auto;font-size:clamp(2.5rem,4.4vw,3.5rem);font-weight:600;
 letter-spacing:-.045em;line-height:1;color:inherit;font-variant-numeric:tabular-nums}
.tdta .tdta-card__piede{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;
 font-size:.86rem;line-height:1.4;color:var(--muted)}
.tdta .tdta-stato{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;
 font-size:.76rem;font-weight:500;background:var(--soft);color:var(--muted);white-space:nowrap}
.tdta .tdta-stato.is-on{background:rgba(29,122,76,.1);color:var(--ok)}
.tdta .tdta-stato.is-on::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.tdta .tdta-card--spento .tdta-card__num{color:rgba(17,17,17,.26)}
.tdta .tdta-card--totale{background:var(--ink);border-color:var(--ink);color:var(--white)}
.tdta .tdta-card--totale .tdta-card__label,.tdta .tdta-card--totale .tdta-card__piede{color:rgba(255,255,255,.66)}
.tdta .tdta-card--totale .tdta-stato.is-on{background:rgba(255,255,255,.12);color:#9FE0BD}
/* nessun vantaggio in questo momento (primo ordine fatto, nessun bonus):
   la scheda resta nera, il numero e lo stato si abbassano */
.tdta .tdta-card--totale.tdta-card--spento .tdta-card__num{color:rgba(255,255,255,.32)}
.tdta .tdta-card--totale .tdta-stato:not(.is-on){background:rgba(255,255,255,.1);color:rgba(255,255,255,.72)}

.tdta .tdta-invita{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);
 gap:clamp(20px,3.2vw,48px);align-items:center;margin:0 0 clamp(14px,1.8vw,20px);
 padding:clamp(22px,3vw,40px);border:1px solid var(--line);border-radius:var(--raggio);background:var(--soft)}
.tdta .tdta-invita h2{margin:14px 0 0 !important;padding:0 !important;border:0 !important;
 font-size:clamp(1.5rem,2.6vw,2.05rem) !important;font-weight:600 !important;letter-spacing:-.03em !important;
 line-height:1.1 !important;color:var(--ink) !important}
.tdta .tdta-invita__testo p{max-width:460px;margin:14px 0 0;font-size:.98rem;line-height:1.55;color:var(--muted)}
.tdta .tdta-invita__azione{display:flex;flex-direction:column;gap:10px;min-width:0}
.tdta .tdta-link__label{font-size:.76rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;
 color:var(--muted);line-height:1.3}
.tdta .woocommerce input.tdta-link{height:56px;padding:0 16px !important;border-radius:14px !important;
 background:var(--white) !important;font-size:.95rem !important;text-overflow:ellipsis;cursor:text}
.tdta .tdta-azioni{display:flex;flex-wrap:wrap;gap:10px;margin-top:4px}
.tdta .tdta-azioni .tdta-btn{min-height:50px;padding:0 22px !important;font-size:.93rem !important}
.tdta .tdta-codice{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin:4px 0 0;
 font-size:.84rem;color:var(--tenue)}
/* il codice si copia con un tocco: pillola tratteggiata, come un buono */
.tdta .woocommerce button.tdta-codice__b,.tdta button.tdta-codice__b{display:inline-flex !important;align-items:center;
 min-height:32px;margin:0 !important;padding:0 12px !important;
 border:1px dashed rgba(17,17,17,.34) !important;border-radius:999px !important;
 background:var(--white) !important;background-image:none !important;box-shadow:none !important;
 color:var(--ink) !important;font:inherit !important;font-size:.84rem !important;font-weight:600 !important;
 letter-spacing:.06em !important;line-height:1 !important;text-transform:none !important;cursor:pointer;
 transition:border-color .3s var(--ease),background-color .3s var(--ease),color .3s var(--ease)}
.tdta button.tdta-codice__b:hover{border-color:var(--ink) !important}
.tdta button.tdta-codice__b.is-fatto{border-style:solid !important;border-color:var(--ok) !important;
 background:rgba(29,122,76,.1) !important;color:var(--ok) !important;letter-spacing:0 !important}
.tdta button.tdta-codice__b::after{content:none !important}
/* il campo del codice amico, nella registrazione */
.tdta .woocommerce .tdta-codice-amico input.input-text{text-transform:uppercase;letter-spacing:.08em}
.tdta .woocommerce .tdta-codice-amico input.input-text::placeholder{letter-spacing:.06em}
.tdta .tdta-codice-amico__nota{display:block;margin:8px 0 0;font-size:.8rem;line-height:1.45;color:var(--ok)}
/* chi arriva da un invito, o dal promemoria del carrello, vede prima la registrazione */
.tdta-prima-registrazione #customer_login > .u-column2{order:-1}

.tdta .tdta-risultati{padding:clamp(22px,3vw,34px);border:1px solid var(--line);
 border-radius:var(--raggio);background:var(--white)}
.tdta .tdta-risultati dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:20px 0 0;padding:0}
.tdta .tdta-risultati dl > div{padding:2px clamp(12px,2vw,26px);border-left:1px solid var(--line)}
.tdta .tdta-risultati dl > div:first-child{padding-left:0;border-left:0}
.tdta .tdta-risultati dt{margin:0;font-size:.86rem;font-weight:400;color:var(--muted)}
.tdta .tdta-risultati dd{margin:6px 0 0;font-size:clamp(1.8rem,3vw,2.4rem);font-weight:600;
 letter-spacing:-.04em;line-height:1.05;font-variant-numeric:tabular-nums}

/* ==========================================================================
   LE ALTRE PAGINE DELL'AREA: ordini, indirizzi, dettagli
   ========================================================================== */
.tdta .woocommerce-MyAccount-content > p{max-width:640px;color:var(--muted)}
.tdta table.shop_table{width:100%;margin:0 0 20px;border:1px solid var(--line) !important;
 border-radius:var(--raggio) !important;border-collapse:separate !important;border-spacing:0;
 overflow:hidden;background:var(--white)}
.tdta table.shop_table th{padding:14px 18px !important;border:0 !important;background:var(--soft);
 font-size:.72rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);text-align:left}
.tdta table.shop_table td{padding:16px 18px !important;border:0 !important;border-top:1px solid var(--line) !important;
 font-size:.94rem;color:var(--ink);vertical-align:middle;background:none}
.tdta table.shop_table tfoot th{background:none;text-transform:none;letter-spacing:0;font-size:.93rem;
 color:var(--muted);border-top:1px solid var(--line) !important}
/* il numero dell'ordine e' un <th> dentro le righe: resta testo normale */
.tdta table.shop_table tbody th{background:none;text-transform:none;letter-spacing:0;font-size:.94rem;
 font-weight:500;color:var(--ink);border-top:1px solid var(--line) !important}
.tdta table.shop_table tbody th a{color:var(--ink);text-decoration:none}
.tdta table.shop_table .button{min-height:40px;padding:0 16px !important;font-size:.86rem !important}
.tdta table.shop_table .button + .button{margin-left:6px !important}
.tdta .woocommerce-Addresses{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:18px 0 0}
.tdta .woocommerce-Addresses::before,.tdta .woocommerce-Addresses::after{content:none;display:none}
.tdta .woocommerce-Addresses .woocommerce-Address{float:none !important;width:auto !important;margin:0 !important;
 padding:clamp(20px,2.4vw,28px);border:1px solid var(--line);border-radius:var(--raggio);background:var(--white)}
.tdta .woocommerce-Address-title{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 14px}
.tdta .woocommerce-Address-title::before,.tdta .woocommerce-Address-title::after{content:none;display:none}
.tdta .woocommerce-Address-title h2,.tdta .woocommerce-Address-title h3{margin:0 !important;padding:0 !important;
 font-size:.72rem !important;font-weight:500 !important;letter-spacing:.18em !important;text-transform:uppercase !important;
 color:var(--muted) !important;float:none !important}
.tdta .woocommerce-Address-title .edit{float:none !important;font-size:.88rem;color:var(--ink);
 text-decoration:underline;text-underline-offset:3px}
.tdta .woocommerce-Address address{font-style:normal;line-height:1.65;color:var(--muted)}
/* il tema mette un riquadro grigio intorno a titolo e indirizzo: dentro la scheda non serve */
.tdta .woocommerce-Addresses .woocommerce-Address-title,
.tdta .woocommerce-Addresses .woocommerce-Address address{padding:0 !important;border:0 !important;
 background:none !important;text-align:left}
.tdta .woocommerce-Addresses .woocommerce-Address address{margin:0}
.tdta .woocommerce-Address-title h2,.tdta .woocommerce-Address-title h3{flex:1 1 auto;width:auto !important;
 text-align:left !important}
.tdta .woocommerce-Address-title .edit{flex:none;width:auto !important;text-align:right}
.tdta .woocommerce-address-fields__field-wrapper,.tdta .woocommerce form.woocommerce-EditAccountForm{
 display:grid;grid-template-columns:1fr 1fr;column-gap:clamp(12px,1.4vw,18px)}
.tdta .woocommerce-address-fields__field-wrapper > *,.tdta .woocommerce form.woocommerce-EditAccountForm > *{grid-column:1/-1}
.tdta .woocommerce-address-fields__field-wrapper > .form-row-first,
.tdta .woocommerce form.woocommerce-EditAccountForm > .form-row-first{grid-column:1}
.tdta .woocommerce-address-fields__field-wrapper > .form-row-last,
.tdta .woocommerce form.woocommerce-EditAccountForm > .form-row-last{grid-column:2}
.tdta .woocommerce form .clear{display:none}
.tdta .woocommerce fieldset{margin:12px 0 18px;padding:clamp(18px,2.2vw,26px);border:1px solid var(--line);border-radius:18px}
.tdta .woocommerce fieldset legend{padding:0 8px;font-size:.72rem;font-weight:500;letter-spacing:.18em;
 text-transform:uppercase;color:var(--muted)}
.tdta .woocommerce form .form-row em,.tdta .woocommerce form #account_display_name_description{
 display:block;margin:8px 0 0;font-size:.8rem;font-style:normal;color:var(--tenue)}
.tdta .woocommerce-customer-details address{padding:clamp(18px,2.2vw,24px);border:1px solid var(--line);
 border-radius:18px;font-style:normal;line-height:1.65;color:var(--muted)}
.tdta .woocommerce .select2-container--default .select2-selection--single{height:52px;
 border:1px solid var(--line);border-radius:12px;background:var(--soft)}
.tdta .woocommerce .select2-container--default .select2-selection--single .select2-selection__rendered{
 padding:0 40px 0 15px;line-height:50px;color:var(--ink)}
.tdta .woocommerce .select2-container--default .select2-selection--single .select2-selection__arrow{top:0;right:12px;height:50px}

/* ==========================================================================
   SCHERMI STRETTI
   ========================================================================== */
@media (max-width:899px){
 .tdta #customer_login{grid-template-columns:1fr}
 .tdta .tdta-invita{grid-template-columns:1fr}
}
@media (max-width:760px){
 .tdta .tdta-vantaggi{grid-template-columns:1fr}
 .tdta .tdta-card{min-height:0;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:10px 16px}
 .tdta .tdta-card__label{grid-column:1/-1}
 .tdta .tdta-card__num{grid-column:2;grid-row:2;margin:0;font-size:2.4rem}
 .tdta .tdta-card__piede{grid-column:1;grid-row:2}
 .tdta .woocommerce-Addresses{grid-template-columns:1fr}
}
@media (max-width:620px){
 .tdta .woocommerce-MyAccount-navigation ul{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;
  margin:0 calc(-1 * var(--gut)) !important;padding:2px var(--gut) !important;-webkit-overflow-scrolling:touch}
 .tdta .woocommerce-MyAccount-navigation ul::-webkit-scrollbar{display:none}
 .tdta .woocommerce form.register,.tdta .woocommerce-address-fields__field-wrapper,
 .tdta .woocommerce form.woocommerce-EditAccountForm{grid-template-columns:1fr}
 .tdta .woocommerce form.register > .form-row-first,.tdta .woocommerce form.register > .form-row-last,
 .tdta .woocommerce-address-fields__field-wrapper > .form-row-first,.tdta .woocommerce-address-fields__field-wrapper > .form-row-last,
 .tdta .woocommerce form.woocommerce-EditAccountForm > .form-row-first,
 .tdta .woocommerce form.woocommerce-EditAccountForm > .form-row-last{grid-column:1}
 .tdta .tdta-azioni .tdta-btn{flex:1 1 auto}
 .tdta .tdta-risultati dl{grid-template-columns:1fr;gap:0}
 .tdta .tdta-risultati dl > div{display:flex;align-items:baseline;justify-content:space-between;
  padding:12px 0;border-left:0;border-top:1px solid var(--line)}
 .tdta .tdta-risultati dl > div:first-child{border-top:0;padding-top:0}
 .tdta .tdta-risultati dd{margin:0;font-size:1.6rem}
}

@media (prefers-reduced-motion:reduce){
 .tdta *,.tdta *::before,.tdta *::after{transition:none !important;animation:none !important}
}
CSS;
	}
}
