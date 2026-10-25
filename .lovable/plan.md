# Item pictures and shorter descriptions in Recent submissions

## What changes
1. **Recyclable items found:** After a video is reviewed, the AI draws a clean picture of the recyclable item(s) it found (for example "3 plastic bottles and 1 can"). That picture becomes the submission's image, replacing the video still frame.
2. **Only garbage found:** If every item found is non-recyclable (trash or compost), the image is a garbage bin icon.
3. **Nothing found:** The image is the recycling symbol, as now.
4. **Descriptions:** "No points were awarded" (and "so no points were awarded") is removed from descriptions, since 0 points already shows. This also applies to older submissions when displayed.

If drawing the picture fails, the submission still saves and shows the icon that fits it.

## Technical details
- New authenticated server function `generateSubmissionImage({id})`: loads the caller's own submission result, builds a prompt from items with points > 0 (object + quantity, plain studio-style product shot, no text), calls the gateway image endpoint with `openai/gpt-image-2.5-sunburst` (non-streaming, small size), uploads the PNG/JPEG to `submission-thumbnails/<userId>/<id>.jpg` with the admin client, and sets `thumbnail_path`. Skips when no eligible items.
- Client in rewards.tsx: drop the video-frame capture and `saveThumbnail` call; call the new function after verification, then refresh the list. Remove `best_frame_*` from the AI schema/prompt.
- Image choice per row: thumbnail if present; else items exist and none eligible → `Trash2` icon; else `Recycle` icon.
- reward-rules.ts: remove the "no points were awarded" phrases from `resolveBin` reasons; add a `stripNoPoints()` helper applied when rendering summaries (covers old rows). Update tests asserting those strings.
