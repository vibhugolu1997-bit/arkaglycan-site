# arkaglycan.com

The product website for [Arka Glycan](https://arkaglycan.com): plain static HTML and CSS
(no framework, no build step for the pages), served by GitHub Pages from this repository's
`main` branch at the custom domain in `CNAME`.

| Page | File |
|---|---|
| Home (hero, problem, how it works, validation, comparison, pricing, beta sign-up) | `index.html` |
| Pricing | `pricing.html` |
| Download (invite-only beta) | `download.html` |
| User guide | `user-guide.html` (generated, see below) |
| About us, Contact us | `about.html`, `contact.html` |
| Shipping and delivery, Refund and cancellation | `shipping.html`, `refunds.html` |
| Terms and conditions, Privacy policy | `terms.html`, `privacy.html` |
| Not found | `404.html` |

All pages share `styles.css` (dark navy and amber) and repeat the same header and footer;
change those in every page together.

## Contact details

Every page's footer gives hello@arkaglycan.com (Zoho Mail) and the postal address
Professor Colony, Budaun 243601, Uttar Pradesh, India. To change either, replace it in
every page together. The policy pages are drafts: have them reviewed before accepting payments.

## The beta form

The form on the home page builds a pre-filled email (`mailto:`) in the visitor's own mail
app with a few lines of JavaScript; nothing is sent to any server or form service. Without
JavaScript the browser falls back to a plain `mailto:` form.

## Rebuilding the user guide

`user-guide.html` is generated from `docs/USER_GUIDE.md` in the (private) app repository,
reusing the header and footer of `about.html`:

```bash
python3 -m pip install markdown==3.7
python3 scripts/build_guide.py ../glycan-tool/docs/USER_GUIDE.md
```

Run it whenever the guide changes in the app, and commit the result.

## Domain

`CNAME` holds `arkaglycan.com`. DNS at the registrar: four `A` records for `@`
(185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153), optionally four
`AAAA` records (2606:50c0:8000::153 … 2606:50c0:8003::153), and a `CNAME` for `www` to
`vibhugolu1997-bit.github.io`. Verify the domain under GitHub profile Settings → Pages with
the `_github-pages-challenge-vibhugolu1997-bit` TXT record, then tick **Enforce HTTPS** in
this repository's Pages settings once the certificate is issued.

&copy; 2026 Vaibhav Singh. All rights reserved.
