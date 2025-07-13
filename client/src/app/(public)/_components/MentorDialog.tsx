import { X, MapPin, Mail, ArrowRight } from 'lucide-react'
import { Mentor } from '@/types/mentor';
import { GlobeVisualization } from '@/types/api';
import Link from 'next/link';

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

type MentorLocation = Mentor | GlobeVisualization;

interface MentorDialogProps {
    selectedMentor: MentorLocation | null;
    setSelectedMentor: (mentor: MentorLocation | null) => void;
    isLoading?: boolean;
}

const MentorDialog: React.FC<MentorDialogProps> = ({ selectedMentor, setSelectedMentor, isLoading = false }) => {
    const isFullMentor = selectedMentor && 'email' in selectedMentor;
    const showSkeleton = !isFullMentor || isLoading;

    return (
        <Dialog open={!!selectedMentor} onOpenChange={(open: boolean) => !open && setSelectedMentor(null)}>
            <DialogContent className="max-w-md p-0 bg-gray-950 border-slate-800 text-white">
                {selectedMentor && (
                    <Card className="border-0 bg-transparent relative">
                        <Button
                            size="icon"
                            onClick={() => setSelectedMentor(null)}
                            className="absolute right-2 top-2 z-10 h-6 w-6 rounded-sm border-none bg-red-500 hover:bg-red-600 transition-colors"
                        >
                            <X size={20} />
                        </Button>

                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 bg-indigo-500">
                                    <AvatarFallback className="text-2xl font-bold">
                                        {selectedMentor.full_name.split(' ')[0][0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-xl font-bold text-white mb-1 leading-tight">
                                        {selectedMentor.full_name}
                                    </DialogTitle>
                                    {showSkeleton ? (
                                        <>
                                            <Skeleton className="h-4 w-3/4 bg-slate-800 mb-2" />
                                            <Skeleton className="h-4 w-1/2 bg-slate-800" />
                                        </>
                                    ) : (
                                        <>
                                            {selectedMentor.current_role && (
                                                <p className="text-slate-300 mb-1 text-sm">{selectedMentor.current_role}</p>
                                            )}
                                            {selectedMentor.department && (
                                                <p className="text-gray-400 text-xs leading-relaxed">{selectedMentor.department}</p>
                                            )}
                                            {selectedMentor.institution && (
                                                <p className="text-gray-400 text-xs leading-relaxed">{selectedMentor.institution}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <Separator className="bg-slate-800" />

                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">ABOUT</h3>
                                    {showSkeleton ? (
                                        <Skeleton className="h-20 w-full bg-slate-800" />
                                    ) : (
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {`Dr. is a ${selectedMentor.current_role} at ${selectedMentor.institution}. Their research focuses on advanced topics with real-world applications.`}
                                        </p>
                                    )}
                                </div>

                                <Separator className="bg-slate-800" />

                                <div>
                                    <h3 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">RESEARCH KEYWORDS</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMentor.research_interests.map((interest, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-slate-800 hover:bg-slate-800 text-gray-300 border-0"
                                            >
                                                {interest}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="bg-slate-800" />

                                <div className="grid grid-cols-2 gap-6">
                                    {showSkeleton ? (
                                        <>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">LOCATION</p>
                                                <Skeleton className="h-6 w-full bg-slate-800" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">EMAIL</p>
                                                <Skeleton className="h-6 w-full bg-slate-800" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {selectedMentor.city && (
                                                <div>
                                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">LOCATION</p>
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm">
                                                            {`${selectedMentor.city}, ${selectedMentor.country}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedMentor.email && (
                                                <div>
                                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">EMAIL</p>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        <a
                                                            href={`mailto:${selectedMentor.email}`}
                                                            className="text-blue-500 hover:text-blue-400 transition-colors text-sm break-all"
                                                        >
                                                            {selectedMentor.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button
                                asChild
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                size="lg"
                            >
                                <Link href={`/mentors/${selectedMentor.id}`}>
                                    View Full Profile
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default MentorDialog;