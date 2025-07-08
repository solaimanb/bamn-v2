'use client';

import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Search, X, Tag, MapPin, Building, Globe, ChevronDown } from 'lucide-react';
import { listMentors } from '@/lib/mentorApi';
import { useDebounce } from '@/hooks/useDebounce';
import { MentorResponse, MentorFilters } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface LocationFilter {
    continent?: string;
    country?: string;
    city?: string;
}

export function SearchBar() {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState<LocationFilter>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mentors, setMentors] = useState<MentorResponse[]>([]);
    const [page, setPage] = useState(1);
    const [totalMentors, setTotalMentors] = useState(0);
    const [hasMore, setHasMore] = useState(false);
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

    // Search effect
    useEffect(() => {
        let mounted = true;

        const searchMentors = async () => {
            const hasSearchCriteria = Boolean(
                debouncedSearch ||
                selectedTags.length > 0 ||
                Object.values(locationFilter).some(Boolean)
            );

            if (!hasSearchCriteria) {
                setMentors([]);
                setTotalMentors(0);
                setHasMore(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const searchFilters: MentorFilters = {
                    keyword: debouncedSearch.startsWith('#') ? undefined : debouncedSearch || undefined,
                    research_interests: selectedTags.length > 0 ? selectedTags : undefined,
                    ...locationFilter
                };

                const result = await listMentors({
                    ...searchFilters,
                    page,
                    page_size: PAGE_SIZE
                });

                if (mounted) {
                    setMentors(prevMentors => 
                        page === 1 ? result.items : [...prevMentors, ...result.items]
                    );
                    setTotalMentors(result.total);
                    setHasMore(result.total > page * PAGE_SIZE);
                }
            } catch (error) {
                console.error('Search failed:', error);
                if (mounted) {
                    setError(error instanceof Error ? error.message : 'Failed to search mentors');
                    setMentors([]);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        searchMentors();

        return () => {
            mounted = false;
        };
    }, [debouncedSearch, selectedTags, locationFilter, page, PAGE_SIZE]);

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

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return (
        <div className="relative w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-start text-left font-normal"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        <div className="flex gap-2 items-center overflow-hidden flex-1">
                            <span className="text-muted-foreground">
                                {(selectedTags.length > 0 || Object.values(locationFilter).some(Boolean)) ? (
                                    <>
                                        Filters: {selectedTags.length + Object.values(locationFilter).filter(Boolean).length} active
                                    </>
                                ) : (
                                    "Search mentors..."
                                )}
                            </span>
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={selectedTags.length > 0 ? "Filter results..." : "Search mentors..."}
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            {(selectedTags.length > 0 || Object.values(locationFilter).some(Boolean)) && (
                                <>
                                    <CommandGroup heading="Active Filters">
                                        <div className="flex flex-wrap gap-1 p-2">
                                            {selectedTags.map(tag => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="flex items-center gap-1 pr-1 hover:bg-secondary/80"
                                                >
                                                    <Tag className="h-3 w-3" />
                                                    {tag}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
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
                                                        className="flex items-center gap-1 pr-1 hover:bg-secondary/80"
                                                    >
                                                        <Globe className="h-3 w-3" />
                                                        {value}
                                                        <X
                                                            className="h-3 w-3 cursor-pointer hover:text-destructive"
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
                                    <CommandSeparator />
                                </>
                            )}
                            {searchTerm.startsWith('#') && tagSuggestions.length > 0 && (
                                <CommandGroup heading="Research Interests">
                                    {tagSuggestions.map(tag => (
                                        <CommandItem
                                            key={tag}
                                            onSelect={() => addTag(tag)}
                                            className="flex items-center gap-2"
                                        >
                                            <Tag className="h-4 w-4" />
                                            {tag}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                            {loading && page === 1 ? (
                                <CommandGroup>
                                    <CommandItem>Loading...</CommandItem>
                                </CommandGroup>
                            ) : error ? (
                                <CommandGroup>
                                    <CommandItem className="text-destructive">{error}</CommandItem>
                                </CommandGroup>
                            ) : mentors.length > 0 ? (
                                <CommandGroup heading={`Found ${totalMentors} mentor(s)`}>
                                    <ScrollArea className="h-[300px]">
                                        {mentors.map(mentor => (
                                            <CommandItem
                                                key={mentor.id}
                                                className="flex flex-col items-start gap-1 p-2"
                                            >
                                                <div className="font-medium">{mentor.full_name}</div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Building className="h-3 w-3" />
                                                    {mentor.institution}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    {mentor.city && `${mentor.city}, `}{mentor.country}
                                                    {mentor.continent && ` (${mentor.continent})`}
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {mentor.research_interests.map(interest => (
                                                        <Badge
                                                            key={interest}
                                                            variant="secondary"
                                                            className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                addTag(interest);
                                                            }}
                                                        >
                                                            {interest}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Separator className="my-2" />
                                            </CommandItem>
                                        ))}
                                        {hasMore && (
                                            <CommandItem
                                                onSelect={loadMore}
                                                className="flex items-center justify-center gap-2 cursor-pointer"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    "Loading more..."
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4" />
                                                        Load more
                                                    </>
                                                )}
                                            </CommandItem>
                                        )}
                                    </ScrollArea>
                                </CommandGroup>
                            ) : null}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
} 