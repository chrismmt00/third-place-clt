# Public site photography

Selected September 30, 2026 at the user's request for free images that fit the
conversation café. These are illustrative stock photographs, not photographs of
Third Place members or events. Visible captions credit each photographer and
identify the images as stock; alt text describes the scene without claiming an
affiliation. Actual event photos remain controlled by the event editor.

All three source pages identify their photos as free to use under the
[Pexels License](https://www.pexels.com/license/). The license allows free personal
and commercial website use and modification, with attribution optional. It does
not allow implied endorsement by pictured people or brands, offensive depictions,
unaltered resale, stock-platform redistribution, or use as a trademark.

| Placement | Local asset | Photographer and source |
| --- | --- | --- |
| Home hero | `public/images/cafe-conversation.jpg` | [John Diez, photo 7388862](https://www.pexels.com/photo/diverse-friends-sitting-at-cafe-table-7388862/) |
| Home third-place section | `public/images/shared-coffee.jpg` | [Mikhail Nilov, photo 8351179](https://www.pexels.com/photo/people-holding-mugs-8351179/) |
| About introduction | `public/images/table-conversation.jpg` | [Ketut Subiyanto, photo 4670707](https://www.pexels.com/photo/people-at-the-table-holding-ceramic-mugs-4670707/) |

Downloaded from the corresponding `images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg`
URLs using `auto=compress&cs=tinysrgb&w=1600&q=85` (1200px for the portrait coffee
photo). Files are served from this application, without runtime stock-provider
requests. Next Image supplies responsive sizes and lazy loading below the fold;
the hero images load eagerly. Existing aspect ratios and security headers remain
in place. Update `src/content/photos.js` when replacing these with client photos.
