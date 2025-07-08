'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Heart, Menu, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export function Header() {
    const { user, logout, isMentor, loading } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="container mx-auto bg-background">
            <div className="container flex h-16 items-center justify-between gap-4">
                <Link href="/" className="flex-shrink-0">
                    <span className="text-xl font-bold">BAMN</span>
                </Link>

                <div className="flex-1 max-w-2xl relative">
                    <div className="relative">
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-full pl-10 rounded-full"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    {!loading && !user && (
                        <Link href="/mentor-registration" className="hidden sm:block">
                            <Button variant="ghost" size="sm">
                                Become a mentor
                            </Button>
                        </Link>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <span className="sr-only">Toggle menu</span>
                                <Menu size={24} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72 rounded-2xl">
                            <div className="p-2">
                                {loading ? (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        Loading...
                                    </div>
                                ) : !user ? (
                                    <>
                                        <DropdownMenuItem asChild className="flex flex-col items-start rounded-md focus:bg-accent">
                                            <Link href="/mentor-registration" className="w-full">
                                                <div className="flex items-start gap-3 p-2">
                                                    <div className="rounded-md bg-primary/10 p-2">
                                                        <Heart className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 min-h-[2.5rem] justify-center">
                                                        <div className="font-medium text-sm">Become a mentor</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Share your knowledge and guide others on their journey to success.
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="my-2" />

                                        <DropdownMenuItem asChild className="rounded-md focus:bg-accent">
                                            <Link href="/login" className="w-full">
                                                <div className="p-2 text-sm">Log in or sign up</div>
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        {!isMentor() && (
                                            <DropdownMenuItem asChild className="flex flex-col items-start rounded-md focus:bg-accent">
                                                <Link href="/mentor-registration" className="w-full">
                                                    <div className="flex items-start gap-3 p-2">
                                                        <div className="rounded-md bg-primary/10 p-2">
                                                            <Heart className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5 min-h-[2.5rem] justify-center">
                                                            <div className="font-medium text-sm">Become a mentor</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Share your knowledge and guide others on their journey to success.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem asChild className="rounded-md focus:bg-accent">
                                            <Link href="/dashboard" className="w-full">
                                                <div className="p-2 text-sm">Dashboard</div>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="my-2" />

                                        <DropdownMenuItem
                                            className="rounded-md focus:bg-accent cursor-pointer"
                                            onClick={handleLogout}
                                        >
                                            <div className="flex items-center gap-2 p-2 text-sm text-red-600">
                                                <LogOut className="h-4 w-4" />
                                                <span>Log out</span>
                                            </div>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
} 