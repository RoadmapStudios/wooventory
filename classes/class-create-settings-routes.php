<?php
/**
 * This file will create Custom Rest API End Points.
 */
if(!class_exists('Client')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}
use Automattic\WooCommerce\Client;

$wooventory_woocommerce = new Client(
    'https://wooventory.com',
    'ck_b0305b88f6d5d26e6423c073f6f95de119cc9e55',
    'cs_609c13f281816b937499b2a0052e1145745acdc3',
    [
        'version' => 'wc/v3',
    ]
);

class WP_React_Settings_Rest_Route
{

    protected $woocommerce;
    public function __construct($woo)
    {
        $this->woocommerce = $woo;
        add_action('rest_api_init', [$this, 'create_rest_routes']);
    }

    public function create_rest_routes()
    {
        register_rest_route('wooventory/v1', '/settings', [
            'methods' => 'GET',
            'callback' => [$this, 'get_settings'],
            'permission_callback' => [$this, 'get_settings_permission'],
        ]);
        register_rest_route('wooventory/v1', '/settings', [
            'methods' => 'POST',
            'callback' => [$this, 'save_settings'],
            'permission_callback' => [$this, 'save_settings_permission'],
        ]);

        register_rest_route('wooventory/v1', '/subscription/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_subscription'],
            'permission_callback' => [$this, 'get_settings_permission'],
        ]);
    }

    public function get_subscription($request)
    {
        $subId = $request['id'];
        try {
            $endpoint = 'subscriptions/' . $subId;
            $response = $this->woocommerce->get($endpoint);
            return $response;
        } catch (HttpClientException $e) {
            return $e->getMessage();
        }
    }

    public function get_settings()
    {
        $cors_status = get_option("enable_cors");
        if($cors_status == 1) {
            $cors_status = true;
        } else {
            $cors_status = false;
        }
        $response = [
            "sub_id" => get_option("wooventory_sub_id"),
            "cors_status" => $cors_status
        ];
        return rest_ensure_response($response);
    }

    public function get_settings_permission()
    {
        return true;
    }

    public function save_settings($req)
    {
        // enable corse
        if ($req["cors_status"] == true) {
            $cors_db = get_option("enable_cors");

            if (is_file(ABSPATH . '.htaccess') && (!$cors_db)) {
                $htaccess = ABSPATH . '.htaccess';
                $fp = fopen($htaccess,'a+');
                fwrite($fp,'
                <IfModule mod_headers.c>
                Header set Access-Control-Allow-Origin "*"
                </IfModule>');
                fclose($fp);
                update_option("enable_cors", true);
            }
        } else {
            // TODO add code here to remove CORS from htaccess file
            update_option("enable_cors", false);
        }

        if (!empty($req["sub_id"])) {
            $sub_id = $req["sub_id"];
            $res = $this->get_subscription(array("sub_id" => $sub_id));
            if ($res == false) {
                return rest_ensure_response("failure");
            }
            update_option('wooventory_sub_id', $sub_id);
        }

        return rest_ensure_response('success');
    }

    public function save_settings_permission()
    {
        return true;
    }
}
new WP_React_Settings_Rest_Route($wooventory_woocommerce);
