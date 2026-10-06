# Orthoc — medical & healthcare website

A static rebuild of the [ThemeWagon Orthoc](https://themewagon.github.io/orthoc/index.html) template using
**plain HTML, CSS and vanilla JavaScript only**. No Bootstrap, no jQuery, no build step, no dependencies — the
grid, hamburger menu, hero slider, testimonial carousel, icons and form validation are all hand written.

## Files

```
orthoc/
├── index.html          Home: hero slider, departments, about, doctors, contact, testimonial
├── about.html          About Us
├── departments.html    Our Departments
├── doctors.html        Our Doctors
├── contact.html        Get In Touch
├── css/style.css       Shared stylesheet (layout, theme, animations)
├── js/main.js          Shared behaviour (nav, carousels, reveal, form validation)
├── images/             Reference images (hero-bg.png, s1–s4.png, d1–d3.jpg, about-img.jpg, client.jpg)
└── README.md
```

Open `index.html` directly in a browser — every path is relative, so it also works over `file://`.

## What the theme does

* **Hero slider** — 3 slides, autoplay (6.5s) with dot indicators, swipe, arrow keys, pause on hover/focus/tab-hidden.
* **Testimonial carousel** — 3 slides with previous/next buttons and autoplay.
* **Mobile menu** — hamburger below 992px, closes on link click, `Escape` or resize.
* **Nav search** — the reference search icon now toggles a small panel; submitting shows a demo notice.
* **Scroll reveal** — `IntersectionObserver` slides cards in alternately from left/right and fades headings up.
* **Forms** — client-side validation only. The contact form and newsletter show a demo success message;
  **nothing is sent anywhere**.
* **Missing images** — if an image file is absent, the box shows a soft gradient placeholder instead of a broken icon.
* **Reduced motion** — `prefers-reduced-motion: reduce` disables autoplay and animations.

## Differences from the reference (the ~5%)

Animations where the reference had none (hero text entrance, scroll reveal, card lift + soft shadow, doctor
social icons popping in, button transitions, smooth scroll, navbar shadow on scroll, animated nav underlines),
soft medical-themed colour accents (button gradients, light tint behind departments, radial tint behind
doctors, accent rule under headings), an accessible map placeholder instead of a Google Maps key, inline SVG
icons instead of Font Awesome, working links for the dead `Read More` / `View All` buttons, semantic markup,
`alt` text, ARIA labels and visible focus states.

Brand colours and spacing are unchanged: `#178066`, `#1fab89`, `#62d2a2`, `#fefefe`, `#eeeeee`, Nunito 400/600/700.

## Notes

* Social icons link to the networks' home pages as placeholders — replace `href` values with real profiles.
* The newsletter and contact forms are demos: replace `js/main.js` handlers with your endpoint when you need
  a real backend.
* Layout is responsive from 320px to 1536px with no horizontal scroll; interactive targets are at least 44px.

## Credits

Free HTML Templates — <https://html.design/> · Distributed by
[ThemeWagon](https://themewagon.com/)