import { getServerSession } from "#auth";

/* 
    Body Structure:
    {
        roomID: ''
    }
*/

type sessionUser = {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: any;
}

export default eventHandler(async (event) => {
    const body = await readBody(event);
    const session = await getServerSession(event);

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: "You are not authorized to call this API.",
        });
    }

    const user = session.user as sessionUser
    let room

    if (body.roomId) {
        room = await event.context.prisma.room.findUnique({
            where: {
                id: body.roomId,
                userId: user.id
            }
        })
    } else {
        room = await event.context.prisma.room.findMany({
            where: {
                userId: user.id
            }
        })
    }

    return room;
});
