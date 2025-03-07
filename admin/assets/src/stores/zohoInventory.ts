import type {
    ConnectionSettings,
    ContactSettings,
    CronSettings,
    Intervals,
    OrderSettings,
    PriceSettings,
    ProductSettings,
    TaxSettings,
    WcTax,
    ZohoCategory,
    ZohoTax
} from '@/types'
import { acceptHMRUpdate, defineStore } from "pinia";
import type { Ref, UnwrapRef } from "vue";
import { reactive, ref, watch } from "vue";
import { useLoadingStore } from "@/stores/loading";
import { extractOptions, notify, redirect_uri, wcb2b_enabled } from "@/composable/helpers";
import { backendAction, storeKey } from "@/keys";
import { fetchData, resetData, sendData } from "@/composable/http";
import { useStorage } from "@/composable/storage";
import Swal from 'sweetalert2';

const actions = backendAction.zohoInventory;
const keys = storeKey.zohoInventory;

interface IsConnected {
    total_api_count: number;
    maximum_api_count: number;
    remaining_api_count: number;
    [key: string]: any;
}

export const useZohoInventoryStore = defineStore("zohoInventory", () => {
    const loader = useLoadingStore();
    const storage = useStorage();
    const notSubscribed = ref(false);

    const isConnected = ref<IsConnected>({
        total_api_count: 0,
        maximum_api_count: 0,
        remaining_api_count: 0,
    });
    /*
     * -----------------------------------------------------------------------------------------------------------------
     *  Tab Settings
     * -----------------------------------------------------------------------------------------------------------------
     */
    const selectedTab = ref("");
    const selectTab = (tab: string) => (selectedTab.value = tab);

    /*
     * -----------------------------------------------------------------------------------------------------------------
     *  Connection Settings
     * -----------------------------------------------------------------------------------------------------------------
     */
    const connectionSettingsInvalid = ref(false);
    const connection: ConnectionSettings = reactive({
        organization_id: "",
        client_id: "",
        client_secret: "",
        redirect_uri: redirect_uri,
        account_domain: "",
    });

    const isConnectionValid = async () => {
        const connected = actions.connection;
        if (loader.isLoading(connected)) return;
        loader.setLoading(connected);
        isConnected.value = await fetchData(connected, keys.connected);
        loader.clearLoading(connected);
    };


    /*
     * -----------------------------------------------------------------------------------------------------------------
     *  Tax Settings
     * -----------------------------------------------------------------------------------------------------------------
     */

    const wc_taxes = ref<WcTax[]>([]);
    const zoho_taxes = ref<ZohoTax[]>([]);
    const tax_settings = reactive(<TaxSettings>{
        selectedTaxRates: [],
    });
    const get_wc_taxes = async () => {
        const key = keys.wc_tax;
        const instore = storage.get(key);
        if (instore) {
            wc_taxes.value = instore;
        } else {
            const action = actions.wc_taxes;
            if (loader.isLoading(action)) return;
            loader.setLoading(action);
            wc_taxes.value = await fetchData(action, key);
            loader.clearLoading(action);
        }
    };
    const get_zoho_taxes = async () => {
        const key = keys.zoho_tax;
        const in_store = storage.get(key);
        if (in_store) {
            zoho_taxes.value = in_store;
        } else {
            const action = actions.zoho_taxes;
            if (loader.isLoading(action)) return;
            loader.setLoading(action);
            zoho_taxes.value = await fetchData(action, key);
            loader.clearLoading(action);
        }
    };

    const encodeTax = (zoho_tax_rate: ZohoTax): string =>
        `${zoho_tax_rate.tax_id}##${zoho_tax_rate.tax_name.replace(
            " ",
            "@@"
        )}##${zoho_tax_rate.tax_type.replace(" ", "@@")}##${zoho_tax_rate.tax_percentage
        }`;

    const taxOptions = (woocommerce_tax_id: number) => {
        const taxOptions: { [key: string]: string } = {};
        for (const zoho_tax_rate of zoho_taxes.value) {
            taxOptions[woocommerce_tax_id + "^^" + encodeTax(zoho_tax_rate)] =
                zoho_tax_rate.tax_name;
        }
        return taxOptions;
    };

    /*
     * -----------------------------------------------------------------------------------------------------------------
     *  Product Settings
     * -----------------------------------------------------------------------------------------------------------------
     */
    const syncResponse = ref<any>([]);

    const product_settings = reactive(<ProductSettings>{
        item_from_zoho: false,
        disable_stock_sync: false,
        disable_product_sync: false,
        enable_accounting_stock: false,
    });

    const sync = async (action: string, selectedCategory: { label: string; value: string } | null) => {
        if (loader.isLoading(action)) return;
        loader.setLoading(action);
        let url = `${window.commercebird_admin.url}?action=zoho_ajax_call_${action}`;
        // Append the selected category if one is chosen
        if (
            product_settings.item_from_zoho &&
            (action === "variable_item" || action === "item" || action === "composite_item")
        ) {
            url = `${url}_from_zoho`;
            // Append selected category only if from Zoho and a category is selected
            if (selectedCategory?.value) {
                url += `&category=${encodeURIComponent(selectedCategory.value)}`;
            }
        }
        syncResponse.value = [];
        await fetch(url)
            .then((response) => response.json())
            .then((response) => {
                if (!response) return;
                if (response.success) {
                    notify.success(response.data.message);
                    return;
                } else {
                    notify.error(response.data.message);
                    return;
                }
                syncResponse.value = response;
            })
            .finally(() => {
                loader.clearLoading(action);
            });
    };

    /*
     * -----------------------------------------------------------------------------------------------------------------
     *  Cron Settings
     * -----------------------------------------------------------------------------------------------------------------
     */
    const cron_settings = reactive(<CronSettings>{
        disable_name_sync: false,
        disable_price_sync: false,
        disable_image_sync: false,
        disable_description_sync: false,
        zi_cron_interval: 'none'
    })

    const intervals: Intervals = {
        none: 'None',
        twicedaily: 'Twice per day',
        daily: 'Once a day'
    }

    // const selected_categories: Ref<string[]> = ref([]);
    const zoho_categories: Ref<ZohoCategory[]> = ref([]);
    const toggleSelectAll = (event: any) => {
        if (event.target.id === 'toggle-all') {
            if (event.target.checked) {
                zoho_categories.value.forEach((category: ZohoCategory) => category.selected = true);
            } else {
                zoho_categories.value.forEach((category: ZohoCategory) => category.selected = false);
            }
        }
    };

    /**
     * @description Function to build an indented category map for zoho categories, So children are indented bellow their parent.
     */
    const buildIndentedCategoryMap = (categories: any[], parentId: string, depth = 0) => {
        let result: ZohoCategory[] = [];
        categories
            .filter(cat => cat.parent_category_id === parentId)
            .forEach((cat: any) => {
                result.push({ id: cat.category_id, label: `${'<span class="ml-1 mr-1">-</span>'.repeat(depth)}${cat.name}`, selected: false });
                const children = buildIndentedCategoryMap(categories, cat.category_id, depth + 1);
                result = [...result, ...children];
            });

        return result;
    }

    const get_zoho_categories = async () => {
        const action = actions.zoho_categories;
        if (loader.isLoading(action)) return;
        loader.setLoading(action);
        const zohoCategories = await fetchData(action, keys.zoho_categories);
        if (zohoCategories && Array.isArray(zohoCategories)) {
            const indentedCategories = buildIndentedCategoryMap(zohoCategories, "-1");
            zoho_categories.value = indentedCategories;
        }
        loader.clearLoading(action);
    };

    /*
    * -----------------------------------------------------------------------------------------------------------------
    *  Order Settings
    * -----------------------------------------------------------------------------------------------------------------
    */
    const zoho_warehouses = ref({});
    const order_settings = reactive(<OrderSettings>{
        disable_sync: false,
        enable_auto_number: false,
        enable_order_status: false,
        enable_multicurrency: false,
        enable_warehousestock: false,
        order_prefix: '',
        warehouse_id: ''

    })
    const get_zoho_warehouses = async () => {
        const key = keys.zoho_warehouses;
        const instore = storage.get(key);
        if (instore) {
            zoho_warehouses.value = instore;
        }
        const action = actions.zoho_warehouses;
        if (loader.isLoading(action)) return;
        loader.setLoading(action);
        zoho_warehouses.value = await fetchData(action, key);
        loader.clearLoading(action);
    };
    /*
    * -----------------------------------------------------------------------------------------------------------------
    *  Contact Settings
    * -----------------------------------------------------------------------------------------------------------------
    */
    const contact_settings = reactive(<ContactSettings>{
        enable_cron: false
    })
    /*
    * -----------------------------------------------------------------------------------------------------------------
    *  Price Settings
    * -----------------------------------------------------------------------------------------------------------------
    */
    const zoho_prices = ref({});
    const wcb2b = ref({});
    const price_settings = reactive(<PriceSettings>{
        zoho_inventory_pricelist: '',
        wp_user_role: ''
    })
    const wcb2b_groups: Ref<UnwrapRef<{ key: string, value: string }[]>> = ref([]);
    function addGroup() {
        wcb2b_groups.value.push({ key: "", value: "" });
    }

    function removeGroup(index: number) {
        if (index === 0) return;
        wcb2b_groups.value.splice(index, 1);
    }
    const get_zoho_prices = async () => {
        const key = keys.price;
        const instore = storage.get(key);
        if (instore) {
            zoho_prices.value = instore;
        }
        const action = actions.zoho_prices;
        if (loader.isLoading(action)) return;
        loader.setLoading(action);
        zoho_prices.value = await fetchData(
            action,
            key
        );
        loader.clearLoading(action);
    }
    /*
    * -----------------------------------------------------------------------------------------------------------------
    *  Custom Fields Settings
    * -----------------------------------------------------------------------------------------------------------------
    */
    const customFields = ref({});
    const fields: Ref<UnwrapRef<{ key: string, value: string }[]>> = ref([])

    function addField() {
        fields.value.push({ key: "", value: "" });
    }

    function removeField(index: number) {
        fields.value.splice(index, 1);
    }

    const get_all_custom_fields = async () => {
        const key = keys.fields
        const instore = storage.get(key);
        if (instore) {
            customFields.value = instore;
        }
        const action = actions.custom_fields;
        if (loader.isLoading(action)) return;
        loader.setLoading(action);
        customFields.value = await fetchData(
            action,
            key
        );
        loader.clearLoading(action);
    }

    /*
     * -----------------------------------------------------------------------------------------------------------------
     *  Form Submit
     * -----------------------------------------------------------------------------------------------------------------
     */

    const handleSubmit = async (action: string) => {
        if (loader.isLoading(action)) return;
        loader.setLoading(action);

        let response: any = false;
        let data: any = {};
        let store: string = ''

        switch (action) {
            case actions.connect.save:
                data = connection;
                store = keys.connect
                break;
            case actions.tax.save:
                data = tax_settings;
                store = keys.tax
                break;
            case actions.product.save:
                data = product_settings;
                store = keys.product
                break;
            case actions.cron.save:
                const selectedCategories = zoho_categories.value.filter(cat => cat.selected).map(cat => cat.id);
                data = {
                    form: JSON.stringify(cron_settings),
                    categories: JSON.stringify(selectedCategories)
                };
                store = keys.cron
                break;
            case actions.order.save:
                data = order_settings
                store = keys.order
                break;
            case actions.contact.save:
                data = contact_settings
                store = keys.contact
                break;
            case actions.price.save:
                if (wcb2b_enabled) {
                    data = { wcb2b: JSON.stringify(wcb2b_groups.value) }
                } else {
                    data = price_settings
                }
                store = keys.price
                break;
            case actions.field.save:
                const fieldData = extractOptions(fields.value, 'key', 'value')
                data = {
                    form: JSON.stringify(fieldData),
                }
                store = keys.fields
                break;
            default:
                break;
        }

        if (Object.keys(data).length) {
            response = await sendData(action, data, store);
        }

        if (response) {
            notify.success(response.message);
            switch (action) {
                case actions.connect.save:
                    setTimeout(() => {
                        window.location.href = response.redirect;
                    }, 1000);
                    break;
                case actions.field.save:
                    if (fields.value.length === 0) {
                        fields.value.push({ key: "", value: "" });
                    }
                    break;
                case actions.price.save:
                    wcb2b.value = response.wcb2b;
                    break;
                default:
                    break;
            }

        }

        loader.clearLoading(action);
    };

    const handleReset = async (action: string, resetAll: boolean = false) => {
        let response: any = false;
        if (loader.isLoading(action)) return;
        loader.setLoading(action);

        // Show confirmation dialog for Reset All
        if (resetAll) {
            const confirmation = await Swal.fire({
                icon: "warning",
                title: "Reset All",
                text: "This will unmap all products and customers, continue?",
                showCancelButton: true,
                confirmButtonText: "Yes, reset all",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#d33",
            });

            if (!confirmation.isConfirmed) {
                loader.clearLoading(action);
                return;
            }
        }

        switch (action) {
            case actions.connect.reset:
                response = await resetData(action, keys.connect, { reset: resetAll });
                storage.remove(keys.connect);
                break;
            case actions.tax.reset:
                response = await resetData(action, keys.tax);
                break;
            case actions.product.reset:
                response = await resetData(action, keys.product);
                storage.remove(keys.product);
                break;
            case actions.cron.reset:
                response = await resetData(action, keys.cron);
                storage.remove(keys.cron);
                break;
            case actions.order.reset:
                response = await resetData(action, keys.order);
                storage.remove(keys.order);
                break;
            case actions.contact.reset:
                response = await resetData(action, keys.contact);
                storage.remove(keys.contact);
                break;
            case actions.price.reset:
                response = await resetData(action, keys.price);
                storage.remove(keys.price);
                break;
            case actions.field.reset:
                response = await resetData(action, keys.fields);
                storage.remove(keys.fields);
                break;
            default:
                break;
        }

        if (response) {

            notify.success(response.message);
            switch (action) {
                case actions.connect.reset:
                    connection.organization_id = "";
                    connection.client_id = "";
                    connection.client_secret = "";
                    connection.redirect_uri = redirect_uri;
                    connection.account_domain = "";
                    break;
                case actions.tax.reset:
                    tax_settings.selectedTaxRates = [];
                    break;
                case actions.product.reset:
                    product_settings.disable_product_sync = false;
                    product_settings.enable_accounting_stock = false;
                    product_settings.disable_stock_sync = false;
                    product_settings.item_from_zoho = false;
                    break;
                case actions.cron.reset:
                    cron_settings.disable_description_sync = false;
                    cron_settings.disable_image_sync = false;
                    cron_settings.disable_name_sync = false;
                    cron_settings.disable_price_sync = false;
                    cron_settings.zi_cron_interval = 'none'
                    // set selected categories to false
                    zoho_categories.value.forEach((cat: ZohoCategory) => {
                        cat.selected = false;
                    });
                    break;
                case actions.order.reset:
                    order_settings.disable_sync = false
                    order_settings.enable_auto_number = false
                    order_settings.enable_order_status = false
                    order_settings.enable_multicurrency = false
                    order_settings.enable_warehousestock = false
                    order_settings.order_prefix = ''
                    order_settings.warehouse_id = ''
                    break;
                case actions.contact.reset:
                    contact_settings.enable_cron = false
                    break;
                case actions.price.reset:
                    price_settings.zoho_inventory_pricelist = '';
                    price_settings.wp_user_role = ''
                    wcb2b_groups.value = [{ key: '', value: '' }];
                    break;
                case actions.field.reset:
                    fields.value = [];
                    break;
                default:
                    break;
            }

        }
        loader.clearLoading(action);
    };


    const tabWatcher = async (tab: string) => {
        let response;
        notSubscribed.value = storage.get(storeKey.homepage.subscription) && storage.get(storeKey.homepage.subscription).length;
        isConnected.value = storage.get(storeKey.zohoInventory.connected);

        if (tab !== "connect") {
            if (!isConnected.value) {
                selectedTab.value = "connect";
                return false;
            }
        }

        switch (tab) {
            case "connect":
                response = await loader.loadData(keys.connect, actions.connect.get);
                if (response) {
                    connection.organization_id = response.organization_id;
                    connection.client_id = response.client_id;
                    connection.client_secret = response.client_secret;
                    connection.redirect_uri = redirect_uri;
                    connection.account_domain = response.account_domain;
                }
                break;
            case "tax":
                get_wc_taxes();
                get_zoho_taxes();
                response = await loader.loadData(keys.tax, actions.tax.get);
                if (response) {
                    tax_settings.selectedTaxRates = response.selectedTaxRates;
                }
                break;
            case "product":
                await get_zoho_categories();
                response = await loader.loadData(keys.product, actions.product.get);
                if (response) {
                    product_settings.item_from_zoho = response.item_from_zoho;
                    product_settings.disable_stock_sync = response.disable_stock_sync;
                    product_settings.disable_product_sync = response.disable_product_sync;
                    product_settings.enable_accounting_stock = response.enable_accounting_stock;
                }
                break;
            case "cron":
                await get_zoho_categories();
                response = await loader.loadData(keys.cron, actions.cron.get);
                if (response) {
                    let parsed = response.form
                    if (typeof response.form === 'string') {
                        parsed = JSON.parse(response.form)
                    }
                    // Other cron settings
                    cron_settings.disable_name_sync = parsed.disable_name_sync;
                    cron_settings.disable_price_sync = parsed.disable_price_sync;
                    cron_settings.disable_image_sync = parsed.disable_image_sync;
                    cron_settings.disable_description_sync = parsed.disable_description_sync;
                    cron_settings.zi_cron_interval = parsed.zi_cron_interval
                    // Get zoho categories and map them if they are selected
                    let parsedCategories = response.categories
                    if (typeof parsedCategories === 'string') {
                        parsedCategories = JSON.parse(parsedCategories)
                    }
                    // Get category IDs and set them as selected in zoho_categories
                    zoho_categories.value.forEach((zohoCat: ZohoCategory) => {
                        if (parsedCategories.includes(zohoCat.id)) {
                            zohoCat.selected = true;
                        }
                    });
                }
                break;
            case "order":
                get_zoho_warehouses();
                response = await loader.loadData(keys.order, actions.order.get);
                if (response) {
                    order_settings.disable_sync = response.disable_sync;
                    order_settings.enable_auto_number = response.enable_auto_number;
                    order_settings.enable_order_status = response.enable_order_status;
                    order_settings.enable_multicurrency = response.enable_multicurrency;
                    order_settings.order_prefix = response.order_prefix;
                    order_settings.warehouse_id = response.warehouse_id;
                    order_settings.enable_warehousestock = response.enable_warehousestock;
                }
                break;
            case "contact":
                response = await loader.loadData(keys.contact, actions.contact.get);
                if (response) {
                    contact_settings.enable_cron = response.enable_cron;
                }
                break;
            case "price":
                get_zoho_prices();
                response = await loader.loadData(keys.price, actions.price.get);
                if (response) {
                    if (response.zoho_inventory_pricelist && response.wp_user_role) {
                        price_settings.zoho_inventory_pricelist = response.zoho_inventory_pricelist;
                        price_settings.wp_user_role = response.wp_user_role;
                    }

                    if (response.wcb2b) {
                        wcb2b_groups.value = [];
                        let parsed;
                        if (typeof response.wcb2b === 'string') {
                            parsed = JSON.parse(response.wcb2b);
                        } else {
                            parsed = response.wcb2b
                        }
                        console.log(parsed, response.wcb2b);

                        Object.entries(parsed).forEach(([key, value]: any) => {
                            const existingObject = wcb2b_groups.value.some(field => field.key === value.key && field.value === value.value);
                            if (!existingObject) {
                                wcb2b_groups.value.push(value);
                            }

                        });
                        console.log(wcb2b_groups.value);

                    }
                }
                if (wcb2b_groups.value.length === 0) {
                    wcb2b_groups.value.push({ key: "", value: "" });
                }

                break;
            case "field":
                get_all_custom_fields();
                response = await loader.loadData(keys.fields, actions.field.get);
                if (response) {
                    let parsed;
                    if (typeof response.form === 'string') {
                        parsed = JSON.parse(response.form);
                    } else {
                        parsed = response.form
                    }

                    Object.entries(parsed).forEach(([key, value]: any) => {
                        const existingObject = fields.value.some(field => field.key === key && field.value === value);
                        if (!existingObject) {
                            fields.value.push({ key, value });
                        }

                    });
                    if (fields.value.length === 0) {
                        fields.value.push({ key: "", value: "" });
                    }

                }
                break;
            default:
                break;
        }
    }
    watch(selectedTab, tabWatcher);
    return {
        selectTab,
        selectedTab,
        notSubscribed,
        isConnected,
        isConnectionValid,
        connection,
        connectionSettingsInvalid,
        wc_taxes,
        zoho_taxes,
        tax_settings,
        taxOptions,
        product_settings,
        sync,
        syncResponse,
        cron_settings,
        intervals,
        // selected_categories,
        zoho_categories,
        toggleSelectAll,
        order_settings,
        zoho_warehouses,
        zoho_prices,
        contact_settings,
        price_settings,
        wcb2b,
        wcb2b_groups,
        addGroup,
        removeGroup,
        customFields,
        fields,
        addField,
        removeField,
        handleSubmit,
        handleReset,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(
        acceptHMRUpdate(useZohoInventoryStore, import.meta.hot)
    );
}
