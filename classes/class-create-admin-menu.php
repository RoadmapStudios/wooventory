<?php
/**
 * This file will create admin menu page.
 */

class Wp_Create_Admin_Page {

    public function __construct() {
        add_action( 'admin_menu', [ $this, 'create_admin_menu' ] );
    }

    public function create_admin_menu() {
        $capability = 'manage_options';
        $slug = 'react';

        add_menu_page(
            __( 'Wooventory', 'wooventory' ),
            __( 'Wooventory', 'wooventory' ),
            $capability,
            $slug,
            [ $this, 'menu_page_template' ],
            "",
            29//After woocomerce
        );
    }

    public function menu_page_template() {
        echo '<div class="wrap"><div id="wp-admin-app"></div></div>';
    }

}
new Wp_Create_Admin_Page();