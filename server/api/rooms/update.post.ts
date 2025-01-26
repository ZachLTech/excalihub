import { getServerSession } from "#auth";
import { Room } from "@prisma/client";

/* 
    Body Structure:
    {
        roomID: '',
        name: '',
        description: '',
        thumbnail: '',
        roomType: '',
        status: '',
        excalidrawUrl: '',
        readOnlyUrl: ''
    }
*/

type RoomUpdateInput = Partial<
    Pick<Room, "name" | "description" | "thumbnail" | "roomType" | "status" | "excalidrawUrl" | "readOnlyUrl">
>;

export default eventHandler(async (event) => {
    const body = await readBody(event);
    const session = await getServerSession(event);

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: "You are not authorized to call this API.",
        });
    } else if (!body.roomID) {
        throw createError({
            statusCode: 401,
            statusMessage: "No room ID is attached to the request body.",
        });
    }

    const userEmail = session.user?.email;
    const user = await event.context.prisma.user.findUnique({
        where: {
            email: userEmail as string | undefined,
        },
    });

    const room = await event.context.prisma.room.findUnique({
        where: {
            id: body.roomID
        }
    })

    if (user && user.frozen) {
        throw createError({
            statusCode: 401,
            statusMessage:
                "You are not authorized to call this API. You account is frozen.",
        });
    } else if (!room) {
        throw createError({
            statusCode: 401,
            statusMessage:
                "The room with your provided ID doesn't exist.",
        });
    } else if (user && user.id != room.userId) {
        throw createError({
            statusCode: 401,
            statusMessage:
                "You don't own this room.",
        });
    }

    const updateData: RoomUpdateInput = {};

    if (body.name && body.name != room.name) {
        updateData.name = body.name;
    }

    if (body.description && body.description != room.description) {
        updateData.description = body.description;
    }

    if (body.thumbnail && body.thumbnail != room.thumbnail) {
        if (body.thumbnail.length >= 15 * 1024 * 1024) {
            throw createError({
                statusCode: 401,
                statusMessage:
                    "The thumbnail image can't be larger than 15MB",
            });
        }
        updateData.thumbnail = body.thumbnail;
    }

    if (body.roomType && body.roomType != room.roomType && (body.roomType == 'NORMAL' || body.roomType == 'TEMPLATE' || body.roomType == 'TEMPORARY')) {
        updateData.roomType = body.roomType;
    }

    if (body.status && body.status != room.status && (body.status == 'LIVE' || body.status == 'LOCAL' || body.status == 'ARCHIVED')) {
        updateData.status = body.status;
    }

    if (body.excalidrawUrl && body.excalidrawUrl != room.excalidrawUrl) {
        updateData.excalidrawUrl = body.excalidrawUrl;
    }

    if (body.readOnlyUrl && body.readOnlyUrl != room.readOnlyUrl) {
        updateData.readOnlyUrl = body.readOnlyUrl;
    }

    const updatedRoom = await event.context.prisma.room.update({
        where: {
            id: room.id,
        },
        data: updateData,
    });

    return updatedRoom;
});
