# Item photos on submissions, recent scans on Scanner, remove History

## What changes
1. **Recycle page – Recent submissions:** Each submission gets a small photo of the item being recycled, taken from your video. The AI picks the moment in the video where the item shows most clearly, and that frame is saved as the photo. Videos are still deleted after review. Only the photo is kept, and only you can see it. Older submissions show a plain recycling icon because their videos are already gone.
2. **Scanner page – Recently scanned:** A new section under the scanner lists your last scans. Each one shows the photo, the item name, and a colored square with the bin name (for example "Blue recycling bin"). Tap a scan to open its full result. This uses the scans already saved on your device, so your past scans will show up.
3. **History tab removed:** The History tab and its page are gone. "Back to history" on a scan result becomes "Back to scanner".

## Technical details
- Video review: add `best_frame_seconds` (number) and `best_frame_video` (index) to the AI JSON schema. After verification the browser still has the files, so it seeks a hidden `<video>` to that time, draws it to a canvas as a ~480px JPEG, and uploads it to a new private `submission-thumbnails` bucket at `<userId>/<submissionId>.jpg`.
- Migration: add a nullable `thumbnail_path text` column to `video_submissions`. Add a small authenticated server function that checks the path belongs to the caller's submission before saving it. Add storage policies so owners can insert and read only files under their own folder.
- Rewards list: batch `createSignedUrls` for the visible rows, render a 64px thumbnail, and fall back to a Recycle icon.
- Scanner: read `loadHistory()` in `useEffect` and show the 6 most recent scans with the image, object name and bin color square (same as ResultView). Link to `/result/$id`.
- Delete `src/routes/_authenticated/history.tsx`, remove its link from SiteChrome, and update the back link in `result.$id.tsx`. The scan storage helpers in `lib/history.ts` stay.
