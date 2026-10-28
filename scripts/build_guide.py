"""Build user-guide.html from Arka Glycan's docs/USER_GUIDE.md.

usage: python scripts/build_guide.py PATH/TO/glycan-tool/docs/USER_GUIDE.md

Needs Python-Markdown (pip install markdown==3.7). The page reuses the header and footer of
about.html, so the site's layout stays in one place. Rerun after the guide changes in the
app repository (which is private, so the site cannot fetch it by itself) and commit the
result.
"""
import re
import sys
from pathlib import Path

import markdown

SITE = Path(__file__).resolve().parent.parent


def main():
    source = Path(sys.argv[1])
    text = source.read_text(encoding="utf-8")
    body = markdown.markdown(text, extensions=["tables", "toc", "sane_lists"],
                             extension_configs={"toc": {"permalink": False}})
    template = (SITE / "about.html").read_text(encoding="utf-8")
    page = re.sub(r"<main>.*</main>", lambda _: (
        '<main>\n<section><div class="wrap prose">\n'
        '<p class="muted small">This is the guide included in the app (Help in the header). '
        'Arka Glycan is in an invite-only beta; see <a href="download.html">Download</a>.</p>\n'
        f"{body}\n</div></section>\n</main>"), template, flags=re.S)
    page = re.sub(r"<title>.*?</title>", "<title>User guide | Arka Glycan</title>", page)
    page = re.sub(r'<meta name="description" content="[^"]*">',
                  '<meta name="description" content="How to install and use Arka Glycan: settings, results, '
                  'confidence tiers, exports, licence and troubleshooting.">', page)
    page = page.replace(' aria-current="page"', "").replace('<a href="user-guide.html">User guide</a>',
                                                             '<a href="user-guide.html" aria-current="page">User guide</a>', 1)
    (SITE / "user-guide.html").write_text(page, encoding="utf-8")
    print(f"wrote user-guide.html from {source}")


if __name__ == "__main__":
    main()
