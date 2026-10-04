MODRYVA site

Open index.html to preview locally.
Files:
- index.html: home page
- order.html: mod request form (opens user's email app to modryva.mod@gmail.com)
- profile.html: profile/login mockup
- styles.css: design
- app.js: RU/EN switching and interactions
- assets/: logo and transparent character

Free deployment suggestion:
1. Create a GitHub repository called modryva-site.
2. Upload all files from this folder to the repository root.
3. In Cloudflare: Workers & Pages -> Create -> Pages -> Connect to Git.
4. Choose the repository.
5. Framework preset: None. Build command: leave blank. Output directory: / (or leave blank when accepted).
6. Deploy. Cloudflare will give a free *.pages.dev address.
