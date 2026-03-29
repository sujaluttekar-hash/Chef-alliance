// src/services/sheetsService.js
const SHEETS_URL = "https://script.google.com/a/macros/stayvista.com/s/AKfycbw96AsJvJSA1Ny3HlvvINFp8i3P1OTPKj9sTio23C6h7__-XdtGeM2eZ7bzVzUlBOFFpQ/exec";

async function request(action, payload = {}) {
  const res = await fetch(SHEETS_URL, {
    method: "POST",
    body: JSON.stringify({ action, ...payload }),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: text }; }
}

export const getUsers       = ()           => request("GET_USERS");
export const addUser        = (user)       => request("ADD_USER",    { user });
export const updateUser     = (user)       => request("UPDATE_USER", { user });
export const deleteUser     = (userId)     => request("DELETE_USER", { userId });

export const getVendors     = ()           => request("GET_VENDORS");
export const addVendor      = (vendor)     => request("ADD_VENDOR",    { vendor });
export const updateVendor   = (vendor)     => request("UPDATE_VENDOR", { vendor });
export const deleteVendor   = (vendorId)   => request("DELETE_VENDOR", { vendorId });

export const getProperties  = ()           => request("GET_PROPERTIES");
export const addProperty    = (prop)       => request("ADD_PROPERTY",    { prop });
export const deleteProperty = (propId)     => request("DELETE_PROPERTY", { propId });

export const getAudits      = ()           => request("GET_AUDITS");
export const addAudit       = (audit)      => request("ADD_AUDIT", { audit });

export const getAllocations   = ()                 => request("GET_ALLOCATIONS");
export const addAllocation    = (allocation)       => request("ADD_ALLOCATION",    { allocation });
export const removeAllocation = (vendorId, date)   => request("REMOVE_ALLOCATION", { vendorId, date });

export const getTrainings   = ()           => request("GET_TRAININGS");
export const addTraining    = (training)   => request("ADD_TRAINING",    { training });
export const updateTraining = (training)   => request("UPDATE_TRAINING", { training });

export const getVillaAudits   = ()         => request("GET_VILLA_AUDITS");
export const addVillaAudit    = (va)       => request("ADD_VILLA_AUDIT",    { villaAudit: va });
export const updateVillaAudit = (va)       => request("UPDATE_VILLA_AUDIT", { villaAudit: va });

export const getUserByPhone    = (phone)    => request("GET_USER_BY_PHONE",    { phone });
export const getUserByUsername = (username) => request("GET_USER_BY_USERNAME", { username });
