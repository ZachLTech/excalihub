import { getServerSession } from "#auth";
import { Room } from "@prisma/client";

/* 
    Body Structure:
    {
        name: '',
        description: '',
        thumbnail: '',
        roomType: '',
        status: '',
        excalidrawUrl: '',
        readOnlyUrl: ''
    }
*/

// If readonlyurl, create with that, if excalidrawurl, create with that.

type newRoomInput = Partial<
    Pick<Room, "userId" | "name" | "description" | "thumbnail" | "roomType" | "status" | "excalidrawUrl" | "readOnlyUrl">
>;

export default eventHandler(async (event) => {
    const body = await readBody(event);
    const session = await getServerSession(event);

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: "You are not authorized to call this API.",
        });
    }

    const userEmail = session.user?.email;
    const user = await event.context.prisma.user.findUnique({
        where: {
            email: userEmail as string | undefined,
        },
    });

    if (user && user.frozen) {
        throw createError({
            statusCode: 401,
            statusMessage:
                "You are not authorized to call this API. You account is frozen.",
        });
    } else if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage:
                "The provided user does not exist.",
        });
    }

    const newData: newRoomInput = {
        userId: user.id
    };

    if (body.name) {
        newData.name = body.name;
    } else {
        throw createError({
            statusCode: 401,
            statusMessage:
                "A room name is required but wasn't provided.",
        });
    }

    if (body.description) {
        newData.description = body.description;
    }

    if (body.thumbnail) {
        if (body.thumbnail.length >= 15 * 1024 * 1024) {
            throw createError({
                statusCode: 401,
                statusMessage:
                    "The thumbnail image can't be larger than 15MB",
            });
        }
        newData.thumbnail = body.thumbnail;
    }

    if (body.roomType && (body.roomType == 'NORMAL' || body.roomType == 'TEMPLATE' || body.roomType == 'TEMPORARY')) {
        newData.roomType = body.roomType;
    }

    if (body.status && (body.status == 'LIVE' || body.status == 'LOCAL' || body.status == 'ARCHIVED')) {
        newData.status = body.status;
    }

    if (body.excalidrawUrl) {
        newData.excalidrawUrl = body.excalidrawUrl;
    }

    if (body.readOnlyUrl) {
        newData.readOnlyUrl = body.readOnlyUrl;
    }
    
    const newRoom = await event.context.prisma.room.create({
        data: newData
    });

    return newRoom;
});
