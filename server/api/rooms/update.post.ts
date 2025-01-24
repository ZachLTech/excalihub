import { getServerSession } from "#auth";
import { Room } from "@prisma/client";
import { hash } from "bcrypt";

/* 
    Body Structure:
    {
        roomID: '',
        name: '',
        description: '',
        roomType: '',
        status: '',
        excalidrawUrl: '',
        readOnlyUrl: ''
    }
*/

type RoomUpdateInput = Partial<
    Pick<Room, "name" | "description" | "roomType" | "status" | "excalidrawUrl" | "readOnlyUrl">
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

    if (body.roomType && body.roomType != room.roomType && (body.roomType == 'NORMAL' || body.roomType == 'TEMPLATE' || body.roomType == 'TEMPORARY')) {
        updateData.roomType = body.roomType;
    }

    if (body.roomType && body.roomType != room.roomType && (body.roomType == 'LIVE' || body.roomType == 'LOCAL' || body.roomType == 'TEMPORARY')) {
        updateData.roomType = body.roomType;
    }

    if (body.website && body.website != user?.website) {
        updateData.website = body.website;
    }

    const updatedUser = await event.context.prisma.user.update({
        where: {
            email: userEmail as string | undefined,
        },
        data: updateData,
    });

    return updatedUser;
});
