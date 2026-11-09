'use client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { staticClient } from 'fumadocs-core/search/client/orama-static';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { searchTagOfPath } from '@/lib/versions';
import { basePath } from '@/lib/shared';

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n(); // (optional) for i18n
  // Search only the docs version being read, and load only its index
  // (app/api/search/[tag]/route.ts).
  const tag = searchTagOfPath(usePathname());
  const client = useMemo(
    () => staticClient({ locale, from: `${basePath}/api/search/${tag}` }),
    [locale, tag],
  );
  // The version is a dependency too: switching versions in the dropdown is a
  // client-side navigation, and without it the dialog keeps the previous
  // version's index.
  const { search, setSearch, query } = useDocsSearch({ client }, [tag]);

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
