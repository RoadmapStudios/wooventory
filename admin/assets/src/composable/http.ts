import {baseurl, notify, security_token} from "@/composable/helpers";
import {useStorage} from "./storage";

/**
 * Generates the AJAX URL for a given action.
 *
 * @param {string} action - The action to be performed.
 * @return {string} The generated AJAX URL.
 */
export const ajaxUrl = (action: string): string => {
    const url = `${baseurl}`;
    const securityToken = `${security_token}`;
    return `${url}?security_token=${securityToken}&action=commercebird-app-${action}`;
}


/**
 * Fetches data from the server based on the provided action and stores it in the specified location.
 *
 * @param {string} action - The action to be performed on the server.
 * @param {string} storeKey - The key to store the fetched data in.
 * @return {Promise<any>} The fetched data.
 */
export const fetchData = async (action: string, storeKey: string): Promise<any> => {
    if (action === undefined) return;
    return await fetch(ajaxUrl(action))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                useStorage().save(storeKey, data.data);
                return data.data;
            } else {
                if (data.message) {
                    notify.error(data.message);
                    return;
                }
            }
        })
        .catch(error => {
            notify.error('Something went wrong. Please check your input and try again.');
            return;
        })
};

/**
 * Sends data to the server using AJAX.
 *
 * @param {string} action - The action to be performed on the server.
 * @param request
 * @param {string} storageKey - The key to store the returned data in local storage.
 * @return {Promise<any>} A promise that resolves to the returned data from the server.
 */
export const sendData = async (action: string, request: Object, storageKey: string): Promise<any> => {
    const headers = {'Content-Type': 'application/json'};
    const requestBody = JSON.stringify(request);

    let response = await fetch(ajaxUrl(action), {method: 'POST', headers, body: requestBody});
    if (response.status !== 200) {
        notify.error("Something went wrong. Please try again.");
        return;
    }
    let data: any = await response.json();
    if (data.success) {
        useStorage().save(storageKey, request);
        return data.data;
    } else {
        notify.error(data.data.message);
    }
}

/**
 * Resets the data by performing an asynchronous action and removing data from storage.
 *
 * @param {string} action - The action to perform.
 * @param {string} storeKey - The key of the data to remove from storage.
 * @return {Promise<any>} The data returned from the action, if successful.
 */
export const resetData = async (action: string, storeKey: string): Promise<any> => {
    const response = await fetch(ajaxUrl(action));

    const data = await response.json()
    if (data.success) {
        useStorage().remove(storeKey)
        return data.data
    } else {
        if (data.message) notify.error(data.message)
        return
    }
}
