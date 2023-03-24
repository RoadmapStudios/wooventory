<?php
/**
 * Plugin Name: Wooventory
 * Description: This plugin allows you to upload product images via https://app.wooventory.com.
 * Author: Fawad Tiemoerie
 * Author URI: https://wooventory.com
 * Version: 1.0.0
 * Requires PHP: 7.4
 * 
 * License: GNU General Public License v3.0
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * WC requires at least: 6.1.0
 * WC tested up to: 7.4.1
 */

if( ! defined( 'ABSPATH' ) ) : exit(); endif; // No direct access allowed.

/**
* Define Plugins Contants
*/
define ( 'WR_PATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );
define ( 'WR_URL', trailingslashit( plugins_url( '/', __FILE__ ) ) );
defined('ALLOW_UNFILTERED_UPLOADS') or define('ALLOW_UNFILTERED_UPLOADS', true);


require_once __DIR__ . '/includes/class-wooventory-license-activation.php';
if ( class_exists( 'Wooventory_AM_Client' ) ) {
	$wcam_lib = new Wooventory_AM_Client( __FILE__, '', '1.0.0', 'plugin', 'https://wooventory.com', 'Wooventory' );
}


/**
 * Loading Necessary Scripts
 */
add_action( 'admin_enqueue_scripts', 'load_scripts' );
function load_scripts() {

    wp_register_style( 'style-react', WR_URL .'assets/style.css' );
    wp_enqueue_style('style-react');

    wp_enqueue_script( 'wp-react-app', WR_URL . 'dist/bundle.js', [ 'jquery', 'wp-element' ], wp_rand(), true );
    wp_localize_script( 'wp-react-app', 'appLocalizer', [
        'apiUrl' => home_url( '/wp-json' ),
        'nonce' => wp_create_nonce( 'wp_rest' ),
    ] );
}


class WooCommerce_Media_API_By_wooventory
{

    public function __construct()
    {
        add_action('rest_api_init', array($this, 'register_routes'), 15);
    }

    public function register_routes()
    {
        global $wp_version;
        if (version_compare($wp_version, 4.4, '<')) {
            return;
        }

        require_once WR_PATH . 'includes/class-wooventory-api-controller.php';
        require_once WR_PATH . 'includes/class-wooventory-metadata-controller.php';
        require_once WR_PATH . 'includes/class-wooventory-list-items-api-controller.php';
        // require_once WR_PATH . 'includes/class-wooventory-react-app.php';
        $api_classes = array(
            'WC_REST_WooCommerce_Media_API_By_wooventory_Controller',
            'WC_REST_WooCommerce_Metadata_API_By_wooventory_Controller',
            'WC_REST_List_Items_API_By_wooventory_Controller',
        );
        foreach ($api_classes as $api_class) {
            $controller = new $api_class();
            $controller->register_routes();
        }
    }
}

new WooCommerce_Media_API_By_wooventory();

require_once WR_PATH . 'classes/class-create-admin-menu.php';
require_once WR_PATH . 'classes/class-create-settings-routes.php';