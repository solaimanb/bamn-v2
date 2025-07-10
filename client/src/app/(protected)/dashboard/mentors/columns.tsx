"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MentorResponse } from "@/types/api";
import { Check, MoreHorizontal, X } from "lucide-react";
import { approveMentor, rejectMentor } from "@/lib/adminApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMentors } from "@/hooks/useMentors";
import { toast } from "sonner";
import { useState } from "react";

type StatusAction = {
  type: 'approve' | 'reject';
  mentorId: string;
  mentorName: string;
} | null;

export const columns: ColumnDef<MentorResponse>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "institution",
    header: "Institution",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const mentor = row.original;
      return `${mentor.city}, ${mentor.country}`;
    },
  },
  {
    accessorKey: "moderation_status",
    header: "Status",
    cell: ({ row }) => {
      const MentorStatusCell = () => {
        const mentor = row.original;
        const [pendingAction, setPendingAction] = useState<StatusAction>(null);
        const { updateMentorStatus } = useMentors();

        const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
          try {
            await updateMentorStatus(
              mentor.id,
              status,
              async () => {
                if (status === 'approved') {
                  await approveMentor(mentor.id);
                  toast.success(`${mentor.full_name} has been approved as mentor`);
                } else {
                  await rejectMentor(mentor.id);
                  toast.success(`${mentor.full_name}'s mentor application has been rejected`);
                }
              }
            );
          } catch (error) {
            console.error('Failed to update mentor status:', error);
            toast.error(`Failed to update ${mentor.full_name}'s status`);
          }
          setPendingAction(null);
        };

        return (
          <div className="flex items-center gap-2">
            <Badge variant={mentor.moderation_status === "approved" ? "default" : "secondary"}>
              {mentor.moderation_status.charAt(0).toUpperCase() + mentor.moderation_status.slice(1)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setPendingAction({ type: 'approve', mentorId: mentor.id, mentorName: mentor.full_name })}
                  disabled={mentor.moderation_status === 'approved'}
                >
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setPendingAction({ type: 'reject', mentorId: mentor.id, mentorName: mentor.full_name })}
                  disabled={mentor.moderation_status === 'rejected'}
                  className="text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={!!pendingAction} onOpenChange={(open: boolean) => !open && setPendingAction(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {pendingAction?.type === 'approve' ? 'Approve Mentor Application' : 'Reject Mentor Application'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {pendingAction?.type === 'approve' 
                      ? `Are you sure you want to approve ${pendingAction.mentorName} as a mentor? They will be able to access the platform and connect with mentees.`
                      : `Are you sure you want to reject ${pendingAction?.mentorName}'s application? This action cannot be undone.`
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleStatusUpdate(pendingAction?.type === 'approve' ? 'approved' : 'rejected')}
                    className={pendingAction?.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {pendingAction?.type === 'approve' ? 'Approve' : 'Reject'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      };

      return <MentorStatusCell />;
    },
  },
]; 