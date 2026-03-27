const BASE_URL = "https://script.google.com/a/macros/stayvista.com/s/AKfycbwKMptO1wPYax603b29KSJInlpOGwR30kYLj2mG29tBVRMrlFCUjEuk-AfeQWvnEMpp7Q/exec";

export const getAudits = async () => {
  const res = await fetch(`${BASE_URL}?type=audits`);
  return res.json();
};

export const addAudit = async (data: any) => {
  await fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({
      type: "addAudit",
      ...data
    })
  });
};
