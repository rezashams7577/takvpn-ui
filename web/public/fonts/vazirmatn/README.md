# Vazirmatn (self-hosted)

Run from repo root:

```bash
chmod +x scripts/download-vazirmatn-fonts.sh
./scripts/download-vazirmatn-fonts.sh
```

Required files (TTF or woff2):

- `Vazirmatn-Regular` (400)
- `Vazirmatn-Medium` (500)
- `Vazirmatn-Bold` (700)

The app loads `.ttf` from this folder. Until these exist, FA pages fall back to Tahoma.
