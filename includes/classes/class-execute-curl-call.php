<?php

/**
 * All Execute Call Class related functions.
 *
 * @package  Inventory
 */

class ExecutecallClass {
	/**
	 * @var array|array[]
	 */
	private array $config;

	public function __construct() {
		$this->config = array(
			'ExecutecallZI' => array(
				'OID'         => get_option( 'zoho_inventory_oid' ),
				'ATOKEN'      => get_option( 'zoho_inventory_access_token' ),
				'RTOKEN'      => get_option( 'zoho_inventory_refresh_token' ),
				'EXPIRESTIME' => get_option( 'zoho_inventory_timestamp' ),
			),
		);
	}

	// Get Call Zoho
	public function ExecuteCurlCallGet( $url ) {
		// Sleep for .5 sec for each api calls
		usleep( 500000 );
		$handlefunction = new Classfunctions();

		$zoho_inventory_access_token  = $this->config['ExecutecallZI']['ATOKEN'];
		$zoho_inventory_refresh_token = $this->config['ExecutecallZI']['RTOKEN'];
		$zoho_inventory_timestamp     = $this->config['ExecutecallZI']['EXPIRESTIME'];

		$current_time = strtotime( gmdate( 'Y-m-d H:i:s' ) );

		if ( $zoho_inventory_timestamp < $current_time ) {

			$respo_at_js = $handlefunction->GetServiceZIRefreshToken( $zoho_inventory_refresh_token );
			if ( empty( $respo_at_js ) || ! array_key_exists( 'access_token', $respo_at_js ) ) {
				return new WP_Error( 403, 'Access denied!' );
			}
			$zoho_inventory_access_token = $respo_at_js['access_token'];
			update_option( 'zoho_inventory_access_token', $respo_at_js['access_token'] );
			update_option( 'zoho_inventory_timestamp', strtotime( gmdate( 'Y-m-d H:i:s' ) ) + $respo_at_js['expires_in'] );

		}

		$args     = array(
			'headers' => array(
				'Authorization' => 'Bearer ' . $zoho_inventory_access_token,
			),
		);
		$response = wp_remote_get( $url, $args );

		// Check if the request was successful
		if ( ! is_wp_error( $response ) ) {
			// If successful, get the body of the response
			$body = wp_remote_retrieve_body( $response );

			// Decode JSON response
			return json_decode( $body );
		} else {
			// If there was an error, handle it
			$error_message = is_wp_error( $response ) ? $response->get_error_message() : 'Unknown error.';
			return 'Error: ' . $error_message;
		}
	}

	// Post Call Zoho

	public function ExecuteCurlCallPost( $url, $data ) {
		$handlefunction = new Classfunctions();

		$zoho_inventory_access_token  = $this->config['ExecutecallZI']['ATOKEN'];
		$zoho_inventory_refresh_token = $this->config['ExecutecallZI']['RTOKEN'];
		$zoho_inventory_timestamp     = $this->config['ExecutecallZI']['EXPIRESTIME'];

		$current_time = strtotime( gmdate( 'Y-m-d H:i:s' ) );

		if ( $zoho_inventory_timestamp < $current_time ) {

			$respo_at_js = $handlefunction->GetServiceZIRefreshToken( $zoho_inventory_refresh_token );

			$zoho_inventory_access_token = $respo_at_js['access_token'];
			update_option( 'zoho_inventory_access_token', $respo_at_js['access_token'] );
			update_option( 'zoho_inventory_timestamp', strtotime( gmdate( 'Y-m-d H:i:s' ) ) + $respo_at_js['expires_in'] );

		}

		$args     = array(
			'body'    => $data,
			'headers' => array(
				'Authorization' => 'Bearer ' . $zoho_inventory_access_token,
			),
		);
		$response = wp_remote_post( $url, $args );
		// Check if the request was successful
		if ( ! is_wp_error( $response ) ) {
			// If successful, get the body of the response
			$body = wp_remote_retrieve_body( $response );
			// Decode JSON response
			return json_decode( $body );
		} else {
			// If there was an error, handle it
			$error_message = is_wp_error( $response ) ? $response->get_error_message() : 'Unknown error.';
			return 'Error: ' . $error_message;
		}
	}

	// Put Call Zoho

	public function ExecuteCurlCallPut( $url, $data ) {

		$handlefunction = new Classfunctions();

		$zoho_inventory_access_token  = $this->config['ExecutecallZI']['ATOKEN'];
		$zoho_inventory_refresh_token = $this->config['ExecutecallZI']['RTOKEN'];
		$zoho_inventory_timestamp     = $this->config['ExecutecallZI']['EXPIRESTIME'];

		$current_time = strtotime( gmdate( 'Y-m-d H:i:s' ) );

		if ( $zoho_inventory_timestamp < $current_time ) {

			$respo_at_js                 = $handlefunction->GetServiceZIRefreshToken( $zoho_inventory_refresh_token );
			$zoho_inventory_access_token = $respo_at_js['access_token'];
			update_option( 'zoho_inventory_access_token', $respo_at_js['access_token'] );
			update_option( 'zoho_inventory_timestamp', strtotime( gmdate( 'Y-m-d H:i:s' ) ) + $respo_at_js['expires_in'] );
		}

		$args     = array(
			'body'    => $data,
			'headers' => array(
				'Authorization' => 'Bearer ' . $zoho_inventory_access_token,
			),
			'method'  => 'PUT',
		);
		$response = wp_remote_request( $url, $args );
		// Check if the request was successful
		if ( ! is_wp_error( $response ) ) {
			// If successful, get the body of the response
			$body = wp_remote_retrieve_body( $response );
			// Decode JSON response
			return json_decode( $body );
		} else {
			// If there was an error, handle it
			$error_message = is_wp_error( $response ) ? $response->get_error_message() : 'Unknown error.';
			return 'Error: ' . $error_message;
		}
	}

	/**
	 *
	 * Get Call Zoho Image
	 * @param mixed $url
	 * @param mixed $image_name
	 * @return string
	 */
	public function ExecuteCurlCallImageGet( $url, $image_name ) {

		$handlefunction = new Classfunctions();

		$zoho_inventory_access_token  = $this->config['ExecutecallZI']['ATOKEN'];
		$zoho_inventory_refresh_token = $this->config['ExecutecallZI']['RTOKEN'];
		$zoho_inventory_timestamp     = $this->config['ExecutecallZI']['EXPIRESTIME'];

		$current_time = strtotime( gmdate( 'Y-m-d H:i:s' ) );

		if ( $zoho_inventory_timestamp < $current_time ) {

			$respo_at_js = $handlefunction->GetServiceZIRefreshToken( $zoho_inventory_refresh_token );

			$zoho_inventory_access_token = $respo_at_js['access_token'];
			update_option( 'zoho_inventory_access_token', $respo_at_js['access_token'] );
			update_option( 'zoho_inventory_timestamp', strtotime( gmdate( 'Y-m-d H:i:s' ) ) + $respo_at_js['expires_in'] );

		}
		$args     = array(
			'headers' => array(
				'Authorization' => 'Bearer ' . $zoho_inventory_access_token,
			),
		);
		$response = wp_remote_get( $url, $args );

		// Check if the request was successful
		if ( ! is_wp_error( $response ) ) {
			// If successful, get the body of the response
			$body = wp_remote_retrieve_body( $response );

			// Set up the upload directory
			$upload               = wp_upload_dir();
			$absolute_upload_path = $upload['basedir'] . '/zoho_image/';
			$url_upload_path      = $upload['baseurl'] . '/zoho_image/';

			// Generate a unique image name
			$img        = 'image_' . wp_rand() . '_' . $image_name;
			$upload_dir = $absolute_upload_path . '/' . $img;

			// Create the directory if it doesn't exist
			if ( ! is_dir( $absolute_upload_path ) ) {
				mkdir( $absolute_upload_path );
			}
			// Save the image file
			file_put_contents( $upload_dir, $body );

			// Use trailingslashit to make sure the URL ends with a single slash
			return trailingslashit( $url_upload_path ) . $img;
		} else {
			// If there was an error, handle it
			$error_message = is_wp_error( $response ) ? $response->get_error_message() : 'Unknown error.';
			return 'Error: ' . $error_message;
		}
	}
}
