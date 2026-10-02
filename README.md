# Mouse Scrub Hero

A full-screen hero section where the background video follows your cursor. Move the mouse left or right and the video scrubs to match, so the character turns to look toward the pointer. On touch screens, drag sideways.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run it

Serve the folder with any static server and open it in a browser:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from disk also works in most browsers, but some block video seeking on `file://` URLs.

## How it works

[`js/video-scrub.js`](js/video-scrub.js) maps the pointer's horizontal position to a frame of the video:

- **Mouse / pen:** the left edge of the window is the first frame, the right edge is the last.
- **Touch:** dragging moves the video relative to where your finger started.
- **Smoothing:** movement eases over time, so it runs at the same speed on 60 Hz and 120 Hz screens.
- **Efficient seeking:** it seeks to whole frames only, and waits for each seek to finish before starting the next.
- **Reduced motion:** if the visitor has `prefers-reduced-motion` turned on, smoothing is turned off.

## Project structure

```
index.html            Page markup
css/style.css         Layout and styles
css/fonts.css         @font-face declarations
js/video-scrub.js     Pointer-to-video scrubbing
assets/video/hero.mp4 Scrubbed video (60 fps)
assets/images/        Poster image shown before the video loads
assets/fonts/         Self-hosted fonts
```

## Use your own video

1. Replace `assets/video/hero.mp4` and `assets/images/hero-poster.jpg`.
2. Set `FPS` in `js/video-scrub.js` to your video's frame rate.
3. For smooth scrubbing, encode with a keyframe on every frame (all-intra), for example:

   ```sh
   ffmpeg -i input.mp4 -c:v libx264 -g 1 -crf 20 -an -movflags +faststart hero.mp4
   ```

   Videos with sparse keyframes seek slowly and look choppy when scrubbed.

## License

The code is released under the [MIT License](LICENSE).

The fonts (Inter, Instrument Serif, JetBrains Mono) are licensed separately under the [SIL Open Font License 1.1](https://openfontlicense.org).
