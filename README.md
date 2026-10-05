# Bandar Alharbi — Portfolio

Personal portfolio of Bandar Alharbi, Business Administration graduate from Taif University, Saudi Arabia.

A single page that reads from top to bottom: Introduction, Background (about, experience, education and certifications), Projects, Skills and Contact. The CV opens on its own page (`cv.html`), which shows the PDF on screen and also offers "Open PDF" and "Download PDF".

## Updating the content

All personal information (bio, experience, education, certifications, skills, projects, contact links) lives in one file:
**`profile.js`**. Edit it and the whole site updates.

- **Projects:** fill in `title`, `description` and (optionally) `link` for an item. Items without a title show as "Coming soon."
- **Certifications:** paste a verification URL into `link` to show a "View credential" link.
- **CV:** replace `cv.pdf` with a new file of the same name.

After editing a file, bump its `?v=` number in `index.html` (and `cv.html`) so browsers load the new version.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page |
| `profile.js` | All personal content |
| `site.css` | Styles for both pages (colors and fonts are set at the top) |
| `site.js` | Builds the sections from `profile.js`; menu and scrolling |
| `cv.html`, `cv.js` | The CV page (shows `cv.pdf` with pdf.js) |
| `cv.pdf` | CV |
| `fonts/` | Bricolage Grotesque and Newsreader (SIL Open Font License) |
| `favicon.svg` | Browser tab icon |

No build step: the site is plain HTML, CSS and JavaScript, ready for GitHub Pages. All paths are relative, so it works at `bandar-alharbi.github.io/Bandar-Alharbi/`.
