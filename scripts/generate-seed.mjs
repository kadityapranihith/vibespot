import fs from 'fs';

const src = fs.readFileSync('./lib/data/sample-places.ts', 'utf8');
const start = src.indexOf('= [') + 2;
const json = src.slice(start, src.lastIndexOf(']') + 1);
const places = JSON.parse(json);

function esc(s) {
  if (s == null) return 'null';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function arr(a) {
  if (!a || !a.length) return "'{}'";
  return 'ARRAY[' + a.map((x) => esc(x)).join(',') + ']';
}

const lines = places.map((p) => {
  return `(${esc(p.id)}, ${esc(p.name)}, ${esc(p.address)}, ${esc(p.category)}, ${esc(p.maps_url)}, ${p.latitude}, ${p.longitude}, ${p.price_per_two}, ${arr(p.tags)}, true, ${esc(p.image_url)}, ${arr(p.gallery)})`;
});

const sql = `-- Paste into Supabase SQL Editor after schema.sql
insert into public.places (id, name, address, category, maps_url, latitude, longitude, price_per_two, tags, is_published, image_url, gallery)
values
${lines.join(',\n')}
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  category = excluded.category,
  maps_url = excluded.maps_url,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  price_per_two = excluded.price_per_two,
  tags = excluded.tags,
  is_published = excluded.is_published,
  image_url = excluded.image_url,
  gallery = excluded.gallery;
`;

fs.writeFileSync('./supabase/seed.sql', sql);
console.log('seed rows', places.length);
