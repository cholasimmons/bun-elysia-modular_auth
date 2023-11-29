export function validateEmail(email: string){
    if(typeof email !== "string" ||
        email.length < 8 || email.length > 128){
        return false
    }

    const emailRegexp = /^.+@.+$/; // [one or more character]@[one or more character]
	return emailRegexp.test(email);
}

export function validatePassword(password: string){
    if (
        typeof password !== "string" ||
        password.length < 6 || password.length > 32
    ) { return false; }

    return true;
}