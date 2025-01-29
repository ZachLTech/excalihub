import { getServerSession } from "#auth";

/* 
    Body Structure:
    {
        roomID: ''
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

    if (!room) {
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

    await event.context.prisma.room.delete({
        where: {
            id: room.id,
        }
    });
});
