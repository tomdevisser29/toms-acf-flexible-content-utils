<?php
/**
 * Plugin Name: ACF Flexible Content Utilities
 * Author: Tom de Visser
 * Description: An ACF flexible content utility plug-in for WordPress.
 * Version: 0.1.0
 */

defined( 'ABSPATH' ) or die;

function toms_acf_flexible_content_utils_enqueue_scripts() {
	wp_enqueue_script( 'acf-flexible-content-utils', plugin_dir_url( __FILE__ ) . 'js/acf-flexible-content-utils.js', array( 'jquery' ), time(), true );
}
add_action( 'admin_enqueue_scripts', 'toms_acf_flexible_content_utils_enqueue_scripts' );

function toms_acf_flexible_content_utils_enqueue_styles() {
	wp_enqueue_style( 'acf-flexible-content-utils', plugin_dir_url( __FILE__ ) . 'css/acf-flexible-content-utils.css', array(), time() );
}
add_action( 'admin_enqueue_scripts', 'toms_acf_flexible_content_utils_enqueue_styles' );