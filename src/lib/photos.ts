/**
 * Where the site's photographs come from.
 *
 * Files live in src/assets/photos and are found by name, so adding one is
 * dropping a file in that folder - no import to write, nothing to wire up,
 * and no broken build while the picture is still being taken. The glob is
 * eager so Vite resolves the URL at build time and the <img> is in the
 * prerendered HTML; it has to be a literal for Vite to read it statically.
 *
 * Naming: `<name>.jpg`, and `<name>@2x.jpg` for the retina source when
 * there is one. See that folder's README.
 */
const FILES = import.meta.glob("../assets/photos/*.{avif,webp,jpg,jpeg,png}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** Best first: a modern format wins when the same name exists twice. */
const PREFERENCE = ["avif", "webp", "jpg", "jpeg", "png"];

export function photoUrl(name: string, suffix = ""): string | undefined {
  const wanted = `${name}${suffix}`;
  const candidates = Object.entries(FILES)
    .map(([path, url]) => {
      const file = path.split("/").pop() ?? "";
      const dot = file.lastIndexOf(".");
      return { stem: file.slice(0, dot), ext: file.slice(dot + 1).toLowerCase(), url };
    })
    .filter((candidate) => candidate.stem === wanted);
  candidates.sort((a, b) => PREFERENCE.indexOf(a.ext) - PREFERENCE.indexOf(b.ext));
  return candidates[0]?.url;
}

/**
 * Lets a caller lay itself out differently when the picture is missing,
 * rather than leaving an empty frame where one should be - which is the
 * whole reason any of this exists.
 */
export function hasPhoto(name: string): boolean {
  return photoUrl(name) !== undefined;
}
