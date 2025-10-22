## Implementation Plan
1. Scaffold `podcast/listensci/index.html` with semantic regions (hero, platform CTA, episode list, footer) and wire the hero to the show-level metadata from `rssfeed.xml` (title, long description, cover art, author attribution) so the page stays current as the feed updates.

2. Create a “Listen on” block that surfaces existing social/publishing URLs from the feed (e.g., SoundOn homepage, Facebook page, YouTube channel) and extend it with verified links for KKBOX, Spotify, and Apple Podcasts so listeners can reach every platform in one place.

3. Add a defer-loaded script that fetches `rssfeed.xml`, parses it with `DOMParser`, and maps each `<item>` to a card showing cover art, episode title, publication date, runtime, rich description, keywords, and primary audio enclosure; format HTML safely (e.g., sanitize descriptions) and provide streaming/download controls per episode.

4. Layer in UX polish: responsive CSS (stack cards on small screens), localized date formatting, anchor links for quick navigation, graceful error/loading states, and structured data (JSON-LD or schema.org) to improve SEO and sharing fidelity.

## Testing
⚠️ Not run (read-only QA scope).
