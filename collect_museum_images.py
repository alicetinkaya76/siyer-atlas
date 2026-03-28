#!/usr/bin/env python3
"""
Siyer Atlası — Museum Image Collector v1.0
==========================================
Wikimedia Commons'tan müze objeleri için resim toplama scripti.

Kullanım:
  python3 collect_museum_images.py                  # Tüm kategoriler
  python3 collect_museum_images.py --category architecture  # Tek kategori
  python3 collect_museum_images.py --category geography --dry-run  # Sadece sorgu göster
  python3 collect_museum_images.py --id geo_sacred_001      # Tek obje

Gereksinimler:
  pip install requests Pillow

Çıktı:
  public/images/museum/{category}/{id}.webp     — optimize resimler
  public/images/museum/attributions.json         — lisans/atıf bilgileri
  public/data/museum/museum_{category}.json      — güncellenen JSON (image field)
"""

import argparse
import json
import os
import sys
import time
import hashlib
import re
from pathlib import Path
from typing import Optional
from urllib.parse import quote

try:
    import requests
except ImportError:
    print("❌ requests kütüphanesi gerekli: pip install requests")
    sys.exit(1)

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("⚠️  Pillow yok — resimler optimize edilmeden kaydedilecek. pip install Pillow")

# ─── CONFIG ───
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "public" / "data" / "museum"
IMAGE_DIR = BASE_DIR / "public" / "images" / "museum"
ATTR_FILE = IMAGE_DIR / "attributions.json"

WIKIMEDIA_API = "https://commons.wikimedia.org/w/api.php"
MAX_IMAGE_WIDTH = 800  # px — web optimized
WEBP_QUALITY = 82
RATE_LIMIT_SECONDS = 1.5  # Wikimedia API rate limit

CATEGORIES = ['architecture', 'geography', 'weapons', 'manuscripts', 'daily_life', 'medical', 'flags']

# ─── SEARCH TERM MAPPING ───
# Her obje için akıllı arama terimleri üretir.
# Önce özel harita, bulunamazsa otomatik üretim.

CUSTOM_SEARCH_TERMS: dict[str, list[str]] = {
    # ═══ ARCHITECTURE ═══
    "arch_hatice_evi": ["Khadija house Mecca", "birthplace Muhammad Mecca"],
    "arch_darul_erkam": ["Dar al-Arqam Mecca"],
    "arch_mescidi_haram": ["Masjid al-Haram Mecca", "Great Mosque Mecca aerial"],
    "arch_mescidi_nebevi": ["Al-Masjid an-Nabawi Medina", "Prophet Mosque Medina"],
    "arch_mescidi_kuba": ["Quba Mosque Medina", "Masjid Quba"],
    "arch_mescidi_kiblatain": ["Masjid al-Qiblatain Medina"],
    "arch_mescidi_aksa": ["Al-Aqsa Mosque Jerusalem", "Masjid al-Aqsa"],
    "arch_kabe": ["Kaaba Mecca", "Holy Kaaba"],
    "arch_suffa": ["Suffah Medina mosque", "Ahl al-Suffah"],
    "arch_suk_ukaz": ["Souk Okaz Taif", "Suq Ukaz"],

    # ═══ GEOGRAPHY ═══
    "geo_sacred_001": ["Kaaba Mecca", "Holy Kaaba Masjid al-Haram"],
    "geo_sacred_002": ["Prophet Mosque Medina green dome", "Al-Masjid an-Nabawi"],
    "geo_sacred_003": ["Al-Aqsa Mosque Jerusalem dome"],
    "geo_sacred_004": ["Quba Mosque Medina"],
    "geo_uhud": ["Mount Uhud Medina", "Jabal Uhud"],
    "geo_hira": ["Jabal al-Noor Hira cave Mecca", "Mount Hira"],
    "geo_sevr": ["Mount Thawr Mecca cave", "Jabal Thawr"],
    "geo_arafat": ["Mount Arafat Mecca", "Jabal Arafat pilgrimage"],
    "geo_nur": ["Jabal al-Noor Mecca", "Mountain of Light Mecca"],

    # ═══ WEAPONS ═══
    "sword_zulfiqar": ["Zulfiqar sword Islamic", "Dhul-Fiqar"],
    "sword_masur": ["Islamic sword early", "Arab sword 7th century"],
    "armor_dir": ["chainmail Islamic armor", "dir armor medieval"],
    "bow_arab": ["Arab composite bow", "Islamic bow archery"],
    "shield_daraka": ["Islamic shield darqah", "Arab round shield"],
    "helmet_bayda": ["Islamic helmet bayda", "Arab helmet medieval"],

    # ═══ MANUSCRIPTS ═══
    "ms_mushaf_osman": ["Samarkand Kufic Quran", "Uthman Quran manuscript Topkapi"],
    "ms_mushaf_ebubekir": ["Early Quran manuscript Kufic"],
    "ms_sahife_sadika": ["Abdullah ibn Amr hadith manuscript"],
    "ms_medine_vesikasi": ["Constitution Medina document", "Charter Medina"],
    "ms_hudeybiye": ["Treaty Hudaybiyyah"],

    # ═══ DAILY LIFE ═══
    "dl_dinar_islami": ["Islamic gold dinar early", "Umayyad dinar coin"],
    "dl_dirhem": ["Islamic silver dirham early", "Arab Sassanian dirham"],
    "dl_miskal": ["Islamic weight misqal", "Arab weight measure"],
}


def generate_search_terms(item: dict, category: str) -> list[str]:
    """Obje için arama terimleri üret."""
    item_id = item.get('id', '')

    # Önce özel haritaya bak
    if item_id in CUSTOM_SEARCH_TERMS:
        return CUSTOM_SEARCH_TERMS[item_id]

    # Otomatik üretim
    name_en = item.get('name', {}).get('en', '')
    name_ar = item.get('name', {}).get('ar', '')
    subcategory = item.get('subcategory', '')

    terms = []

    if category == 'architecture':
        terms.append(f"{name_en} mosque")
        terms.append(f"{name_en} Islamic architecture")
        if name_ar:
            terms.append(name_ar)

    elif category == 'geography':
        terms.append(name_en)
        terms.append(f"{name_en} Saudi Arabia")
        if 'mountain' in subcategory or 'cave' in subcategory:
            terms.append(f"{name_en} mountain")
        elif 'well' in subcategory or 'spring' in subcategory:
            terms.append(f"{name_en} well water")

    elif category == 'weapons':
        terms.append(f"{name_en} Islamic weapon")
        terms.append(f"{name_en} Arab medieval")
        terms.append(f"Islamic {subcategory.replace('_', ' ')}")

    elif category == 'manuscripts':
        terms.append(f"{name_en} manuscript")
        terms.append(f"{name_en} Islamic calligraphy")

    elif category == 'daily_life':
        terms.append(f"{name_en} Islamic artifact")
        terms.append(f"early Islamic {subcategory.replace('_', ' ')}")
        if 'coin' in subcategory or 'currency' in subcategory:
            terms.append(f"Islamic coin {name_en}")

    elif category == 'medical':
        clean = name_en.split('(')[0].strip()
        terms.append(f"{clean} herb plant")
        terms.append(f"{clean} medicinal")

    elif category == 'flags':
        terms.append(f"{name_en} Islamic banner")
        terms.append(f"Islamic flag early")

    # Fallback: Arapça isim
    if name_ar and len(terms) < 3:
        terms.append(name_ar)

    return terms[:4]  # Max 4 arama terimi


def search_wikimedia(query: str, limit: int = 5) -> list[dict]:
    """Wikimedia Commons'ta resim ara."""
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": 6,  # File namespace
        "gsrsearch": f"filetype:bitmap {query}",
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url|size|mime|extmetadata",
        "iiurlwidth": MAX_IMAGE_WIDTH,
    }

    try:
        resp = requests.get(WIKIMEDIA_API, params=params, timeout=15,
                           headers={"User-Agent": "SiyerAtlasBot/1.0 (museum image collector)"})
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  ⚠️  API hatası: {e}")
        return []

    pages = data.get("query", {}).get("pages", {})
    results = []

    for page_id, page in pages.items():
        ii = page.get("imageinfo", [{}])[0]
        ext = ii.get("extmetadata", {})

        # Lisans kontrolü — sadece CC veya public domain
        license_short = ext.get("LicenseShortName", {}).get("value", "")
        license_url = ext.get("LicenseUrl", {}).get("value", "")

        is_free = any(tag in license_short.lower() for tag in [
            "cc", "public domain", "pd", "gfdl", "free", "cc0"
        ])

        if not is_free:
            continue

        # MIME kontrolü
        mime = ii.get("mime", "")
        if mime not in ("image/jpeg", "image/png", "image/webp", "image/tiff"):
            continue

        # Boyut kontrolü — en az 200px
        width = ii.get("width", 0)
        if width < 200:
            continue

        thumb_url = ii.get("thumburl", ii.get("url", ""))
        original_url = ii.get("url", "")
        artist = ext.get("Artist", {}).get("value", "Unknown")
        # HTML tag temizle
        artist = re.sub(r'<[^>]+>', '', artist).strip()

        results.append({
            "title": page.get("title", ""),
            "thumb_url": thumb_url,
            "original_url": original_url,
            "width": ii.get("thumbwidth", width),
            "height": ii.get("thumbheight", ii.get("height", 0)),
            "license": license_short,
            "license_url": license_url,
            "artist": artist[:200],
            "description": ext.get("ImageDescription", {}).get("value", "")[:200],
        })

    return results


def download_image(url: str, save_path: Path) -> bool:
    """Resmi indir ve opsiyonel olarak WebP'ye çevir."""
    try:
        resp = requests.get(url, timeout=30, stream=True,
                           headers={"User-Agent": "SiyerAtlasBot/1.0"})
        resp.raise_for_status()

        # Geçici dosyaya kaydet
        tmp_path = save_path.with_suffix('.tmp')
        with open(tmp_path, 'wb') as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        # WebP'ye çevir (Pillow varsa)
        if HAS_PIL and save_path.suffix == '.webp':
            try:
                img = Image.open(tmp_path)
                # EXIF rotation fix
                from PIL import ExifTags
                try:
                    for orientation in ExifTags.TAGS.keys():
                        if ExifTags.TAGS[orientation] == 'Orientation':
                            break
                    exif = img._getexif()
                    if exif and orientation in exif:
                        if exif[orientation] == 3:
                            img = img.rotate(180, expand=True)
                        elif exif[orientation] == 6:
                            img = img.rotate(270, expand=True)
                        elif exif[orientation] == 8:
                            img = img.rotate(90, expand=True)
                except (AttributeError, KeyError):
                    pass

                # Resize if too large
                if img.width > MAX_IMAGE_WIDTH:
                    ratio = MAX_IMAGE_WIDTH / img.width
                    new_h = int(img.height * ratio)
                    img = img.resize((MAX_IMAGE_WIDTH, new_h), Image.LANCZOS)

                img.save(save_path, 'WEBP', quality=WEBP_QUALITY, method=4)
                tmp_path.unlink()
                return True
            except Exception as e:
                print(f"  ⚠️  WebP çevirme hatası: {e}")
                # Fallback: orijinal dosyayı kullan
                tmp_path.rename(save_path.with_suffix('.jpg'))
                return True
        else:
            # Pillow yoksa orijinal formatla kaydet
            ext = '.jpg' if 'jpeg' in url.lower() or 'jpg' in url.lower() else '.png'
            final = save_path.with_suffix(ext)
            tmp_path.rename(final)
            return True

    except Exception as e:
        print(f"  ❌ İndirme hatası: {e}")
        if tmp_path.exists():
            tmp_path.unlink()
        return False


def select_best_image(results: list[dict], item: dict) -> Optional[dict]:
    """Sonuçlar arasından en uygun resmi seç."""
    if not results:
        return None

    # Scoring
    name_en = item.get('name', {}).get('en', '').lower()
    scored = []

    for r in results:
        score = 0
        title = r['title'].lower()
        desc = r.get('description', '').lower()

        # İsim eşleşmesi
        name_words = name_en.split()
        for w in name_words:
            if len(w) > 3 and w in title:
                score += 10
            if len(w) > 3 and w in desc:
                score += 5

        # Boyut tercihi (çok büyük değil, çok küçük değil)
        w = r.get('width', 0)
        if 400 <= w <= 1200:
            score += 5
        elif w > 1200:
            score += 3

        # CC0 / Public Domain bonus
        lic = r.get('license', '').lower()
        if 'cc0' in lic or 'public domain' in lic:
            score += 3

        scored.append((score, r))

    scored.sort(key=lambda x: -x[0])
    return scored[0][1] if scored else results[0]


def process_item(item: dict, category: str, dry_run: bool = False, force: bool = False) -> Optional[dict]:
    """Tek bir obje için resim bul, indir, kaydet."""
    item_id = item.get('id', '')
    name_en = item.get('name', {}).get('en', '?')

    # Hedef dosya
    cat_dir = IMAGE_DIR / category
    target = cat_dir / f"{item_id}.webp"

    # Zaten varsa atla (force değilse)
    if target.exists() and not force:
        print(f"  ⏭️  {item_id}: zaten var")
        return None

    # Arama terimleri üret
    terms = generate_search_terms(item, category)

    if dry_run:
        print(f"  🔍 {item_id}: {name_en}")
        for t in terms:
            print(f"     → \"{t}\"")
        return None

    print(f"  🔍 {item_id}: {name_en}")

    # Her arama terimi dene
    all_results = []
    for term in terms:
        results = search_wikimedia(term, limit=3)
        all_results.extend(results)
        time.sleep(RATE_LIMIT_SECONDS)

        if len(all_results) >= 5:
            break

    if not all_results:
        print(f"     ❌ Sonuç bulunamadı")
        return None

    # En iyi resmi seç
    best = select_best_image(all_results, item)
    if not best:
        print(f"     ❌ Uygun resim yok")
        return None

    print(f"     📥 {best['title'][:60]}… ({best['width']}×{best['height']})")
    print(f"     📄 Lisans: {best['license']}")

    # İndir
    cat_dir.mkdir(parents=True, exist_ok=True)
    success = download_image(best['thumb_url'], target)

    if success:
        # Dosya boyutu
        size_kb = target.stat().st_size / 1024 if target.exists() else 0
        actual = target if target.exists() else target.with_suffix('.jpg')
        if actual.exists():
            size_kb = actual.stat().st_size / 1024
        print(f"     ✅ Kaydedildi: {actual.name} ({size_kb:.0f} KB)")

        return {
            "item_id": item_id,
            "category": category,
            "filename": actual.name,
            "source_url": best['original_url'],
            "wikimedia_title": best['title'],
            "license": best['license'],
            "license_url": best.get('license_url', ''),
            "artist": best['artist'],
        }

    return None


def update_museum_json(category: str, image_map: dict[str, str]):
    """Museum JSON dosyasını image field ile güncelle."""
    json_path = DATA_DIR / f"museum_{category}.json"
    if not json_path.exists():
        return

    with open(json_path) as f:
        data = json.load(f)

    items = data.get('items', data) if isinstance(data, dict) else data
    updated = 0

    if isinstance(items, list):
        for item in items:
            item_id = item.get('id', '')
            if item_id in image_map:
                item['image'] = f"/images/museum/{category}/{image_map[item_id]}"
                updated += 1

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  📝 {json_path.name}: {updated} item güncellendi")


def main():
    parser = argparse.ArgumentParser(description="Siyer Atlası Museum Image Collector")
    parser.add_argument('--category', '-c', choices=CATEGORIES, help='Tek kategori işle')
    parser.add_argument('--id', help='Tek obje ID (ör: geo_sacred_001)')
    parser.add_argument('--dry-run', '-n', action='store_true', help='Sadece arama terimlerini göster')
    parser.add_argument('--force', '-f', action='store_true', help='Mevcut resimlerin üzerine yaz')
    parser.add_argument('--limit', '-l', type=int, default=0, help='Kategori başına max obje (0=sınırsız)')
    args = parser.parse_args()

    print("=" * 60)
    print("  🏛️  Siyer Atlası — Museum Image Collector v1.0")
    print("=" * 60)
    print()

    if args.dry_run:
        print("  📋 DRY RUN — resim indirilmeyecek, sadece sorgular gösterilecek\n")

    # Dizin oluştur
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    # Attributions dosyası yükle/oluştur
    attributions = []
    if ATTR_FILE.exists():
        with open(ATTR_FILE) as f:
            attributions = json.load(f)
    attr_ids = {a['item_id'] for a in attributions}

    cats = [args.category] if args.category else CATEGORIES
    total_downloaded = 0
    total_skipped = 0
    total_failed = 0

    for cat in cats:
        json_path = DATA_DIR / f"museum_{cat}.json"
        if not json_path.exists():
            print(f"⚠️  {json_path} bulunamadı, atlıyorum")
            continue

        with open(json_path) as f:
            data = json.load(f)

        items = data.get('items', data) if isinstance(data, dict) else data
        if not isinstance(items, list):
            continue

        # Tek ID filtresi
        if args.id:
            items = [i for i in items if i.get('id') == args.id]
            if not items:
                continue

        print(f"\n{'─' * 50}")
        print(f"📁 {cat.upper()} — {len(items)} obje")
        print(f"{'─' * 50}")

        image_map = {}  # id → filename
        limit = args.limit if args.limit > 0 else len(items)

        for i, item in enumerate(items[:limit]):
            result = process_item(item, cat, dry_run=args.dry_run, force=args.force)

            if result:
                total_downloaded += 1
                image_map[result['item_id']] = result['filename']

                # Attribution ekle
                if result['item_id'] not in attr_ids:
                    attributions.append(result)
                    attr_ids.add(result['item_id'])
            else:
                if not args.dry_run:
                    item_id = item.get('id', '')
                    target = IMAGE_DIR / cat / f"{item_id}.webp"
                    if target.exists():
                        total_skipped += 1
                    else:
                        total_failed += 1

        # JSON güncelle
        if image_map and not args.dry_run:
            update_museum_json(cat, image_map)

    # Attributions kaydet
    if not args.dry_run and attributions:
        with open(ATTR_FILE, 'w', encoding='utf-8') as f:
            json.dump(attributions, f, ensure_ascii=False, indent=2)
        print(f"\n📝 Attributions: {ATTR_FILE} ({len(attributions)} kayıt)")

    # Özet
    print(f"\n{'=' * 60}")
    print(f"  📊 ÖZET")
    print(f"  ✅ İndirilen: {total_downloaded}")
    print(f"  ⏭️  Atlanan (mevcut): {total_skipped}")
    print(f"  ❌ Bulunamayan: {total_failed}")
    print(f"{'=' * 60}")

    if total_failed > 0:
        print(f"\n💡 İPUCU: Bulunamayan objeler için:")
        print(f"   1. https://commons.wikimedia.org adresinde manuel arayın")
        print(f"   2. Resmi indirip public/images/museum/{{kategori}}/{{id}}.webp olarak kaydedin")
        print(f"   3. Scripti --force ile yeniden çalıştırın")

    if args.dry_run:
        print(f"\n🔄 Gerçek indirme için: python3 {sys.argv[0]} {'--category ' + args.category if args.category else ''}")


if __name__ == '__main__':
    main()
