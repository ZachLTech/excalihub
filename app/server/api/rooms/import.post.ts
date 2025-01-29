import { getServerSession } from "#auth";

/* 
    Body Structure:
    {
        name: '',
        description: '',
        thumbnail: '',
        excalidrawUrl: ''
    }
*/

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

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage:
                "The provided user does not exist.",
        });
    }

    const newData: any = {
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

    if (body.excalidrawUrl) {
        newData.excalidrawUrl = body.excalidrawUrl;
    } else {
        throw createError({
            statusCode: 401,
            statusMessage:
                "A room URL is required for importing but wasn't provided.",
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
    
    const newRoom = await event.context.prisma.room.create({
        data: newData
    });

    return newRoom;
});
