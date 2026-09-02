const fs = require('fs');
const path = require('path');

const sourceDirectory = 'E:\\My  Website DO NOT DELETE OR MOVE\\paktaxcalculator-main\\paktaxcalculator-main\\fbr-data';
const outputFile = path.resolve(__dirname, '..', 'supabase-property-valuation-seed.sql');

const escapeSql = (value) => String(value ?? '').replace(/'/g, "''");
const toNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

const statements = [
  '-- Generated from official FBR S.R.O. 1679(I)/2024 locality data.',
  '-- Run supabase-schema.sql first, then run this file in the Supabase SQL Editor.',
  'begin;',
];

const files = fs.readdirSync(sourceDirectory)
  .filter((fileName) => fileName.endsWith('.json') && fileName !== '_index.json')
  .sort((first, second) => first.localeCompare(second));

for (const fileName of files) {
  const city = path.basename(fileName, '.json');
  const source = JSON.parse(fs.readFileSync(path.join(sourceDirectory, fileName), 'utf8'));
  const rows = Array.isArray(source.rows)
    ? source.rows
    : Array.isArray(source.sections)
      ? source.sections.flatMap((section) => Array.isArray(section.rows) ? section.rows : [])
      : [];

  for (const row of rows) {
    const locality = row.area || row.tehsil;
    if (!locality) continue;

    statements.push(
      `insert into public.property_valuation_rates (city, locality, residential_rate, commercial_rate, industrial_rate, classification, notification_reference, effective_date) values ('${escapeSql(city)}', '${escapeSql(locality)}', ${toNumber(row.resOpen ?? row.resBuilt ?? row.land)}, ${toNumber(row.comOpen ?? row.comBuilt ?? row.land)}, ${toNumber(row.indOpen ?? row.indBuilt ?? row.land)}, ${row.cls ? `'${escapeSql(row.cls)}'` : 'null'}, '${escapeSql(source.sro ?? 'S.R.O. 1679(I)/2024')}', ${source.effectiveDate ? `'${escapeSql(source.effectiveDate)}'` : 'null'}) on conflict (city, locality) do update set residential_rate = excluded.residential_rate, commercial_rate = excluded.commercial_rate, industrial_rate = excluded.industrial_rate, classification = excluded.classification, notification_reference = excluded.notification_reference, effective_date = excluded.effective_date;`
    );
  }
}

statements.push('commit;');
fs.writeFileSync(outputFile, `${statements.join('\n')}\n`);
console.log(`Generated ${statements.length - 4} locality rate records in ${outputFile}`);
