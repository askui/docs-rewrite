import { getLLMText, source } from '@/lib/source';
import { versionOf } from '@/lib/versions';

export const revalidate = false;

export async function GET() {
  // The newest docs version only; older versions are noindex.
  const scan = source
    .getPages()
    .filter((page) => !versionOf(page.slugs))
    .map(getLLMText);
  const scanned = await Promise.all(scan);

  return new Response(scanned.join('\n\n'));
}
