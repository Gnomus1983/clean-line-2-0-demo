#!/usr/bin/env python3
"""Generate QR code for deployed PWA URL.
Usage: python3 tools/make_qr.py https://your-demo-url.vercel.app cleanline-qr.png
"""
import sys, qrcode
if len(sys.argv) < 3:
    print('Usage: python3 tools/make_qr.py <url> <output.png>')
    raise SystemExit(1)
img = qrcode.make(sys.argv[1])
img.save(sys.argv[2])
print('Saved', sys.argv[2])
