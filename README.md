# VA Ramaswami, personal site

Next.js + Tailwind + Framer Motion. Five pages, fully static.

| Route | What is on it |
| --- | --- |
| `/` | Hero and the index of everything else |
| `/about` | About, timeline, interests, contact |
| `/achievements` | Award highlights, the two case studies, Tamil and leadership |
| `/projects` | Software you have shipped |
| `/photos` | Photo gallery with a lightbox |

## Run it locally

```bash
npm run dev
```

Then open http://localhost:3000

Do not run `npm run build` while `npm run dev` is running. They share the `.next`
folder and the dev server's styles get wiped. If it happens, stop the server, delete
`.next`, and start `npm run dev` again.

## Change the words

Everything you read on the site lives in **`lib/content.js`**. Edit that file, save,
and the browser updates itself. You do not need to touch anything else.

To add a new app to `/projects`, add an entry to the `software` array. It shows up on
the page and in the command palette (Cmd+K) automatically.

## Add your photos

Drop these files into `public/images/`. The site picks them up automatically. Until
then each slot shows a dashed box naming the exact file it is waiting for, so you can
run the site and copy the paths straight off the screen.

| File | What it should be | Shape |
| --- | --- | --- |
| `portrait.jpg` | A photo of you, on the home page | Square |
| `hero-photo.jpg` | A second photo of you, top of the home page | Portrait, roughly 6:7 |
| `canal-project.jpg` | IDE Maker 2024, trophy or prototype photo | Landscape, roughly 4:3 |
| `vending-project.jpg` | National Design Project, the Minister photo or the prototype | Landscape, roughly 4:3 |
| `tamil-award.jpg` | A Tamil competition certificate | Portrait, roughly 4:5 |
| `leadership.jpg` | CCA leadership certificate or an event photo | Landscape, roughly 16:10 |
| `interests.jpg` | Badminton, arts, anything outside engineering | Wide banner, roughly 21:9 |
| `photo-1.jpg` … `photo-8.jpg` | The eight gallery photos on `/photos` | Mixed, the grid crops them |

`portrait.jpg` is already in place. Captions and alt text for the eight gallery photos
are in the `photos` array in `lib/content.js`, so change those to match whatever you
actually drop in.

Any of `.jpg`, `.png` or `.webp` work. If you use a different extension, update the
matching `src` in `lib/content.js` (projects and gallery) or in the component
(`Hero.jsx`, `HomeIndex.jsx`, `Recognition.jsx`, `Beyond.jsx`).

## Deploy to Vercel (free)

1. Push this folder to a new GitHub repository.
2. Go to vercel.com, sign in with GitHub, click **Add New > Project**.
3. Pick the repo. Vercel detects Next.js on its own, then press **Deploy**.
4. You get a live `.vercel.app` link. A custom domain can be added later in Settings > Domains.
