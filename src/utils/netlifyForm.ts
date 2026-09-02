// Submits a form's data to Netlify Forms.
//
// Netlify detects forms at *build time* by scanning the static HTML it
// deploys, so a form rendered only by client-side React is invisible to it.
// To work around that, a hidden, plain-HTML copy of each form (same
// `name`/`data-netlify="true"` and the same field names) lives in
// `index.html`. That static copy is what Netlify's bot indexes; this
// function is what actually submits the visitor's data, via a normal
// `application/x-www-form-urlencoded` POST to "/" with a `form-name` field
// matching the static form's name, exactly as Netlify's own docs describe
// for JS-driven forms.
export async function submitNetlifyForm(formName: string, fields: Record<string, string>): Promise<void> {
  const body = new URLSearchParams({ 'form-name': formName, ...fields }).toString();
  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) {
    throw new Error(`Form submission failed with status ${response.status}`);
  }
}
