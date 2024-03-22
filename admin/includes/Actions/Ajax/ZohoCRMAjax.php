<?php

namespace RMS\Admin\Actions\Ajax;

use RMS\Admin\Connectors\CommerceBird;
use RMS\Admin\Traits\AjaxRequest;
use RMS\Admin\Traits\OptionStatus;
use RMS\Admin\Traits\Singleton;
use RMS\Admin\Traits\LogWriter;

defined('RMS_PLUGIN_NAME') || exit;

/**
 * Initializes the Zoho CRM class.
 * @since 1.0.0
 * @return void
 */
final class ZohoCRMAjax
{

	use Singleton;
	use AjaxRequest;
	use OptionStatus;
	use LogWriter;



	private const FORMS = array(
		'connect' => array(
			'token',
		),
		'product' => array(
			'importProducts',
		),
		'order' => array('range'),
		'customer' => array(
			'importCustomers',
		),
	);
	private const ACTIONS = array(
		'save_sync_order_via_cron' => 'sync_order',
		'save_zcrm_connect' => 'connect_save',
		'get_zcrm_connect' => 'connect_load',
		'import_zcrm_product' => 'product_import',
		'map_zcrm_product' => 'product_map',
		'map_zcrm_customer' => 'customer_map',
		'map_zcrm_order' => 'order_map',
		'export_zcrm_order' => 'order_export',
		'get_zcrm_fields' => 'get_zcrm_fields',
	);
	private const OPTIONS = array(
		'connect' => array(
			'token' => 'commercebird-exact-online-token',
		),
		'zcrmfields' => 'commercebird-zoho-crm-fields',
	);

	public function __construct()
	{
		$this->load_actions();
	}

	/**
	 * Get Zoho CRM token.
	 * @since 1.0.0
	 * @return mixed
	 */
	public function get_token()
	{
		return get_option(self::OPTIONS['connect']['token'], '');
	}

	public function connect_save()
	{
		$this->verify(self::FORMS['connect']);
		if (isset ($this->data['token']) && !empty ($this->data['token'])) {
			update_option(self::OPTIONS['connect']['token'], $this->data['token']);
			$this->response['message'] = __('Saved', 'commercebird');
			$this->response['data'] = $this->data;
		} else {
			$this->errors['message'] = __('Token is required', 'commercebird');
		}

		$this->serve();
	}

	public function connect_load()
	{
		$this->verify();
		$this->response['token'] = get_option(self::OPTIONS['connect']['token'], '');
		$this->serve();
	}

	/**
	 * Get Zoho CRM custom fields.
	 * @since 1.0.0
	 * @return void
	 */
	public function get_zcrm_fields()
	{
		$module = $_GET['module'];
		$fields = (new CommerceBird())->get_zcrm_fields($module);
		if (is_wp_error($fields)) {
			$this->errors['message'] = $fields->get_error_message();
		} else {
			update_option(self::OPTIONS['zcrmfields'], $fields);
			$this->response['message'] = __('Zoho CRM fields saved', 'commercebird');
		}
		$this->serve();
	}
}
