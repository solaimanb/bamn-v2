'use client';

import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Tag, Globe, X } from 'lucide-react';
import { listMentors } from '@/lib/mentorApi';
import { useDebounce } from '@/hooks/useDebounce';
import { MentorResponse, MentorFilters } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Mentor } from '@/types/mentor';
import { useSearchStore } from '@/store/searchStore';

interface LocationFilter {
    continent?: string;
    country?: string;
    city?: string;
}

const convertToMentor = (response: MentorResponse): Mentor => ({
    ...response,
    linkedin_url: null, // These fields are not in the API response
    profile_picture_url: null // but required by the Mentor type
});

export function SearchBar() {
    const setMentors = useSearchStore(state => state.setMentors);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState<LocationFilter>({});
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedTags, locationFilter]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tagPrefix = searchTerm.startsWith('#') ? searchTerm.slice(1) : searchTerm;
                const response = await fetch(`/api/v1/tags/suggest?prefix=${tagPrefix}`);
                const tags = await response.json();
                setTagSuggestions(tags.filter((tag: string) => !selectedTags.includes(tag)));
            } catch (error) {
                console.error('Failed to fetch tag suggestions:', error);
            }
        };

        if (searchTerm.startsWith('#')) {
            fetchTags();
        }
    }, [searchTerm, selectedTags]);

    useEffect(() => {
        let mounted = true;

        const searchMentors = async () => {
            const hasSearchCriteria = Boolean(
                debouncedSearch ||
                selectedTags.length > 0 ||
                Object.values(locationFilter).some(Boolean)
            );

            if (!hasSearchCriteria) {
                console.log('No search criteria, clearing results');
                setMentors([]);
                return;
            }

            try {
                const searchFilters: MentorFilters = {
                    keyword: debouncedSearch.startsWith('#') ? undefined : debouncedSearch || undefined,
                    research_interests: selectedTags.length > 0 ? selectedTags : undefined,
                    ...locationFilter
                };

                console.log('Searching with filters:', searchFilters);

                const result = await listMentors({
                    ...searchFilters,
                    page,
                    page_size: PAGE_SIZE
                });

                console.log('API Response:', {
                    total: result.total,
                    items: result.items.map(m => ({
                        id: m.id,
                        name: m.full_name,
                        location: `${m.city}, ${m.country}`,
                        coordinates: [m.latitude, m.longitude]
                    }))
                });

                if (mounted) {
                    const convertedMentors = result.items.map(convertToMentor);
                    console.log('Converted mentors for globe:', convertedMentors.map(m => ({
                        id: m.id,
                        name: m.full_name,
                        location: `${m.city}, ${m.country}`,
                        coordinates: [m.latitude, m.longitude]
                    })));
                    setMentors(convertedMentors);
                }
            } catch (error) {
                console.error('Search failed:', error);
                if (mounted) {
                    setMentors([]);
                }
            }
        };

        searchMentors();

        return () => {
            mounted = false;
        };
    }, [debouncedSearch, selectedTags, locationFilter, page, PAGE_SIZE, setMentors]);

    const addTag = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
            setSearchTerm('');
        }
    };

    const removeTag = (tag: string) => {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    };

    const updateLocationFilter = (key: keyof LocationFilter, value: string | undefined) => {
        setLocationFilter(prev => {
            const newFilter = { ...prev, [key]: value };
            if (!value) {
                if (key === 'continent') {
                    newFilter.country = undefined;
                    newFilter.city = undefined;
                } else if (key === 'country') {
                    newFilter.city = undefined;
                }
            }
            return newFilter;
        });
    };

    return (
        <div className="relative w-full">
            <Command className="rounded-full border bg-white/80 backdrop-blur-sm shadow-[0_8px_16px_rgb(0_0_0_/_0.08)] overflow-visible">
                <div className="w-full px-4 py-2">
                    <CommandInput
                        placeholder="Search mentors.."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className="w-full placeholder:text-muted-foreground/60 text-base border-none focus:border-none focus:ring-0"
                    />
                </div>
                <CommandList className="max-h-[300px] overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {(selectedTags.length > 0 || Object.values(locationFilter).some(Boolean)) && (
                        <>
                            <CommandGroup>
                                <div className="flex flex-wrap gap-1.5 p-3">
                                    {selectedTags.map(tag => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                                        >
                                            <Tag className="h-3.5 w-3.5" />
                                            {tag}
                                            <X
                                                className="h-3.5 w-3.5 cursor-pointer hover:text-destructive transition-colors"
                                                onClick={(e: MouseEvent) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    removeTag(tag);
                                                }}
                                            />
                                        </Badge>
                                    ))}
                                    {Object.entries(locationFilter).map(([key, value]) => (
                                        value && (
                                            <Badge
                                                key={key}
                                                variant="outline"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                <Globe className="h-3.5 w-3.5" />
                                                {value}
                                                <X
                                                    className="h-3.5 w-3.5 cursor-pointer hover:text-destructive transition-colors"
                                                    onClick={(e: MouseEvent) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        updateLocationFilter(key as keyof LocationFilter, undefined);
                                                    }}
                                                />
                                            </Badge>
                                        )
                                    ))}
                                </div>
                            </CommandGroup>
                            <CommandSeparator className="bg-border/50" />
                        </>
                    )}
                    {searchTerm.startsWith('#') && tagSuggestions.length > 0 && (
                        <CommandGroup>
                            {tagSuggestions.map(tag => (
                                <div
                                    key={tag}
                                    className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors"
                                    onClick={() => addTag(tag)}
                                >
                                    <div className="bg-primary/10 rounded-md p-1.5">
                                        <Tag className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">{tag}</span>
                                </div>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </div>
    );
} 