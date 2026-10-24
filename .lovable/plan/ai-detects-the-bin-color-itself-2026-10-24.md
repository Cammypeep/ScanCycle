# AI detects the bin color itself

## What changes for you
- **No more "Which bin?" menu.** You just upload the video. The AI looks at the bin, names its color, and looks that color up in your country's bin guide.
- **Color decides the bin type.** If the color is in your country's guide (for example US grey = trash), the AI treats that bin as that type. Then it checks whether the item belongs there. Right bin earns 10 points, wrong bin earns 0 and says which bin to use.
- **Color not used in your country.** If the color isn't in your country's guide (for example a grey bin in Australia), you get 0 points and the message: "Grey bins aren't a standard bin color in Australia, so we can't tell what this bin is for. No points were awarded."
- **A printed label still wins.** If the bin clearly says "Recycling" or "Trash", the AI goes by the label, whatever the color.
- **Countries without a color guide** (anything outside US, Canada, UK, Germany, Australia, India, China): the AI needs a visible label. Without one, the result says the bin couldn't be identified for your country.
- Each result shows the bin color the AI saw and what that color means in your country.

## Technical details
- `rewards.functions.ts`: drop `binId` input. The prompt passes the country guide as color to stream pairs and asks the model to return `binColor`, `binStream` (a guide stream, or `unrecognized_color` / `not_visible`), and `binReason` alongside items.
- Server-side enforcement in `reward-rules.ts`: map the detected color through `binsFor(country)` again. If the color is not in the guide and there is no label, force all items to `uncertain` with the "color not meaningful in {country}" guidance, so the model can't award points on its own.
- `rewards.tsx`: remove the bin picker, keep filming tips, and show the detected bin and its meaning on the result card.
- Tests: a color outside the guide gives 0 points (Australia + grey). A color in the guide plus a correct item gives 10 (US + grey + wrapper). A labeled bin overrides the color.
