# Cake King Bakery

A bakery website with Home, About us, Services, Gallery, Contact us and Enquiry pages.

**How to run:** open `home.html` in a browser (internet is needed for the map and fonts).

**Files:** HTML pages in the root, `css/style.css`, `js/script.js`, `images/`, `robots.txt`, `sitemap.xml`, `documents/`, `Screenshot/`.

## Changelog

### Part 3 - 2 November 2026

**Feedback from Part 2**
- Rewrote the HTML of all six pages so it is valid and consistent: the Gallery stylesheet link was missing its closing `>`, tags were unclosed on Contact, Enquiry and Gallery, there was a stray `</section>` on Services, and `</body>` was missing everywhere.
- Added the viewport meta tag and `lang="en"` to every page so the site is mobile friendly.
- Fixed the menu link `Enquiry.html` to `enquiry.html` so it matches the real filename on case-sensitive servers.
- Updated the footer and nav so all pages share the same header, brand bar and menu.
- (Add the lecturer's specific Part 2 feedback comments here and match each one to the entries above.)

**Interactive elements (JavaScript)**
- Created `js/script.js` and linked it on every page.
- Accordion: FAQ section on about.html (one panel open at a time, animated).
- Modal: "View details" on every menu item on services.html opens a pop-up with the description, price and an Enquire link (closes with X, backdrop click or Esc).
- Mobile hamburger menu, back-to-top button and scroll progress bar.
- Animations and transitions (CSS keyframes plus JavaScript): scroll reveal, card pop-in on filtering, floating logo, typewriter tagline, sprinkles, confetti on successful forms, hover effects. These are switched off for visitors who prefer reduced motion.

**Interactive map**
- contact.html has a Leaflet and OpenStreetMap map with a marker and popup for the bakery, plus a "Show my distance to the bakery" button that uses the visitor's location, draws a line to the bakery and shows the distance in km. A fallback message shows if the map cannot load.

**Gallery lightbox**
- Clicking a gallery image opens a full-screen lightbox with caption, previous and next buttons, arrow keys, Esc to close and click outside to close. It is responsive.

**Dynamic content and search**
- services.html: the search box filters the service cards and the new "Cake and Cupcake Menu", which is built dynamically from a JavaScript array.
- Category filter buttons, a result count, a "no results" message with a reset button, and a sort dropdown (name A-Z, Z-A, price low to high and high to low).

**Forms**
- enquiry.html: all fields validated with JavaScript (name, email, phone format, required fields, date not in the past, people at least 1) with clear error messages. After validation the form shows an estimated cost and whether the chosen date is available. The form has an `action` attribute and the data is submitted with AJAX (`fetch`) without reloading the page, with a message if sending fails.
- contact.html: added phone number and "type of message" fields. After validation the details are compiled into an email addressed to CakeKingBakery@gmail.com (shown as a preview) with an "Open email to send" button that opens the visitor's email app. The form has an `action` attribute.
- Labels added to all fields and a 300 character counter on text areas.

**SEO**
- Unique, keyword-rich title tag, meta description and meta keywords on every page, plus robots and Open Graph tags.
- Images renamed with descriptive file names (for example `wedding-cake.jpg`, `cupcakes-box.jpg`) and descriptive alt text added.
- Added `robots.txt` and `sitemap.xml`.
- Page speed: lazy loading on images, `preload="none"` on the video, and one shared CSS and JS file.
- Security: `rel="noopener noreferrer"` on links that open a new tab, and all user text is inserted with `textContent` rather than as HTML.
