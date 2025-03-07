<?php

namespace CommerceBird\Admin\Traits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
trait OptionStatus {

	/**
	 * Updates the status of the option based on the provided form data.
	 *
	 * @param array $form The form data containing the option values.
	 * @param string $source The source of the form data.
	 *
	 * @return bool Returns true if the option status is updated successfully, false otherwise.
	 */
	private function option_status_update( array $form, $source = '' ): bool {
		foreach ( $form as $key => $value ) {
			update_option( $this->get_name( $key, $source ), $value ?? '', false );
		}

		return true;
	}

	/**
	 * Returns the name of the Zoho status for a given key.
	 *
	 * @param int|string $key The key to use for generating the status name.
	 * @param string $source The source of the form data.
	 *
	 * @return string The generated status name.
	 */
	public function get_name( string $key, $source = '' ): string {
		if ( empty( $source ) ) {
			return 'cmbird_' . $key . '_status';
		} else {
			return 'cmbird_' . $source . '_' . $key . '_status';
		}
	}

	/**
	 * Retrieves the status of the options specified in the given array of keys.
	 *
	 * @param array $keys The array of keys for which the status needs to be retrieved.
	 * @param string $source The source of the form data.
	 *
	 * @return array The array containing the status of the options.
	 */
	private function option_status_get( array $keys, $source = '' ): array {
		$options = array();
		foreach ( $keys as $key ) {
			$options[ $key ] = get_option( $this->get_name( $key, $source ), '' );
		}

		return $options;
	}


	/**
	 * Removes options from the database based on the given keys.
	 *
	 * @param array $keys An array of keys to remove from the options table.
	 * @param string $source The source of the form data.
	 *
	 * @return bool Returns true if the options were successfully removed, false otherwise.
	 */
	private function option_status_remove( array $keys, $source = '' ): bool {
		foreach ( $keys as $key ) {
			delete_option( $this->get_name( $key, $source ) );
		}

		return true;
	}
}
