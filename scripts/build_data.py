import csv
import json
import os

# Read both CSVs
with open('data/vibespot_places_sheet3.csv', encoding='utf-8') as f1:
    rows1 = list(csv.DictReader(f1))

with open('data/vibespot_places_standardized_tags.csv', encoding='utf-8-sig') as f2:
    rows2 = list(csv.DictReader(f2))

# Map rows2 by id
map2 = {}
for r in rows2:
    id_val = r.get('id') or r.get('\ufeffid')
    if id_val:
        map2[id_val.strip()] = r

places = []
for r in rows1:
    pid = r['id'].strip()
    r2 = map2.get(pid, {})
    
    # Category cleanup
    cat = r['category'].strip()
    if 'Caf' in cat or 'caf' in cat.lower():
        cat = 'Cafés'
    
    # Tags merge
    raw1 = [t.strip() for t in r.get('tags', '').split(',') if t.strip()]
    raw2 = [t.strip() for t in r2.get('tags', '').split(',') if t.strip()]
    
    # Clean tags
    def clean_tag(t):
        if 'caf' in t.lower() and 'hangout' in t.lower():
            return 'Café & Hangout'
        if t.lower() == 'cafe':
            return 'Café'
        return t

    raw1 = [clean_tag(t) for t in raw1]
    raw2 = [clean_tag(t) for t in raw2]
    
    # Combine while preserving order and uniqueness: standardized tags first, then granular
    merged_tags = []
    seen = set()
    for t in raw2 + raw1:
        if t not in seen:
            seen.add(t)
            merged_tags.append(t)
            
    lat = float(r['latitude'].strip()) if r.get('latitude', '').strip() else None
    lon = float(r['longitude'].strip()) if r.get('longitude', '').strip() else None
    p2 = int(r['price_per_two'].strip()) if r.get('price_per_two', '').strip() else None
    
    place = {
        'id': pid,
        'name': r['name'].strip(),
        'address': r['address'].strip(),
        'category': cat,
        'maps_url': r.get('maps_url', '').strip() or None,
        'latitude': lat,
        'longitude': lon,
        'price_per_two': p2,
        'tags': merged_tags,
        'is_published': True,
        'created_at': '2026-10-28T00:00:00.000Z',
        'image_url': '/images/placeholder-restaurant.jpg',
        'gallery': ['/images/placeholder-restaurant.jpg'],
        'avg_price_rating': None,
        'avg_ambience': None,
        'avg_food_quality': None,
        'rating_count': None
    }
    places.append(place)

print(f'Generated {len(places)} places')
unique_cats = sorted(list(set(p['category'] for p in places)))
print('Categories:', unique_cats)
all_tags = sorted(list(set(t for p in places for t in p['tags'])))
print(f'Total unique tags ({len(all_tags)}):', all_tags[:10])

# Write sample-places.ts
ts_content = f"import {{ Place }} from '@/types';\n\nexport const SAMPLE_PLACES: Place[] = {json.dumps(places, indent=2, ensure_ascii=False)};\n"

with open('lib/data/sample-places.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

# Write seed.sql
def esc(s):
    if s is None:
        return 'null'
    return "'" + str(s).replace("'", "''") + "'"

def arr(a):
    if not a:
        return "'{}'"
    return 'ARRAY[' + ','.join(esc(x) for x in a) + ']'

lines = []
for p in places:
    line = f"({esc(p['id'])}, {esc(p['name'])}, {esc(p['address'])}, {esc(p['category'])}, {esc(p['maps_url'])}, {p['latitude']}, {p['longitude']}, {p['price_per_two']}, {arr(p['tags'])}, true, {esc(p['image_url'])}, {arr(p['gallery'])})"
    lines.append(line)

joined_lines = ',\n'.join(lines)
sql = f"""-- Vibespot seed data (54 Kakinada places)
-- Paste into Supabase SQL Editor after schema.sql
insert into public.places (id, name, address, category, maps_url, latitude, longitude, price_per_two, tags, is_published, image_url, gallery)
values
{joined_lines}
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
"""

with open('supabase/seed.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print('Updated lib/data/sample-places.ts and supabase/seed.sql successfully!')
