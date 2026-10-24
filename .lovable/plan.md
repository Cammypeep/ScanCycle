# Better bin recognition for video rewards

## Why your test failed
- Your country is already sent to the AI, but the instructions tell it that bin color alone is not enough. It needs a visible label, so a plain grey bin is marked "uncertain" and earns no points.
- The AI only counts drops into recycling bins. A Goldfish wrapper usually isn't recyclable, so the grey trash bin was actually the right choice, but the AI had no way to count that.

## What to change
1. **Country bin guide.** Add a built-in list of common bin colors for each supported country (for example, US: blue = recycling, grey/black = trash, green = compost). Give this list to the AI so it can judge a bin by its color when there is no label.
2. **"Which bin is this?" picker.** Before uploading, the user picks the bin they're using from their country's list. The AI checks that the video matches the pick instead of guessing.
3. **Count right-bin drops, not just recycling.** Putting non-recyclable trash in the trash bin also counts as correct and earns 10 points.
4. **Clearer reasons.** When the AI is unsure, it says why (for example "bin not visible" or "item hidden by your hand") and gives one filming tip.
5. **Filming tips** above the upload button: show the bin and the item before dropping it, keep the camera steady, and use good light.
6. **Stronger checking.** Use a more capable video model for the final decision.

## Technical details
- New `src/lib/bin-guides.ts`: country code to a list of {color, stream: recycling|trash|compost|glass|paper, label}, with a generic fallback.
- `verifyVideo` input gets `binChoice`. The prompt includes the country guide plus the user's pick, color counts as evidence when it matches the guide, and the outcome gets a `reason` field.
- Rewards page: a bin picker and tips panel, plus a reason shown on uncertain items.
- Update tests in `reward-rules.test.ts`: a trash item in the trash bin counts, an uncertain item earns 0, and 10 points per correct item stays the same.
