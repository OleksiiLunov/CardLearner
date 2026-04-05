"use client";

import { useFormStatus } from "react-dom";

import { deleteListAction } from "@/app/actions/lists";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Deleting..." : "Delete list"}
    </Button>
  );
}

export function DeleteListDialog({ listId, listName }: { listId: string; listName: string }) {
  const deleteAction = deleteListAction.bind(null, listId);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this list?</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${listName}" and all of its items will be permanently removed. This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteAction}>
            <ConfirmDeleteButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
