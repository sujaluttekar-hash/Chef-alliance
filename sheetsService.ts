// src/services/sheetsService.js
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbw96AsJvJSA1Ny3HlvvINFp8i3P1OTPKj9sTio23C6h7__-XdtGeM2eZ7bzVzUlBOFFpQ/exec";

async function request(action, payload = {}) {
  try {
    const res = await fetch(SHEETS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, ...payload }),
    });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("Non-JSON response:", text);
      return { error: text };
    }

  } catch (err) {
    console.error("Request failed:", err);
    return { error: "Network error" };
  }
}

// USERS
export const getUsers       = ()           => request("GET_USERS");
export const addUser        = (user)       => request("ADD_USER",    { user });
export const updateUser     = (user)       => request("UPDATE_USER", { user });
export const deleteUser     = (userId)     => request("DELETE_USER", { userId });

// VENDORS
export const getVendors     = ()           => request("GET_VENDORS");
export const addVendor      = (vendor)     => request("ADD_VENDOR",    { vendor });
export const updateVendor   = (vendor)     => request("UPDATE_VENDOR", { vendor });
export const deleteVendor   = (vendorId)   => request("DELETE_VENDOR", { vendorId });

// PROPERTIES
export const getProperties  = ()           => request("GET_PROPERTIES");
export const addProperty    = (prop)       => request("ADD_PROPERTY",    { prop });
export const deleteProperty = (propId)     => request("DELETE_PROPERTY", { propId });

// AUDITS
export const getAudits      = ()           => request("GET_AUDITS");
export const addAudit       = (audit)      => request("ADD_AUDIT", { audit });

// ALLOCATIONS
export const getAllocations   = ()                 => request("GET_ALLOCATIONS");
export const addAllocation    = (allocation)       => request("ADD_ALLOCATION",    { allocation });
export const removeAllocation = (vendorId, date)   => request("REMOVE_ALLOCATION", { vendorId, date });

// TRAININGS
export const getTrainings   = ()           => request("GET_TRAININGS");
export const addTraining    = (training)   => request("ADD_TRAINING",    { training });
export const updateTraining = (training)   => request("UPDATE_TRAINING", { training });

// VILLA AUDITS
export const getVillaAudits   = ()         => request("GET_VILLA_AUDITS");
export const addVillaAudit    = (va)       => request("ADD_VILLA_AUDIT",    { villaAudit: va });
export const updateVillaAudit = (va)       => request("UPDATE_VILLA_AUDIT", { villaAudit: va });

// AUTH
export const getUserByPhone    = (phone)    => request("GET_USER_BY_PHONE",    { phone });
export const getUserByUsername = (username) => request("GET_USER_BY_USERNAME", { username });
