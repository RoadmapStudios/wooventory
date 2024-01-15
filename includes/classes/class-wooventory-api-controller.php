<?php
class WC_REST_WooCommerce_Media_API_By_commercebird_Controller extends WC_REST_CRUD_Controller
{
    protected $namespace = 'wc/v2';
    protected $namespace2 = 'wc/v3';
    protected $rest_base = 'media';
    protected $media_controller;

    public function register_routes()
    {
        try {
            if (!class_exists('WP_REST_Attachments_Controller')) {
                throw new Exception('WP API not installed.');
            }
            $this->media_controller = new WP_REST_Attachments_Controller('attachment');
        } catch (Exception $e) {
            wp_die($e->getMessage());
        }

        register_rest_route($this->namespace, '/' . $this->rest_base, array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'list_images'),
                'permission_callback' => array($this->media_controller, 'get_items_permissions_check'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'upload_image'),
                'args' => $this->get_params_upload(),
                'permission_callback' => array($this->media_controller, 'create_item_permissions_check'),
            ),
        )
        );
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_item'),
                'permission_callback' => array($this->media_controller, 'get_item_permissions_check'),
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_image'),
                'args' => $this->media_controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
                'permission_callback' => array($this->media_controller, 'update_item_permissions_check'),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_image'),
                'args' => $this->get_params_delete(),
                'permission_callback' => array($this->media_controller, 'delete_item_permissions_check'),
            ),
        )
        );

        register_rest_route($this->namespace2, '/' . $this->rest_base, array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'list_images'),
                'permission_callback' => array($this->media_controller, 'get_items_permissions_check'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'upload_image'),
                'args' => $this->get_params_upload(),
                'permission_callback' => array($this->media_controller, 'create_item_permissions_check'),
            ),
        )
        );
        register_rest_route($this->namespace2, '/' . $this->rest_base . '/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_item'),
                'permission_callback' => array($this->media_controller, 'get_item_permissions_check'),
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_image'),
                'args' => $this->media_controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
                'permission_callback' => array($this->media_controller, 'update_item_permissions_check'),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_image'),
                'args' => $this->get_params_delete(),
                'permission_callback' => array($this->media_controller, 'delete_item_permissions_check'),
            ),
        )
        );
    }

    public function get_params_upload()
    {
        $params = array(
            'media_attachment' => array(
                'required' => true,
                'description' => __('Image encoded as base64.', 'image-from-base64'),
                'type' => 'string',
            ),
            'title' => array(
                'required' => true,
                'description' => __('The title for the object.', 'image-from-base64'),
                'type' => 'json',
            ),
            'media_path' => array(
                'description' => __('Path to directory where file will be uploaded.', 'image-from-base64'),
                'type' => 'string',
            ),
        );
        return $params;
    }

    public function get_params_delete()
    {
        return array(
            'force' => array(
                'type' => 'boolean',
                'default' => false,
                'description' => __('Whether to bypass trash and force deletion.'),
            ),
        );
    }

    public function upload_image($request)
    {
        $response = array();
        // $fd = fopen(__DIR__.'/test_media.txt','w+');
        try {
            if (!empty($request['media_path'])) {
                $this->upload_dir = $request['media_path'];
                $this->upload_dir = '/' . trim($this->upload_dir, '/');
                add_filter('upload_dir', array($this, 'change_wp_upload_dir'));
            }
            // fwrite($fd,PHP_EOL.'$filename : '.$filename);
            // $filename = $request['title']['rendered'];
            $filename = $request['media_name'];
            // fwrite($fd,PHP_EOL.'$filename : '.$filename);
            $img = $request['media_attachment'];
            // fwrite($fd,PHP_EOL.'Function Before Incode : '.$img);
            $img = preg_replace('/^.*base64,/', '', $img);
            $decoded = base64_decode($img);
            // $url  = $file['url'];
            // $type = $file['type'];
            // $file = $file['file'];
            // fwrite($fd,PHP_EOL.'File URL : '.$decoded['url']);
            // fwrite($fd,PHP_EOL.'File type : '.$decoded['type']);
            // fwrite($fd,PHP_EOL.'File file : '.print_r($decoded['file'],true));
            $request->set_body($decoded);
            $br_content_type = (!empty($request['mime_type']) ? $request['mime_type'] : "image/jpeg");
            $request->remove_header('Content-Type');
            $request->add_header('Content-Type', $br_content_type);
            $request->add_header('Content-Disposition', "attachment;filename=\"{$filename}\"");
            // fwrite($fd,PHP_EOL.'$request : '.print_r($request,true));
            $result = $this->media_controller->create_item($request);
            // fwrite($fd,PHP_EOL.'Upload response : '.print_r($result,true));
            $response = rest_ensure_response($result);
            // fwrite($fd,PHP_EOL.'$response After upload: ',print_r($response,true));
        } catch (Exception $e) {
            $response['result'] = "error";
            $response['message'] = $e->getMessage();
        }

        if (!empty($request['media_path'])) {
            remove_filter('upload_dir', array($this, 'change_wp_upload_dir'));
        }
        // fwrite($fd,PHP_EOL.'$response : ',print_r($response,true));
        // fclose($fd);
        return $response;
    }

    public function list_images($request)
    {
        $response = array();
        try {
            $result = $this->media_controller->get_items($request);
            $response = rest_ensure_response($result);
        } catch (Exception $e) {
            $response['result'] = "error";
            $response['message'] = $e->getMessage();
        }
        return $response;
    }

    public function get_item($request)
    {
        $response = array();
        try {
            $result = $this->media_controller->get_item($request);
            $response = rest_ensure_response($result);
        } catch (Exception $e) {
            $response['result'] = "error";
            $response['message'] = $e->getMessage();
        }
        return $response;
    }

    public function delete_image($request)
    {
        $response = array();
        try {
            $result = $this->media_controller->delete_item($request);
            $response = rest_ensure_response($result);
        } catch (Exception $e) {
            $response['result'] = "error";
            $response['message'] = $e->getMessage();
        }
        return $response;
    }

    public function update_image($request)
    {
        $response = array();
        try {
            $result = $this->media_controller->update_item($request);
            $response = rest_ensure_response($result);
        } catch (Exception $e) {
            $response['result'] = "error";
            $response['message'] = $e->getMessage();
        }
        return $response;
    }

    public function change_wp_upload_dir($dirs)
    {
        if (!empty($this->upload_dir)) {
            $dirs['subdir'] = $this->upload_dir;
            $dirs['path'] = $dirs['basedir'] . $this->upload_dir;
            $dirs['url'] = $dirs['baseurl'] . $this->upload_dir;
        }

        return $dirs;
    }
}
