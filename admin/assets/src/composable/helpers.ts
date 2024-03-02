import { Notyf } from "notyf";
import type { PluginObject } from "@/types";
import Swal from "sweetalert2";

declare global {
  interface Window {
    commercebird_admin: PluginObject;
  }
}
export const webhooks = window.commercebird_admin.webhooks;
export const baseurl = window.commercebird_admin.url;
export const site_url = window.commercebird_admin.site_url;
export const security_token = window.commercebird_admin.security_token;
export const api_token = window.commercebird_admin.api_token;
export const taxEnabled = window.commercebird_admin.wc_tax_enabled === "1";
export const roles = window.commercebird_admin.roles;
export const b2b_enabled = window.commercebird_admin.b2b_enabled === "1";
export const fileinfo_enabled =
  window.commercebird_admin.fileinfo_enabled === "1";
export const redirect_uri = window.commercebird_admin.redirect_uri;
export const acf_enabled = window.commercebird_admin.acf_enabled === "1";
export const cosw_enabled = window.commercebird_admin.cosw_enabled === "1";
export const wcb2b_enabled = window.commercebird_admin.wcb2b_enabled === "1";
export const wcb2b_groups = window.commercebird_admin.wcb2b_groups;
export const eo_sync = window.commercebird_admin.eo_sync === "1";
export const origin = window.location.origin;

/**
 * Extracts options from data based on warehouse ID and name.
 * @param {Array<{ [key: string]: string}>} data - The data to extract options from.
 * @param {string} key - The key for the warehouse ID in the data.
 * @param {string} value - The key for the warehouse name in the data.
 * @returns {Object} - The extracted options.
 */
export function extractOptions(
  data: Array<{ [key: string]: string }>,
  key: string,
  value: string
): Object {
  return data.reduce((result, item) => {
    result[item[key]] = item[value];
    return result;
  }, {});
}

/**
 * Formats a given date string into a localized date and time string.
 *
 * @param {string} dateString - The date string to be formatted.
 * @return {string} The formatted date string.
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Generates a basic authentication string for the API.
 *
 * @return {string} The basic authentication string.
 */
export const basicAuth = (): string => {
  let hash = btoa(
    `${import.meta.env.VITE_APP_API_KEY}:${import.meta.env.VITE_APP_API_SECRET}`
  );
  return "Basic " + hash;
};

export const uc_words = (str: string): string =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

export const notify: Notyf = new Notyf({
  position: { x: "center", y: "bottom" },
  dismissible: true,
  ripple: true,
});

export const Toast = Swal.mixin({
  toast: true,
  position: "bottom",
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  target: "#commercebird-app",
  customClass: {
    container: "w-fit mb-10",
  },
});

export const ConfirmModal = Swal.mixin({
  icon: "question",
  showConfirmButton: true,
  showDenyButton: true,
  confirmButtonText: "Yes",
  denyButtonText: "No",
  target: "#commercebird-app",
  timerProgressBar: false,
  customClass: {
    htmlContainer: "grid grid-cols-2",
    icon: "border-4 border-teal-600 rounded-full bg-white text-teal-700",
    actions: "flex w-full items-center  gap-4 ",
    confirmButton:
      "py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border-4 border-teal-600 bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
    denyButton:
      "py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none",
  },
});

export const tokenImage =
  "data:image/png;base64,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";
