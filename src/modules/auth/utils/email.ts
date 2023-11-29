// email.ts
export const sendEmailVerificationLink = async (email: string, token: string) => {
	const url = `http://localhost:3000/email-verification/${token}`;
	await sendEmail(email, {
		// ...
	});
};

function sendEmail(email: any, arg1: {}) {
    throw new Error("Function not implemented.");
}
