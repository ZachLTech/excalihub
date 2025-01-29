import { getServerSession } from "#auth";

export default eventHandler(async (event) => {
	const session = await getServerSession(event);

	if (!session) {
		throw createError({
			statusCode: 401,
			statusMessage: "You are not authorized to call this API.",
		});
	}

	const userEmail = session.user?.email as string | undefined;

	await event.context.prisma.user.delete({
		where: {
			email: userEmail,
		},
	});
});
