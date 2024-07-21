"use client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import UserTypeSelector from "./UserTypeSelector";
import { Button } from "./ui/button";
import {
  removeCollaborator,
  updateDocumentAccess,
} from "@/lib/actions/room.actions";
import { useToast } from "./ui/use-toast";

const Collaborator = ({
  roomId,
  creatorId,
  email,
  user,
  collaborator,
}: CollaboratorProps) => {
  const [userType, setUserType] = useState<UserType>(
    collaborator.userType || "viewer",
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const shareDocumentHandler = async (type: string) => {
    setLoading(true);
    try {
      await updateDocumentAccess({
        roomId,
        email,
        userType: type as UserType,
        updatedBy: user,
      });
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description:
          error instanceof Error
            ? error.message
            : "Error updating document access",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCollaboratorHandler = async (email: string) => {
    setLoading(true);

    try {
      await removeCollaborator({ roomId, email });
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description:
          error instanceof Error
            ? error.message
            : "Error removing collaborator",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="flex items-center justify-between gap-2 py-3">
      <div className="flex gap-2">
        <Image
          src={collaborator.avatar}
          alt={collaborator.name}
          width={36}
          height={36}
          className="size-9 rounded-full"
        />
        <div>
          <p className="line-clamp-1 text-sm font-semibold leading-4 text-white">
            {collaborator.name}
            <span className="text-10-regular pl-2 text-blue-100">
              {loading && "Updating"}
            </span>
          </p>
          <p className="text-sm font-light text-blue-100">
            {collaborator.email}
          </p>
        </div>
      </div>
      {creatorId === collaborator.id ? (
        <p className="text-sm text-blue-100">Owner</p>
      ) : (
        <div className="flex items-center">
          <UserTypeSelector
            userType={userType}
            setUserType={setUserType || "viewer"}
            onClickHandler={shareDocumentHandler}
          />
          <Button
            type="button"
            onClick={() => removeCollaboratorHandler(collaborator.email)}
          >
            Remove
          </Button>
        </div>
      )}
    </li>
  );
};

export default Collaborator;
