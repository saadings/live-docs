"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useToast } from "./ui/use-toast";
import { createDocument } from "@/lib/actions/room.actions";
import { useRouter } from "next/navigation";

const AddDocumentButton = ({ userId, email }: AddDocumentBtnProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const addDocumentHandler = async () => {
    try {
      const room = await createDocument({ userId, email });

      if (room) router.push(`/documents/${room.id}`);
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description:
          error instanceof Error ? error.message : "Failed to create document",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="submit"
      onClick={addDocumentHandler}
      className="gradient-blue flex gap-1 shadow-md"
    >
      <Image src={"/assets/icons/add.svg"} alt="add" width={24} height={24} />
      <p className="hidden sm:block">Start a blank document</p>
    </Button>
  );
};

export default AddDocumentButton;
