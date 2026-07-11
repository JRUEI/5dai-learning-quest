# 5DAI Learning Quest

Personal learning-progress tracker published as a static GitHub Pages site.

Progress is stored locally when signed out and synchronized through Firebase after Google sign-in.

## Project structure

```text
index.html          Home page
days/day1/          Day 1 page and materials
days/day2/          Day 2 page and materials
days/day3/          Day 3 page
days/day4/          Day 4 page
days/day5/          Day 5 page
css/                Shared site and reader styles
js/                 Shared progress, reader and sync scripts
assets/             Course visuals
templates/          Reusable HTML templates
docs/               Content pipeline documentation
scripts/            Site validation tools
```

Each Day directory uses `index.html` as its landing page. Material pages such as
`assignment.html`, `podcast.html`, and `whitepaper.html` live beside that Day page.
