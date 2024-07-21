"use server";
import { RoomData } from "@liveblocks/node";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { liveblocks } from "../liveblocks";
import { getAccessType, parseStringify } from "../utils";
import { redirect } from "next/navigation";

export const createDocument = async ({
  userId,
  email,
}: CreateDocumentParams) => {
  const roomId = randomUUID();

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: "Untitled",
    };

    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
    });

    revalidatePath("/");

    return parseStringify<RoomData>(room);
  } catch (error) {
    console.error("Error creating document: ", error);
    throw error;
  }
};

export const getDocument = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    if (!hasAccess) {
      throw new Error("You don't have access to this document");
    }

    return parseStringify<RoomData>(room);
  } catch (error) {
    console.error("Error fetching document: ", error);
    throw error;
  }
};

export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });

    revalidatePath(`document/${roomId}`);

    return parseStringify<RoomData>(updatedRoom);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

export const getDocuments = async (email: string) => {
  try {
    const rooms = await liveblocks.getRooms({ userId: email });

    // const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    // if (!hasAccess) {
    //   throw new Error("You don't have access to this document");
    // }

    return parseStringify<{
      nextPage: string | null;
      nextCursor: string | null;
      data: RoomData[];
    }>(rooms);
  } catch (error) {
    console.error("Error fetching document: ", error);
    throw error;
  }
};

export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    };

    const room = await liveblocks.updateRoom(roomId, {
      usersAccesses,
    });

    if (room) {
      const notificationId = randomUUID();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: "$documentAccess",
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email,
        },
        roomId,
      });
    }

    revalidatePath(`document/${roomId}`);

    return parseStringify(room);
  } catch (error) {
    console.error("Error updating document access: ", error);
    throw error;
  }
};

export const removeCollaborator = async ({
  roomId,
  email,
}: {
  roomId: string;
  email: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email === email) {
      throw new Error("You can't remove the owner of the document");
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null,
      },
    });

    revalidatePath(`document/${roomId}`);

    return parseStringify(updatedRoom);
  } catch (error) {
    console.error("Error removing collaborator: ", error);
    throw error;
  }
};

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);

    revalidatePath("/");

    redirect("/");
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
};
