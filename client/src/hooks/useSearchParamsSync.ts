'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSearchStore, SearchParams } from '@/store/searchStore';
import { isEqual } from 'lodash';

interface SearchStoreState {
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
}

const selectSearchParams = (state: SearchStoreState) => state.searchParams;
const selectSetSearchParams = (state: SearchStoreState) => state.setSearchParams;

export function useSearchParamsSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const storeParams = useSearchStore(selectSearchParams);
  const setSearchParams = useSearchStore(selectSetSearchParams);

  const isUpdatingFromURL = useRef(false);
  const isUpdatingFromStore = useRef(false);
  const isInitialMount = useRef(true);
  const prevStoreParams = useRef(storeParams);
  const prevURLParams = useRef(searchParams?.toString());

  // Initialize store from URL on mount and when URL changes
  useEffect(() => {
    if (isUpdatingFromStore.current) return;

    const currentURLParams = searchParams?.toString();
    if (currentURLParams === prevURLParams.current && !isInitialMount.current) return;
    prevURLParams.current = currentURLParams;

    const params: SearchParams = {};

    const keyword = searchParams?.get('keyword') ?? null;
    const tags = searchParams?.get('tags') ?? null;
    const continent = searchParams?.get('continent') ?? null;
    const country = searchParams?.get('country') ?? null;
    const city = searchParams?.get('city') ?? null;

    if (keyword) params.keyword = keyword;
    if (tags) params.tags = tags.split(',');
    if (continent) params.continent = continent;
    if (country) params.country = country;
    if (city) params.city = city;

    // Only update store if params are different
    if (!isEqual(params, storeParams)) {
      isUpdatingFromURL.current = true;
      setSearchParams(params);
      isUpdatingFromURL.current = false;
    }

    // Clear initial mount flag after first sync
    isInitialMount.current = false;
  }, [searchParams, setSearchParams, storeParams]);

  // Update URL when store changes, but only if URL doesn't match store
  useEffect(() => {
    if (isUpdatingFromURL.current || isInitialMount.current) return;

    // Skip if store params haven't changed
    if (isEqual(prevStoreParams.current, storeParams)) return;
    prevStoreParams.current = storeParams;

    const currentParams = new URLSearchParams(searchParams?.toString() || '');
    const newParams = new URLSearchParams();

    if (storeParams.keyword) newParams.set('keyword', storeParams.keyword);
    if (storeParams.tags?.length) newParams.set('tags', storeParams.tags.join(','));
    if (storeParams.continent) newParams.set('continent', storeParams.continent);
    if (storeParams.country) newParams.set('country', storeParams.country);
    if (storeParams.city) newParams.set('city', storeParams.city);

    // Only update URL if params are different
    if (currentParams.toString() !== newParams.toString()) {
      isUpdatingFromStore.current = true;
      const search = newParams.toString();
      const query = search ? `?${search}` : '';
      router.replace(`${pathname}${query}`);
      isUpdatingFromStore.current = false;
    }
  }, [storeParams, pathname, router, searchParams]);
} 